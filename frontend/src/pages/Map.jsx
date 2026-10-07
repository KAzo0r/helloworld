import React, { useState, useEffect } from 'react';
import Map, { NavigationControl, GeolocateControl, Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MOCK_DATA, BUS_ROUTES } from './MapData';
import { getRoute } from '../utils/geo';

// Component to simulate moving buses (ATTO style)
function LiveBuses({ active }) {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    if (!active) return;
    
    // Initialize buses at the start of their paths
    const initialBuses = BUS_ROUTES.map(route => ({
        ...route,
        progress: 0,
        direction: 1, // 1 for forward, -1 for backward
        currentPos: route.path[0]
    }));
    setBuses(initialBuses);

    const interval = setInterval(() => {
        setBuses(current => current.map(bus => {
            let newProgress = bus.progress + (0.05 * bus.direction);
            let newDir = bus.direction;
            
            if (newProgress >= bus.path.length - 1) {
                newProgress = bus.path.length - 1;
                newDir = -1;
            } else if (newProgress <= 0) {
                newProgress = 0;
                newDir = 1;
            }

            const startIndex = Math.floor(newProgress);
            const endIndex = Math.ceil(newProgress);
            const frac = newProgress - startIndex;
            
            const startP = bus.path[startIndex];
            const endP = bus.path[endIndex] || startP;

            // Interpolate position
            const lng = startP[0] + (endP[0] - startP[0]) * frac;
            const lat = startP[1] + (endP[1] - startP[1]) * frac;

            return { ...bus, progress: newProgress, direction: newDir, currentPos: [lng, lat] };
        }));
    }, 1000); // update every second for smoothness

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <>
      {buses.map(bus => (
        <Marker key={bus.id} longitude={bus.currentPos[0]} latitude={bus.currentPos[1]}>
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white animate-pulse">
            🚌 {bus.name.split(' ')[1]}
          </div>
        </Marker>
      ))}
    </>
  );
}

export default function MapPage() {
  const [userLoc, setUserLoc] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 69.240562,
    latitude: 41.311081,
    zoom: 13
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMarker, setSearchMarker] = useState(null);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routePulse, setRoutePulse] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  
  const [layers, setLayers] = useState({
    attractions: true,
    parking: true,
    buses: true,
    metro: true,
    ev: true,
    schools: false,
    hospitals: false,
    bus_stops: true
  });

  // Automatically fetch user location on mount (Auto-Geolocation)
  useEffect(() => {
    const pulseInterval = setInterval(() => setRoutePulse(p => !p), 800);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLoc(loc);
                setViewState(prev => ({ ...prev, longitude: loc.lng, latitude: loc.lat, zoom: 15 }));
            },
            (error) => {
                console.warn("Geolocation failed/blocked, using fallback.");
                const fallbackLoc = { lat: 41.311081, lng: 69.240562 };
                setUserLoc(fallbackLoc);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        setUserLoc({ lat: 41.311081, lng: 69.240562 });
    }
    
    return () => clearInterval(pulseInterval);
  }, []);

  const buildRoute = async (destination) => {
    if (!userLoc) return alert("Локация не определена! Подождите пару секунд.");
    
    try {
        // Fetch REAL route from OSRM
        const path = await getRoute([userLoc.lng, userLoc.lat], [destination.lng, destination.lat]);
        
        if (!path || path.length < 2) {
            alert("Не удалось получить координаты маршрута!");
            return;
        }

        const geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: path
                }
            }]
        };
        setRouteData(geojson);
        setSelectedMarker(null); // close popup
        
        // Center the camera on the route midpoint and zoom out so the entire path is visible
        const midLng = (userLoc.lng + destination.lng) / 2;
        const midLat = (userLoc.lat + destination.lat) / 2;
        // Calculate approximate zoom based on distance (very rough estimate)
        const dLat = Math.abs(userLoc.lat - destination.lat);
        const dLng = Math.abs(userLoc.lng - destination.lng);
        const maxDiff = Math.max(dLat, dLng);
        let newZoom = 12;
        if (maxDiff < 0.02) newZoom = 14;
        if (maxDiff < 0.005) newZoom = 15;
        if (maxDiff > 0.1) newZoom = 11;
        
        setViewState(prev => ({ 
            ...prev, 
            longitude: midLng, 
            latitude: midLat, 
            zoom: newZoom,
            transitionDuration: 1000 
        }));
    } catch(err) {
        alert("Ошибка построения маршрута: " + err.message);
    }
  };

  const shareLocation = () => {
    if (!userLoc) return;
    const url = `https://maps.google.com/?q=${userLoc.lat},${userLoc.lng}`;
    navigator.clipboard.writeText(url);
    alert("Ссылка на локацию скопирована в буфер обмена!");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}+Tashkent&limit=1`);
      const data = await res.json();
      if(data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const name = data[0].display_name.split(',')[0];
        
        // Find nearest bus stop
        let nearestStop = null;
        let minDist = Infinity;
        const R = 6371; // km
        const getDist = (l1, n1, l2, n2) => {
            const dLat = (l2 - l1) * Math.PI / 180;
            const dLon = (n2 - n1) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(l1*Math.PI/180) * Math.cos(l2*Math.PI/180) * Math.sin(dLon/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        };

        if (MOCK_DATA.bus_stops) {
            MOCK_DATA.bus_stops.forEach(stop => {
                const dist = getDist(lat, lng, stop.lat, stop.lng);
                if(dist < minDist) { minDist = dist; nearestStop = stop; }
            });
        }

        const marker = { id: 'search', name, extra: data[0].display_name, lat, lng, isSearch: true, nearestStop, distToStop: minDist };
        setSearchMarker(marker);
        setSelectedMarker(marker);
        setViewState(prev => ({...prev, longitude: lng, latitude: lat, zoom: 16}));
      } else {
        alert("Ничего не найдено!");
      }
    } catch(err) {
        alert("Ошибка поиска");
    }
  };

  const handleMapClick = async (e) => {
    // e.lngLat contains the coordinates
    if (!e.lngLat) return;
    const { lat, lng } = e.lngLat;

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        
        const name = data.address?.road ? `${data.address.road}${data.address.house_number ? ', ' + data.address.house_number : ''}` : (data.name || 'Выбранная точка');
        const extra = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Find nearest bus stop
        let nearestStop = null;
        let minDist = Infinity;
        const R = 6371; // km
        const getDist = (l1, n1, l2, n2) => {
            const dLat = (l2 - l1) * Math.PI / 180;
            const dLon = (n2 - n1) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(l1*Math.PI/180) * Math.cos(l2*Math.PI/180) * Math.sin(dLon/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        };

        if (MOCK_DATA.bus_stops) {
            MOCK_DATA.bus_stops.forEach(stop => {
                const dist = getDist(lat, lng, stop.lat, stop.lng);
                if(dist < minDist) { minDist = dist; nearestStop = stop; }
            });
        }

        const marker = { id: 'click', name, extra, lat, lng, isSearch: true, nearestStop, distToStop: minDist };
        setSearchMarker(marker);
        setSelectedMarker(marker);
    } catch(err) {
        // Fallback if reverse geocoding fails
        const marker = { id: 'click', name: 'Выбранная точка', extra: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng, isSearch: true };
        setSearchMarker(marker);
        setSelectedMarker(marker);
    }
  };

  const getTaxiPrice = (dest) => {
      if(!userLoc) return "Неизвестно";
      const R = 6371;
      const dLat = (dest.lat - userLoc.lat) * Math.PI / 180;
      const dLon = (dest.lng - userLoc.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(userLoc.lat*Math.PI/180) * Math.cos(dest.lat*Math.PI/180) * Math.sin(dLon/2)**2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return Math.floor(dist * 3500 + 6000).toLocaleString('ru-RU') + " сум";
  };

  const mapStyleDark = {
    version: 8,
    sources: {
        'osm': { type: 'raster', tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 }
    },
    layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }]
  };
  const mapStyleSatellite = {
    version: 8,
    sources: {
        'raster-tiles': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 18 }
    },
    layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles', minzoom: 0 }]
  };

  const layerConfig = [
    { id: 'buses', icon: '🚌', label: 'Автобусы (Live)', color: 'text-green-400' },
    { id: 'attractions', icon: '🏛️', label: 'Места и ЖК', color: 'text-orange-400' },
    { id: 'parking', icon: '???', label: 'Умные парковки', color: 'text-blue-400' },
    { id: 'metro', icon: '🚇', label: 'Метрополитен', color: 'text-purple-400' },
    { id: 'ev', icon: '⚡', label: 'EV Зарядки', color: 'text-green-400' },
    { id: 'schools', icon: '🏫', label: 'Школы', color: 'text-yellow-400' },
    { id: 'hospitals', icon: '🏥', label: 'Больницы', color: 'text-pink-400' },
    { id: 'bus_stops', icon: '🚏', label: 'Остановки', color: 'text-cyan-400' }
  ];

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white overflow-hidden">
      <div className="w-80 bg-black/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-6 z-10 shadow-2xl">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Smart Map
        </h2>
        
        <div className="mb-2">
            <form onSubmit={handleSearch} className="flex bg-white/10 rounded-xl overflow-hidden border border-white/20">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск мест (b2 game...)" 
                    className="bg-transparent border-none outline-none text-white px-4 py-2 w-full text-sm placeholder-gray-400"
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-3 transition-colors">🔍</button>
            </form>
        </div>

        <div className="mb-2">
            <h3 className="font-semibold mb-3 text-gray-400 uppercase tracking-wider text-sm">Тип Карты</h3>
            <div className="flex gap-2">
                <button onClick={() => setMapType('dark')} className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${mapType === 'dark' ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                    Схема
                </button>
                <button onClick={() => setMapType('satellite')} className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${mapType === 'satellite' ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                    Спутник 🌍
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="font-semibold mb-4 text-gray-400 uppercase tracking-wider text-sm">Слои и Транспорт</h3>
          <div className="space-y-3">
            {layerConfig.map((layer) => (
                <label key={layer.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{layer.icon}</span>
                        <span className={`font-medium ${layers[layer.id] ? 'text-white' : 'text-gray-500'}`}>{layer.label}</span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={layers[layer.id]} 
                        onChange={() => setLayers(p => ({...p, [layer.id]: !p[layer.id]}))}
                        className="accent-cyan-500 w-4 h-4" 
                    />
                </label>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={shareLocation} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2">
                📍 Поделиться локацией
            </button>
            <button onClick={() => {
                if(userLoc) {
                    setViewState(prev => ({...prev, longitude: userLoc.lng, latitude: userLoc.lat, zoom: 16}));
                }
            }} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2">
                🔍 Что рядом со мной?
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 relative ${mapType === 'dark' ? 'dark-map' : ''}`}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle={mapType === 'dark' ? mapStyleDark : mapStyleSatellite}
          attributionControl={false}
          maxZoom={18}
          interactiveLayerIds={[]} // this ensures onClick is fired everywhere
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation={true} showUserHeading={true} showAccuracyCircle={false} />
          
          {/* User Location Marker */}
          {userLoc && (
              <Marker longitude={userLoc.lng} latitude={userLoc.lat}>
                  <div className="relative flex items-center justify-center">
                      <div className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                      <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"></div>
                  </div>
              </Marker>
          )}

          {/* Render Route if exists */}
          {routeData && (
            <Source id="route" type="geojson" data={routeData}>
              <Layer 
                id="route-line-bg" 
                type="line" 
                layout={{ 'line-join': 'round', 'line-cap': 'round' }} 
                paint={{ 
                    'line-color': '#0a0a0f', 
                    'line-width': routePulse ? 10 : 8,
                    'line-opacity': routePulse ? 1 : 0.6,
                    'line-opacity-transition': { duration: 800 },
                    'line-width-transition': { duration: 800 }
                }} 
              />
              <Layer 
                id="route-line" 
                type="line" 
                layout={{ 'line-join': 'round', 'line-cap': 'round' }} 
                paint={{ 
                    'line-color': '#00f0ff', 
                    'line-width': routePulse ? 7 : 4,
                    'line-opacity': routePulse ? 1 : 0.7,
                    'line-opacity-transition': { duration: 800 },
                    'line-width-transition': { duration: 800 }
                }} 
              />
            </Source>
          )}

          {/* Live Buses Layer */}
          <LiveBuses active={layers.buses} />

          {/* Search Result Marker */}
          {searchMarker && (
              <Marker longitude={searchMarker.lng} latitude={searchMarker.lat} onClick={e => { e.originalEvent.stopPropagation(); setSelectedMarker(searchMarker); }}>
                  <div className="text-4xl cursor-pointer hover:scale-125 transition-transform filter drop-shadow-lg animate-bounce">
                      📍
                  </div>
              </Marker>
          )}

          {/* Render Static Active Layers */}
          {Object.keys(layers).map(layerKey => {
            if (!layers[layerKey] || layerKey === 'buses') return null;
            const items = MOCK_DATA[layerKey] || [];
            const icon = layerConfig.find(c => c.id === layerKey)?.icon || '📍';
            
            return items.map(item => (
                <Marker 
                    key={item.id}
                    longitude={item.lng} 
                    latitude={item.lat} 
                    onClick={e => { e.originalEvent.stopPropagation(); setSelectedMarker(item); }}
                >
                    <div className="text-3xl cursor-pointer hover:scale-125 transition-transform filter drop-shadow-md">
                        {icon}
                    </div>
                </Marker>
            ));
          })}

          {/* Popup */}
          {selectedMarker && (
            <Popup
              longitude={selectedMarker.lng}
              latitude={selectedMarker.lat}
              onClose={() => setSelectedMarker(null)}
              closeButton={true}
              closeOnClick={false}
              className="text-black"
              anchor="top"
            >
              <div className="p-3 w-56">
                <h3 className="font-bold text-lg leading-tight mb-1">{selectedMarker.name}</h3>
                <p className="text-gray-600 text-xs mb-3 truncate">{selectedMarker.extra}</p>
                
                <button 
                  onClick={() => buildRoute(selectedMarker)}
                  className="w-full bg-cyan-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-cyan-500 shadow-md mb-2 flex items-center justify-center gap-2"
                >
                  🛣️ Маршрут сюда
                </button>

                {userLoc && selectedMarker.isSearch && (
                    <div className="bg-gray-100 p-2 rounded-lg mb-2 text-xs">
                        <p className="font-bold text-yellow-600 mb-1">🚕 Такси (Yandex): ~{getTaxiPrice(selectedMarker)}</p>
                        <p className="font-semibold text-green-600">🚌 Остановка: {selectedMarker.nearestStop?.name} ({Math.round(selectedMarker.distToStop * 1000)}м)</p>
                        <p className="text-gray-500 text-[10px]">{selectedMarker.nearestStop?.extra}</p>
                    </div>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
