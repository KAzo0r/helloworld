import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { reverseGeocode, getRoute } from '../utils/geo';

const POPULAR_PLACES = [
  { name: 'Tashkent City Mall',     lat: 41.3320, lng: 69.2400 },
  { name: 'Chorsu Bazaar',          lat: 41.3260, lng: 69.2300 },
  { name: 'Amir Temur Square',      lat: 41.3123, lng: 69.2492 },
  { name: 'IT Park Tashkent',       lat: 41.3450, lng: 69.2850 },
];

const DRIVERS = [
  { id: 'd1', name: 'Sardor M.',    car: 'Cobalt', plate: '01A 777 AB', rating: 4.9, trips: 3241, avatar: '🧔' },
  { id: 'd2', name: 'Jasur K.',     car: 'Nexia 3', plate: '01B 123 CD', rating: 4.7, trips: 1892, avatar: '👨‍💼' },
  { id: 'd3', name: 'Timur R.',     car: 'Lacetti',  plate: '10C 456 EF', rating: 4.8, trips: 2110, avatar: '🧑' },
];

const TARIFFS = [
  { id: 'econom', label: 'Эконом', icon: '🚗', base: 6000, perKm: 2500, eta: 3, desc: 'Cobalt / Nexia' },
  { id: 'comfort', label: 'Комфорт', icon: '🚙', base: 8000, perKm: 3500, eta: 5, desc: 'Lacetti / Malibu' },
  { id: 'business', label: 'Бизнес', icon: '🚘', base: 12000, perKm: 6000, eta: 7, desc: 'Gentra / Tracker' },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function interpolatePath(path, progress) {
  if (!path || path.length < 2) return path?.[0] || [69.24, 41.31];
  const total = path.length - 1;
  const pos = progress * total;
  const i = Math.min(Math.floor(pos), total - 1);
  const t = pos - i;
  return [lerp(path[i][0], path[i + 1][0], t), lerp(path[i][1], path[i + 1][1], t)];
}

const S = { IDLE: 'idle', CHOOSING: 'choosing', SEARCHING: 'searching', FOUND: 'found', ARRIVING: 'arriving', WAITING: 'waiting', RIDING: 'riding', DONE: 'done', RATED: 'rated', CANCELLED: 'cancelled' };

export default function Taxi() {
  const [status, setStatus]         = useState(S.IDLE);
  const [from, setFrom]             = useState('');
  const [to, setTo]                 = useState('');
  const [tariff, setTariff]         = useState(TARIFFS[0]);
  const [payment, setPayment]       = useState('Наличные');
  
  const [driver, setDriver]         = useState(null);
  const [carPos, setCarPos]         = useState([69.2400, 41.3320]);
  const [progress, setProgress]     = useState(0);
  const [phase, setPhase]           = useState('arrival');
  
  const [userPos, setUserPos]       = useState([69.2492, 41.3123]);
  const [destPos, setDestPos]       = useState(null);
  const [arrivalPath, setArrivalPath] = useState([]);
  const [tripPath, setTripPath]     = useState([]);

  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview]         = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [message, setMessage]       = useState('');
  const [eta, setEta]               = useState(0);
  const [distance, setDistance]     = useState(0);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [mapType, setMapType]       = useState('satellite');
  const [routePulse, setRoutePulse] = useState(false);
  
  const intervalRef = useRef(null);

  // Get real location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        let { longitude, latitude } = pos.coords;
        if (latitude < 41.1 || latitude > 41.5 || longitude < 69.0 || longitude > 69.5) {
            latitude = 41.311081; longitude = 69.240562;
        }
        setUserPos([longitude, latitude]);
        const addr = await reverseGeocode(longitude, latitude);
        setFrom(addr);
      });
    }

    const userData = localStorage.getItem('user');
    if(userData) {
        try {
            const parsed = JSON.parse(userData);
            if(parsed.cards && parsed.cards.length > 0) {
                setSavedCards(parsed.cards);
                setSelectedCardId(parsed.cards[0].id);
            } else {
                // Mock default card if none saved
                const mockCard = { id: 1, number: '8600 1234 5678 9012', type: 'Uzcard' };
                setSavedCards([mockCard]);
                setSelectedCardId(mockCard.id);
            }
        } catch(e) {}
    } else {
        const mockCard = { id: 1, number: '8600 1234 5678 9012', type: 'Uzcard' };
        setSavedCards([mockCard]);
        setSelectedCardId(mockCard.id);
    }
  }, []);

  const handleMapClick = async (e) => {
    if (status !== S.IDLE && status !== S.CHOOSING) return;
    const { lng, lat } = e.lngLat;
    const address = await reverseGeocode(lng, lat);
    
    setTo(address);
    setDestPos([lng, lat]);
    calcDistance(lng, lat);
  };

  const calcDistance = (lng, lat) => {
      const R = 6371;
      const dLat = (lat - userPos[1]) * Math.PI / 180;
      const dLon = (lng - userPos[0]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(userPos[1]*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.sin(dLon/2)**2;
      setDistance(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const handleSearchTo = async (e) => {
      e.preventDefault();
      if(!to) return;
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(to)}+Tashkent&limit=1`);
          const data = await res.json();
          if(data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              setDestPos([lng, lat]);
              setTo(data[0].display_name.split(',')[0]);
              calcDistance(lng, lat);
          } else {
              alert("Не найдено");
          }
      } catch(e) {}
  };

  const stopInterval = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  const startMovement = useCallback((path, durationMs, onDone) => {
    stopInterval();
    if (!path || path.length < 2) { onDone?.(); return; }
    
    const steps = 300;
    const delay = durationMs / steps;
    let step = 0;
    
    intervalRef.current = setInterval(() => {
      step++;
      const p = step / steps;
      setProgress(p);
      setCarPos(interpolatePath(path, p));
      const remainSec = Math.ceil((1 - p) * (durationMs / 1000));
      setEta(remainSec);
      if (step >= steps) { stopInterval(); onDone?.(); }
    }, delay);
  }, []);

  const orderTaxi = async () => {
    if (!from || !to || !destPos) return;
    const d = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
    setDriver(d);
    setStatus(S.SEARCHING);
    
    // Spawn driver 1-2 km away randomly
    const driverSpawn = [
      userPos[0] + (Math.random() - 0.5) * 0.03,
      userPos[1] + (Math.random() - 0.5) * 0.03
    ];
    
    // Fetch real road routes!
    const arrPath = await getRoute(driverSpawn, userPos);
    const trPath = await getRoute(userPos, destPos);
    
    setArrivalPath(arrPath);
    setTripPath(trPath);

    setStatus(S.FOUND);
    setTimeout(() => {
      setPhase('arrival');
      setStatus(S.ARRIVING);
      setCarPos(arrPath[0]);
      startMovement(arrPath, 15000, () => {
        setStatus(S.WAITING);
        setEta(0);
        setTimeout(() => {
            setPhase('trip');
            setStatus(S.RIDING);
            startMovement(trPath, 20000, () => {
              setStatus(S.DONE);
            });
        }, 5000); // 5 seconds wait
      });
    }, 2000);
  };

  const cancelOrder = () => {
    if (!cancelReason.trim()) return;
    stopInterval();
    setShowCancelModal(false);
    setStatus(S.CANCELLED);
    setMessage(`Заказ отменён. Причина: "${cancelReason}". Уведомление отправлено водителю.`);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    alert(`Сообщение водителю ${driver?.name}: "${message}"\n✅ Отправлено`);
    setMessage('');
  };

  const submitRating = () => {
    if (rating === 0) return;
    setStatus(S.RATED);
  };

  const reset = () => {
    stopInterval();
    setStatus(S.IDLE); setTo(''); setDestPos(null); setDriver(null);
    setProgress(0); setRating(0); setReview(''); setCancelReason('');
  };

  useEffect(() => {
      const pulseInterval = setInterval(() => setRoutePulse(p => !p), 800);
      return () => {
          stopInterval();
          clearInterval(pulseInterval);
      };
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

  const currentPath = phase === 'arrival' ? arrivalPath : tripPath;
  const routeGeoJSON = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: currentPath }
    }]
  };

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white overflow-hidden">
      <div className="w-96 bg-black/70 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">🚕 Tashkent Taxi</h1>
          <p className="text-xs text-gray-400 mt-1">Быстрое такси по городу (Реальные дороги)</p>
        </div>

        {(status === S.IDLE || status === S.CHOOSING) && (
          <div className="p-6 space-y-4 flex-1">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">📍 Откуда</label>
              <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ваш адрес..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500/60" />
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">🏁 Куда (Кликните или напишите)</label>
              <form onSubmit={handleSearchTo} className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-yellow-500/60">
                  <input value={to} onChange={e => setTo(e.target.value)} placeholder="Пункт назначения..." 
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none" />
                  <button type="submit" className="px-4 bg-white/10 hover:bg-white/20">🔍</button>
              </form>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">🚘 Тариф</label>
              <div className="space-y-2">
                {TARIFFS.map(t => (
                  <button key={t.id} onClick={() => setTariff(t)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${tariff.id === t.id ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold">{t.label}</p>
                      </div>
                    </div>
                    <span className="font-bold">{distance > 0 ? Math.floor(t.base + t.perKm * distance).toLocaleString() : '---'} сум</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">💳 Оплата</label>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setPayment('Наличные')} className={`flex-1 py-2 rounded-lg border transition-colors ${payment === 'Наличные' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10'}`}>💵 Наличные</button>
                <button onClick={() => setPayment('Карта')} className={`flex-1 py-2 rounded-lg border transition-colors ${payment === 'Карта' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10'}`}>💳 Карта</button>
              </div>
              
              {payment === 'Карта' && (
                <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                  {savedCards.length > 0 ? (
                      <select 
                        value={selectedCardId} 
                        onChange={e => setSelectedCardId(Number(e.target.value))}
                        className="w-full bg-transparent outline-none text-sm text-white"
                      >
                        {savedCards.map(c => (
                            <option key={c.id} value={c.id} className="bg-black text-white">
                                {c.type} •••• {c.number.slice(-4)}
                            </option>
                        ))}
                      </select>
                  ) : (
                      <p className="text-xs text-red-400">Нет привязанных карт. Добавьте в профиле.</p>
                  )}
                </div>
              )}
            </div>

            <button onClick={orderTaxi} disabled={!from || !to}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-40 rounded-2xl font-bold text-black text-lg shadow-lg shadow-yellow-500/20">
              🚕 Вызвать такси
            </button>
          </div>
        )}

        {status === S.SEARCHING && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin"></div>
            <div>
              <p className="text-xl font-bold">Ищем водителя...</p>
              <p className="text-gray-400 text-sm mt-1">Прокладываем реальный маршрут OSRM...</p>
            </div>
          </div>
        )}

        {(status === S.FOUND || status === S.ARRIVING || status === S.WAITING || status === S.RIDING) && driver && (
          <div className="p-5 space-y-4 flex-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl">{driver.avatar}</div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{driver.name}</p>
                  <p className="text-sm text-gray-400">{driver.car} · {driver.plate}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${status === S.ARRIVING ? 'bg-blue-500/10 border-blue-500/30' : status === S.WAITING ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${status === S.ARRIVING ? 'bg-blue-400' : status === S.WAITING ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                <div>
                  <p className="font-semibold">{status === S.FOUND ? '✅ Водитель найден!' : status === S.ARRIVING ? '🚕 Водитель едет к вам' : status === S.WAITING ? '⏳ Водитель ожидает вас...' : '🏎️ Поездка в процессе'}</p>
                  {eta > 0 && <p className="text-sm text-gray-400">~{eta} сек</p>}
                </div>
              </div>
              {status !== S.WAITING && (
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="text-green-400">📍</span><span className="text-gray-300 truncate">{from}</span></div>
              <div className="flex items-center gap-2"><span className="text-red-400">🏁</span><span className="text-gray-300 truncate">{to}</span></div>
              <div className="pt-2 border-t border-white/10 flex justify-between">
                <span className="text-gray-400">{payment === 'Карта' && selectedCardId ? `Карта •••• ${savedCards.find(c=>c.id===selectedCardId)?.number?.slice(-4) || ''}` : payment}</span>
                <span className="font-bold text-yellow-400">{Math.floor(tariff.base + tariff.perKm * distance).toLocaleString()} сум</span>
              </div>
            </div>

            <button onClick={() => setShowCancelModal(true)} className="w-full py-3 bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-400 rounded-xl">❌ Отменить заказ</button>
          </div>
        )}

        {status === S.DONE && (
          <div className="p-6 flex flex-col items-center text-center gap-5">
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-bold">Поездка завершена!</h2>
            <button onClick={reset} className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl font-bold text-black">Новый заказ</button>
          </div>
        )}

        {status === S.CANCELLED && (
          <div className="p-6 flex flex-col items-center text-center gap-5">
            <div className="text-6xl">❌</div>
            <h2 className="text-xl font-bold text-red-400">Заказ отменён</h2>
            <button onClick={reset} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-black">Новый заказ</button>
          </div>
        )}
      </div>

      <div className={`flex-1 relative ${mapType === 'dark' ? 'dark-map' : ''}`}>
        {/* Floating Map Toggle */}
        <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex gap-1 shadow-2xl">
            <button onClick={() => setMapType('dark')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'dark' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Схема</button>
            <button onClick={() => setMapType('satellite')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'satellite' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Спутник</button>
        </div>

        <Map defaultViewState={{ longitude: 69.2492, latitude: 41.3123, zoom: 13 }}
          mapStyle={mapType === 'dark' ? mapStyleDark : mapStyleSatellite} onClick={handleMapClick} maxZoom={18}>
          <NavigationControl position="top-right" />

          {status !== S.IDLE && status !== S.CHOOSING && currentPath.length > 1 && (
            <Source id="route" type="geojson" data={routeGeoJSON}>
              <Layer 
                id="route-line-bg" 
                type="line" 
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 
                    'line-color': '#0a0a0f', 
                    'line-width': routePulse ? 11 : 9,
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
                    'line-color': status === S.RIDING ? '#22c55e' : '#eab308', 
                    'line-width': routePulse ? 8 : 5,
                    'line-opacity': routePulse ? 1 : 0.7,
                    'line-opacity-transition': { duration: 800 },
                    'line-width-transition': { duration: 800 }
                }} 
              />
            </Source>
          )}

          <Marker longitude={userPos[0]} latitude={userPos[1]}>
            <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
          </Marker>

          {destPos && (
            <Marker longitude={destPos[0]} latitude={destPos[1]}>
              <div className="text-3xl drop-shadow-lg">🏁</div>
            </Marker>
          )}

          {(status === S.ARRIVING || status === S.WAITING || status === S.RIDING || status === S.FOUND) && (
            <Marker longitude={carPos[0]} latitude={carPos[1]}>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black text-xl w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-xl">
                  {tariff.icon}
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#111] p-8 rounded-3xl w-full max-w-md">
             <h2 className="text-xl font-bold mb-4">Отменить заказ?</h2>
             <input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Причина..." className="w-full bg-white/10 p-3 rounded-xl mb-4" />
             <div className="flex gap-2">
               <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-white/10 rounded-xl">Нет</button>
               <button onClick={cancelOrder} disabled={!cancelReason} className="flex-1 py-3 bg-red-600 rounded-xl">Да, отменить</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
