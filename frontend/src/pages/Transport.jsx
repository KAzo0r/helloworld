import React, { useState, useEffect } from 'react';
import Map, { NavigationControl, Marker, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { BUS_ROUTES as REAL_ROUTES } from './MapData';

const COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#f97316'];

const BUS_ROUTES = REAL_ROUTES.map((route, idx) => ({
  id: route.id,
  name: route.name,
  from: 'Остановка А',
  to: 'Остановка Б',
  color: COLORS[idx % COLORS.length],
  interval: `${Math.floor(Math.random() * 5 + 5)}-${Math.floor(Math.random() * 5 + 10)} мин`,
  path: route.path,
  stops: Array.from({ length: 12 }, (_, i) => {
      const idx = Math.floor((i / 11) * (route.path.length - 1));
      return { 
          id: `${route.id}_${i}`, 
          name: i === 0 ? 'Начальная' : i === 11 ? 'Конечная' : `Остановка ${i+1}`, 
          lng: route.path[idx][0], 
          lat: route.path[idx][1] 
      };
  }),
  activeBuses: Array.from({ length: 15 }, (_, i) => ({
    id: `${route.id}_${i}`,
    plate: `01 ${Math.floor(100+Math.random()*800)} ${String.fromCharCode(65+Math.random()*26, 65+Math.random()*26, 65+Math.random()*26)}`,
    speed: Math.floor(30 + Math.random() * 20),
    progress: Math.random()
  }))
}));


function lerp(a, b, t) { return a + (b - a) * t; }
function getPosOnPath(path, progress) {
  if (path.length < 2) return path[0];
  const max = path.length - 1;
  const target = progress * max;
  const idx = Math.min(Math.floor(target), max - 1);
  const t = target - idx;
  return [lerp(path[idx][0], path[idx+1][0], t), lerp(path[idx][1], path[idx+1][1], t)];
}

export default function Transport() {
  const [selectedRoute, setSelectedRoute] = useState(BUS_ROUTES[0]);
  const [allBuses, setAllBuses] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const [search, setSearch] = useState('');
  
  // Initialize and animate ALL buses globally
  useEffect(() => {
    let initialBuses = [];
    BUS_ROUTES.forEach(route => {
        route.activeBuses.forEach(b => {
            initialBuses.push({
                ...b,
                routeId: route.id,
                routeName: route.name,
                color: route.color,
                path: route.path,
                currentPos: getPosOnPath(route.path, b.progress),
                direction: 1
            });
        });
    });
    setAllBuses(initialBuses);

    const interval = setInterval(() => {
      setAllBuses(prev => prev.map(bus => {
        let step = (bus.speed / 10000) || 0.005;
        if (bus.speed === 0) step = 0;
        
        let newProg = bus.progress + (step * bus.direction);
        let newDir = bus.direction;
        
        if (newProg >= 1) { newProg = 1; newDir = -1; }
        else if (newProg <= 0) { newProg = 0; newDir = 1; }

        return {
          ...bus,
          progress: newProg,
          direction: newDir,
          currentPos: getPosOnPath(bus.path, newProg)
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const mapStyleDark = {
    version: 8,
    sources: { osm: { type: 'raster', tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
  };

  const mapStyleSatellite = {
    version: 8,
    sources: {
        'raster-tiles': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 18 }
    },
    layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles', minzoom: 0 }]
  };

  const routeGeoJSON = selectedRoute ? {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: selectedRoute.path }
  } : null;

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white overflow-hidden">
      
      {/* ── LEFT PANEL ── */}
      <div className="w-[420px] bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-10">
        <div className="p-6 border-b border-white/10 shrink-0">
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            🚌 Транспорт (GPS)
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Маршруты и движение в реальном времени</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Route Selector */}
          <div>
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Выберите маршрут</h3>
            <div className="space-y-3">
              {/* Show All Routes Button */}
              <div onClick={() => { setSelectedRoute(null); setSelectedStop(null); }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${!selectedRoute ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-black bg-white shadow-lg">
                    🌍
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Все маршруты</h4>
                    <p className="text-xs text-cyan-400">Городской трафик в реальном времени</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск маршрута (напр. 14, 93...)" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60 transition-all placeholder:text-gray-600"
                />
                <span className="absolute right-4 top-3 opacity-50">🔍</span>
              </div>

              {BUS_ROUTES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.replace('bus_','').includes(search)).map(route => (
                <div key={route.id} onClick={() => { setSelectedRoute(route); setSelectedStop(null); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${selectedRoute?.id === route.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: route.color }}>
                        {route.id.replace('bus_', '')}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{route.name}</h4>
                        <p className="text-xs text-cyan-400">Интервал: {route.interval}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 flex items-center gap-2 mt-3">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="truncate">{route.from}</span>
                    <span className="text-gray-500">→</span>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="truncate">{route.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Stops Timeline */}
          {selectedRoute && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider">Остановки ({selectedRoute.stops.length})</h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{allBuses.filter(b=>b.routeId===selectedRoute.id).length} автобусов на линии</span>
              </div>
              
              <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
                {selectedRoute.stops.map((stop, i) => {
                  const isLast = i === selectedRoute.stops.length - 1;
                  return (
                    <div key={stop.id} className="relative pl-6 cursor-pointer group" onClick={() => setSelectedStop(stop)}>
                      <div className="absolute w-4 h-4 bg-black border-2 border-cyan-400 rounded-full -left-[9px] top-1 group-hover:scale-125 transition-transform"></div>
                      <h4 className="font-semibold group-hover:text-cyan-400 transition-colors">{stop.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">Прибытие: через {Math.floor(Math.random() * 5 + 1)} мин</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MAP ── */}
      <div className="flex-1 relative">
        {/* Floating Map Toggle */}
        <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex gap-1 shadow-2xl">
            <button onClick={() => setMapType('dark')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'dark' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Схема</button>
            <button onClick={() => setMapType('satellite')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'satellite' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Спутник</button>
        </div>

        <Map
          key={selectedRoute ? selectedRoute.id : 'all'} // force re-render on route change to center
          initialViewState={{
            longitude: selectedRoute?.path[Math.floor(selectedRoute.path.length/2)][0] || 69.240,
            latitude: selectedRoute?.path[Math.floor(selectedRoute.path.length/2)][1] || 41.311,
            zoom: selectedRoute ? 12 : 11
          }}
          mapStyle={mapType === 'dark' ? mapStyleDark : mapStyleSatellite}
          attributionControl={false}
          maxZoom={18}
        >
          <NavigationControl position="top-right" />

          {/* Route Line */}
          {routeGeoJSON && (
            <Source id="bus-route" type="geojson" data={routeGeoJSON}>
              <Layer
                id="bus-route-line"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': selectedRoute.color, 'line-width': 6, 'line-opacity': 0.6 }}
              />
            </Source>
          )}

          {/* Stops Markers */}
          {selectedRoute?.stops.map(stop => (
            <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat}>
              <div 
                className="w-4 h-4 bg-white border-4 border-cyan-500 rounded-full cursor-pointer hover:scale-150 transition-transform shadow-lg"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedStop(stop); }}
              />
            </Marker>
          ))}

          {/* Stop Popup */}
          {selectedStop && (
            <Popup
              longitude={selectedStop.lng}
              latitude={selectedStop.lat}
              onClose={() => setSelectedStop(null)}
              closeButton={false}
              className="rounded-xl overflow-hidden"
              anchor="bottom"
              offset={15}
            >
              <div className="p-3 bg-white text-black min-w-40 rounded-xl">
                <h4 className="font-bold text-sm mb-2">🚏 {selectedStop.name}</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Автобус {selectedRoute.id.replace('b','')}</span>
                    <span className="text-green-600 font-bold">~ 2 мин</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">След. рейс</span>
                    <span className="text-gray-500">12 мин</span>
                  </div>
                </div>
              </div>
            </Popup>
          )}

          {/* Live GPS Buses - ALL BUSES */}
          {allBuses.map(bus => (
            <Marker key={bus.id} longitude={bus.currentPos[0]} latitude={bus.currentPos[1]}>
              <div className="relative group cursor-pointer" style={{ zIndex: selectedRoute?.id === bus.routeId ? 50 : 10 }}>
                {/* Ping animation only for selected route buses */}
                {selectedRoute?.id === bus.routeId && (
                    <div className="absolute -inset-3 bg-cyan-400/30 rounded-full animate-ping"></div>
                )}
                
                {/* Bus Icon */}
                {!selectedRoute || selectedRoute.id === bus.routeId ? (
                    <div 
                      className={`relative z-10 px-2 py-1 rounded-lg flex items-center justify-center gap-1 text-white font-bold shadow-xl border-2 ${selectedRoute?.id === bus.routeId ? 'border-white scale-110' : 'border-white/50 opacity-90'}`}
                      style={{ backgroundColor: bus.color }}
                    >
                      <span className="text-sm">🚌</span>
                      <span className="text-xs drop-shadow-md">{bus.routeId.replace('bus_','')}</span>
                    </div>
                ) : (
                    <div 
                      className="relative z-0 w-3 h-3 rounded-full border border-white/50 opacity-60"
                      style={{ backgroundColor: bus.color }}
                    ></div>
                )}

                {/* Hover Info tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-md border border-white/20 text-white p-2 rounded-lg whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                  <p className="font-bold text-sm border-b border-white/20 pb-1 mb-1">Маршрут {bus.routeName}</p>
                  <p className="font-mono text-xs mb-1">Гос. номер: {bus.plate}</p>
                  <p className="text-xs text-cyan-400">{bus.speed > 0 ? `Скорость: ${bus.speed} км/ч` : 'На остановке'}</p>
                </div>
              </div>
            </Marker>
          ))}
        </Map>
      </div>

    </div>
  );
}
