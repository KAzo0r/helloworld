import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { reverseGeocode, getRoute } from '../utils/geo';

const placesList = [
  { n: 'Bon!', c: 'Кофейня', r: 4.8 },
  { n: 'SOCIALS Maksimka', c: 'Кафе', r: 4.7 },
  { n: 'Union Café', c: 'Кафе', r: 4.6 },
  { n: 'Moida by Azon - Book Cafe', c: 'Book Cafe', r: 4.9 },
  { n: 'Café 1991', c: 'Европейская', r: 4.5 },
  { n: 'Stories City Cafe', c: 'Кафе', r: 4.6 },
  { n: 'Bibigon Cafe', c: 'Европейская', r: 4.4 },
  { n: 'B&B Coffee House', c: 'Кофейня', r: 4.8 },
  { n: 'Beanberry Coffee Shop', c: 'Кофейня', r: 4.7 },
  { n: 'Pie Republic', c: 'Десерты', r: 4.9 },
  { n: 'Boboy', c: 'Ресторан', r: 4.5 },
  { n: 'Lali', c: 'Ресторан', r: 4.6 },
  { n: 'Caravan Group', c: 'Национальная', r: 4.8 },
  { n: 'Сыроварня', c: 'Итальянская', r: 4.9 },
  { n: 'Fillet Restaurant', c: 'Стейк-хаус', r: 4.7 },
  { n: 'Pro. Хинкали', c: 'Грузинская', r: 4.8 },
  { n: 'Urfa Sofrası', c: 'Турецкая', r: 4.6 },
  { n: 'Ember & Embar', c: 'Ресторан', r: 4.7 },
  { n: 'Forn Lebnen', c: 'Ливанская', r: 4.8 },
  { n: 'City Grill steakhouse', c: 'Стейк-хаус', r: 4.7 },
  { n: 'Afsona Restaurant', c: 'Национальная', r: 4.8 },
  { n: 'Besh Qozon', c: 'Узбекская', r: 4.9 },
  { n: 'OBI Hayot', c: 'Ресторан', r: 4.6 },
  { n: 'Sorrento by Novikov', c: 'Итальянская', r: 4.9 },
  { n: 'Gravity', c: 'Ресторан', r: 4.5 },
  { n: 'Oko', c: 'Ресторан', r: 4.6 },
  { n: 'Kitana', c: 'Паназиатская', r: 4.7 }
];

const RESTAURANTS = placesList.map((p, i) => {
    // Generate random coordinate around Tashkent center (41.3123, 69.2492)
    const lat = 41.3123 + (Math.random() - 0.5) * 0.08;
    const lng = 69.2492 + (Math.random() - 0.5) * 0.08;
    
    let menu = [];
    if (p.c.includes('Кофейня') || p.c.includes('Кафе') || p.c.includes('Десерты') || p.c === 'Book Cafe') {
        menu = [
            { id: `m${i}_1`, name: 'Капучино', price: 25000, emoji: '☕', desc: 'Классический кофе с густой пенкой' },
            { id: `m${i}_2`, name: 'Латте Макиато', price: 28000, emoji: '🥛', desc: 'Мягкий кофейный напиток' },
            { id: `m${i}_3`, name: 'Раф Ванильный', price: 32000, emoji: '🍦', desc: 'Сливки, эспрессо и ванильный сироп' },
            { id: `m${i}_4`, name: 'Эспрессо', price: 15000, emoji: '☕', desc: 'Двойной шот для бодрости' },
            { id: `m${i}_5`, name: 'Чизкейк Нью-Йорк', price: 45000, emoji: '🍰', desc: 'Нежный творожный десерт' },
            { id: `m${i}_6`, name: 'Круассан с шоколадом', price: 25000, emoji: '🥐', desc: 'Свежеиспеченный, с нутеллой' },
            { id: `m${i}_7`, name: 'Круассан классический', price: 20000, emoji: '🥐', desc: 'Хрустящий французский' },
            { id: `m${i}_8`, name: 'Сырники со сметаной', price: 35000, emoji: '🥞', desc: 'Идеальный завтрак (3 шт)' },
            { id: `m${i}_9`, name: 'Макаронс (набор)', price: 40000, emoji: '🍡', desc: '5 вкусов на выбор' },
            { id: `m${i}_10`, name: 'Айс-Латте', price: 30000, emoji: '🥤', desc: 'Освежающий кофе со льдом' },
            { id: `m${i}_11`, name: 'Лимонад Маракуйя', price: 30000, emoji: '🍹', desc: 'Холодный напиток со льдом' },
            { id: `m${i}_12`, name: 'Сэндвич с лососем', price: 55000, emoji: '🥪', desc: 'На зерновом хлебе' },
            { id: `m${i}_13`, name: 'Блинчики с творогом', price: 30000, emoji: '🥞', desc: 'Домашние блинчики' }
        ];
    } else if (p.c.includes('Итальянская')) {
        menu = [
            { id: `m${i}_1`, name: 'Пицца Маргарита', price: 75000, emoji: '🍕', desc: 'Моцарелла, томаты, базилик' },
            { id: `m${i}_2`, name: 'Пицца Пепперони', price: 85000, emoji: '🍕', desc: 'Острая салями, сыр' },
            { id: `m${i}_3`, name: 'Пицца Четыре Сыра', price: 95000, emoji: '🧀', desc: 'Дорблю, пармезан, моцарелла, чеддер' },
            { id: `m${i}_4`, name: 'Паста Карбонара', price: 65000, emoji: '🍝', desc: 'Бекон, пармезан, яичный желток' },
            { id: `m${i}_5`, name: 'Паста Болоньезе', price: 70000, emoji: '🍝', desc: 'Мясное рагу, томатный соус' },
            { id: `m${i}_6`, name: 'Фетучини Альфредо', price: 75000, emoji: '🍝', desc: 'Курица, грибы, сливочный соус' },
            { id: `m${i}_7`, name: 'Ризотто с грибами', price: 80000, emoji: '🍛', desc: 'Рис арборио, белые грибы' },
            { id: `m${i}_8`, name: 'Брускетта с томатами', price: 45000, emoji: '🥖', desc: 'Чиабатта, томаты, базилик' },
            { id: `m${i}_9`, name: 'Салат Капрезе', price: 55000, emoji: '🥗', desc: 'Томаты, моцарелла, песто' },
            { id: `m${i}_10`, name: 'Тирамису', price: 45000, emoji: '🍮', desc: 'Итальянская классика' },
            { id: `m${i}_11`, name: 'Панна Котта', price: 40000, emoji: '🍨', desc: 'Сливочный десерт с ягодами' },
            { id: `m${i}_12`, name: 'Лимончелло (безалкогольный)', price: 35000, emoji: '🍋', desc: 'Освежающий лимонад' }
        ];
    } else if (p.c.includes('Стейк-хаус') || p.c.includes('Европейская')) {
        menu = [
            { id: `m${i}_1`, name: 'Рибай Стейк', price: 250000, emoji: '🥩', desc: 'Мраморная говядина (Зерновой откорм)' },
            { id: `m${i}_2`, name: 'Стейк Тибон', price: 280000, emoji: '🥩', desc: 'На кости, прожарка Medium' },
            { id: `m${i}_3`, name: 'Медальоны из телятины', price: 180000, emoji: '🍖', desc: 'С грибным соусом' },
            { id: `m${i}_4`, name: 'Фирменный Бургер', price: 75000, emoji: '🍔', desc: 'Котлета из говядины, чеддер' },
            { id: `m${i}_5`, name: 'Бургер с курицей', price: 65000, emoji: '🍔', desc: 'Хрустящее куриное филе' },
            { id: `m${i}_6`, name: 'Картофель Фри', price: 25000, emoji: '🍟', desc: 'С кетчупом' },
            { id: `m${i}_7`, name: 'Салат Цезарь с курицей', price: 55000, emoji: '🥗', desc: 'Айсберг, сухарики, пармезан' },
            { id: `m${i}_8`, name: 'Греческий салат', price: 45000, emoji: '🥗', desc: 'Фета, маслины, овощи' },
            { id: `m${i}_9`, name: 'Грибной крем-суп', price: 40000, emoji: '🥣', desc: 'С трюфельным маслом' },
            { id: `m${i}_10`, name: 'Сырное плато', price: 120000, emoji: '🧀', desc: 'Ассорти элитных сыров' },
            { id: `m${i}_11`, name: 'Свежевыжатый сок', price: 35000, emoji: '🧃', desc: 'Апельсин / Грейпфрут' }
        ];
    } else if (p.c.includes('Узбекская') || p.c.includes('Национальная') || p.n.includes('Besh Qozon')) {
        menu = [
            { id: `m${i}_1`, name: 'Плов Чайханский', price: 40000, emoji: '🍚', desc: 'Из баранины и девзиры' },
            { id: `m${i}_2`, name: 'Плов Праздничный', price: 35000, emoji: '🍚', desc: 'С нутом, изюмом и говядиной' },
            { id: `m${i}_3`, name: 'Шашлык из баранины', price: 18000, emoji: '🍢', desc: '1 палочка' },
            { id: `m${i}_4`, name: 'Шашлык Кусковой (Говядина)', price: 18000, emoji: '🍢', desc: '1 палочка' },
            { id: `m${i}_5`, name: 'Шашлык Наполеон (Печень)', price: 15000, emoji: '🍢', desc: '1 палочка' },
            { id: `m${i}_6`, name: 'Манты с мясом', price: 35000, emoji: '🥟', desc: 'Порция (4 шт)' },
            { id: `m${i}_7`, name: 'Самса с мясом', price: 10000, emoji: '🥐', desc: 'В тандыре' },
            { id: `m${i}_8`, name: 'Шурпа', price: 30000, emoji: '🍲', desc: 'Традиционный суп с бараниной' },
            { id: `m${i}_9`, name: 'Лагман жареный', price: 38000, emoji: '🍜', desc: 'Ковурма лагман' },
            { id: `m${i}_10`, name: 'Чучвара', price: 32000, emoji: '🥣', desc: 'Мелкие пельмени в бульоне' },
            { id: `m${i}_11`, name: 'Салат Ачичук', price: 15000, emoji: '🥗', desc: 'Помидоры, лук, острый перец' },
            { id: `m${i}_12`, name: 'Чайник черного чая', price: 10000, emoji: '☕', desc: 'С лимоном' }
        ];
    } else {
        menu = [
            { id: `m${i}_1`, name: 'Филадельфия Классик', price: 95000, emoji: '🍣', desc: 'Свежий лосось, сыр' },
            { id: `m${i}_2`, name: 'Калифорния', price: 85000, emoji: '🍱', desc: 'Краб, авокадо, тобико' },
            { id: `m${i}_3`, name: 'Сет на двоих', price: 250000, emoji: '🥢', desc: '32 кусочка' },
            { id: `m${i}_4`, name: 'Том Ям с креветками', price: 75000, emoji: '🥣', desc: 'Острый тайский суп' },
            { id: `m${i}_5`, name: 'Поке с лососем', price: 80000, emoji: '🥗', desc: 'Рис, рыба, авокадо, бобы эдамаме' },
            { id: `m${i}_6`, name: 'Удон с курицей', price: 65000, emoji: '🍜', desc: 'Лапша в соусе терияки' },
            { id: `m${i}_7`, name: 'Креветки Темпура', price: 90000, emoji: '🍤', desc: 'В хрустящей панировке' },
            { id: `m${i}_8`, name: 'Спринг роллы', price: 45000, emoji: '🌯', desc: 'Овощные' },
            { id: `m${i}_9`, name: 'Ассорти закусок', price: 60000, emoji: '🥙', desc: 'На компанию' },
            { id: `m${i}_10`, name: 'Мотти', price: 35000, emoji: '🍡', desc: 'Японский десерт' }
        ];
    }

    return {
        id: `r${i}`,
        name: p.n,
        cuisine: p.c,
        rating: p.r,
        deliveryTime: `${Math.floor(Math.random() * 20 + 20)}-${Math.floor(Math.random() * 20 + 40)}`,
        minOrder: Math.floor(Math.random() * 5 + 3) * 10000,
        lat,
        lng,
        menu
    };
});

const COURIERS = [
  { id: 'c1', name: 'Bobur T.', transport: 'Велосипед', avatar: '🚴', rating: 4.9, orders: 890 },
  { id: 'c2', name: 'Ulugbek M.', transport: 'Мопед', avatar: '🛵', rating: 4.8, orders: 1230 },
  { id: 'c3', name: 'Firdavs A.', transport: 'Велосипед', avatar: '🚲', rating: 4.7, orders: 654 },
];

const ORDER_STATUSES = [
  { key: 'confirmed', label: 'Заказ принят', icon: '✅', color: 'text-green-400' },
  { key: 'preparing', label: 'Готовят на кухне', icon: '👨‍🍳', color: 'text-yellow-400' },
  { key: 'picked', label: 'Курьер забрал', icon: '🛵', color: 'text-blue-400' },
  { key: 'delivering', label: 'В пути к вам', icon: '📍', color: 'text-cyan-400' },
  { key: 'done', label: 'Доставлено!', icon: '🎉', color: 'text-green-400' },
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

const S = { BROWSE: 'browse', CART: 'cart', ORDERING: 'ordering', TRACKING: 'tracking', DONE: 'done', RATED: 'rated', CANCELLED: 'cancelled' };

export default function FoodDelivery() {
  const [status, setStatus]             = useState(S.BROWSE);
  const [selectedRest, setSelectedRest] = useState(null);
  const [cart, setCart]                 = useState({});
  const [address, setAddress]           = useState('');
  const [userPos, setUserPos]           = useState([69.2492, 41.3123]);
  const [payment, setPayment]           = useState('Карта');
  const [savedCards, setSavedCards]     = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [mapType, setMapType]           = useState('satellite');
  const [routePulse, setRoutePulse]     = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  
  const [courier, setCourier]           = useState(null);
  const [orderStatus, setOrderStatus]   = useState(0);
  const [courierPos, setCourierPos]     = useState([69.239, 41.326]);
  const [delivPath, setDelivPath]       = useState([]);
  const [progress, setProgress]         = useState(0);
  const [eta, setEta]                   = useState(0);
  
  const [rating, setRating]             = useState(0);
  const [hoverRating, setHoverRating]   = useState(0);
  const [review, setReview]             = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage]           = useState('');
  const intervalRef = useRef(null);

  // Geo init
  useEffect(() => {
    const pulseInterval = setInterval(() => setRoutePulse(p => !p), 800);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        let { longitude, latitude } = pos.coords;
        if (latitude < 41.1 || latitude > 41.5 || longitude < 69.0 || longitude > 69.5) {
            latitude = 41.311081; longitude = 69.240562;
        }
        setUserPos([longitude, latitude]);
        const addr = await reverseGeocode(longitude, latitude);
        setAddress(addr);
      });
    }

    const userData = localStorage.getItem('user');
    if(userData) {
        try {
            const parsed = JSON.parse(userData);
            if(parsed.cards && parsed.cards.length > 0) {
                setSavedCards(parsed.cards);
                setSelectedCardId(parsed.cards[0].id);
            }
        } catch(e) {}
    }

    return () => clearInterval(pulseInterval);
  }, []);

  const handleMapClick = async (e) => {
    if (status !== S.CART && status !== S.BROWSE) return;
    const { lng, lat } = e.lngLat;
    setUserPos([lng, lat]);
    const addr = await reverseGeocode(lng, lat);
    setAddress(addr);
  };

  const stopInterval = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  const addToCart = (item) => setCart(prev => ({ ...prev, [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 } }));
  const removeFromCart = (id) => setCart(prev => {
    const next = { ...prev };
    if (next[id]?.qty > 1) next[id] = { ...next[id], qty: next[id].qty - 1 };
    else delete next[id];
    return next;
  });
  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!address || cartTotal < (selectedRest?.minOrder || 0)) return;
    
    const restPos = [selectedRest.lng, selectedRest.lat];
    const path = await getRoute(restPos, userPos);
    setDelivPath(path);
    
    const c = COURIERS[Math.floor(Math.random() * COURIERS.length)];
    setCourier(c);
    setStatus(S.TRACKING);
    setOrderStatus(0);
    setCourierPos(restPos);

    const timeline = [
      { delay: 1000,  statusIdx: 0 },
      { delay: 4000,  statusIdx: 1 },
      { delay: 8000,  statusIdx: 2 },
      { delay: 10000, statusIdx: 3 },
    ];

    timeline.forEach(({ delay, statusIdx }) => {
      setTimeout(() => {
        setOrderStatus(statusIdx);
        if (statusIdx === 2) {
          stopInterval();
          const steps = 300;
          const durationMs = 25000;
          const delay2 = durationMs / steps;
          let step = 0;
          intervalRef.current = setInterval(() => {
            step++;
            const p = step / steps;
            setProgress(p);
            setCourierPos(interpolatePath(path, p));
            setEta(Math.ceil((1 - p) * (durationMs / 1000)));
            if (step >= steps) {
              stopInterval();
              setOrderStatus(4);
              setStatus(S.DONE);
            }
          }, delay2);
        }
      }, delay);
    });
  };

  const cancelOrder = () => {
    if (!cancelReason.trim()) return;
    stopInterval();
    setShowCancelModal(false);
    setStatus(S.CANCELLED);
  };

  const submitRating = () => { if (rating > 0) setStatus(S.RATED); };

  const reset = () => {
    stopInterval();
    setStatus(S.BROWSE); setSelectedRest(null); setCart({});
    setAddress(''); setCourier(null); setOrderStatus(0);
    setProgress(0); setRating(0); setReview(''); setCancelReason(''); setDelivPath([]);
  };

  useEffect(() => () => stopInterval(), []);

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

  const routeGeoJSON = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: delivPath }
    }]
  };

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white overflow-hidden">
      <div className="w-[420px] bg-black/70 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 z-10 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">🍔 Food Delivery</h1>
            <p className="text-xs text-gray-400">Реальные рестораны и маршруты</p>
          </div>
          {cartCount > 0 && status === S.BROWSE && (
            <button onClick={() => setStatus(S.CART)} className="relative px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold text-sm text-white shadow-lg">
              🛒 Корзина
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
            </button>
          )}
        </div>

        {status === S.BROWSE && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!selectedRest ? (
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider px-1">Рестораны рядом</p>
                {RESTAURANTS.map(r => (
                  <div key={r.id} onClick={() => setSelectedRest(r)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{r.name}</h3>
                      <span className="text-yellow-400 text-sm font-semibold">⭐ {r.rating}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>🍴 {r.cuisine}</span>
                      <span>⏱️ {r.deliveryTime} мин</span>
                      <span>💰 от {r.minOrder.toLocaleString()} сум</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1">
                <div className="p-4 flex items-center gap-3 border-b border-white/10 bg-orange-500/5">
                  <button onClick={() => setSelectedRest(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">←</button>
                  <div>
                    <h2 className="font-bold">{selectedRest.name}</h2>
                    <p className="text-xs text-gray-400">⭐ {selectedRest.rating} · {selectedRest.deliveryTime} мин · от {selectedRest.minOrder.toLocaleString()} сум</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRest.menu.map(item => {
                    const inCart = cart[item.id];
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition-all">
                        <span className="text-3xl cursor-pointer hover:scale-110 transition-transform" onClick={() => setSelectedDish(item)}>{item.emoji}</span>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedDish(item)}>
                          <p className="font-semibold text-sm hover:text-orange-400 transition-colors">{item.name}</p>
                          <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                          <p className="text-orange-400 font-bold mt-1">{item.price.toLocaleString()} сум</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {inCart ? (
                            <>
                              <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-white/10 hover:bg-red-500/30 rounded-full font-bold transition-all">−</button>
                              <span className="w-6 text-center font-bold">{inCart.qty}</span>
                              <button onClick={() => addToCart(item)} className="w-8 h-8 bg-orange-500/20 hover:bg-orange-500/40 rounded-full font-bold transition-all">+</button>
                            </>
                          ) : (
                            <button onClick={() => addToCart(item)} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-md">
                              + Добавить
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cartCount > 0 && (
                  <div className="p-4 sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-white/10">
                    <button onClick={() => setStatus(S.CART)}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 flex items-center justify-between px-5">
                      <span>🛒 Корзина ({cartCount})</span>
                      <span>{cartTotal.toLocaleString()} сум</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {status === S.CART && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 flex items-center gap-3 border-b border-white/10">
              <button onClick={() => setStatus(S.BROWSE)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">←</button>
              <h2 className="font-bold text-lg">Оформление заказа</h2>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-orange-400 text-sm">{(item.price * item.qty).toLocaleString()} сум</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-white/10 hover:bg-red-500/30 rounded-full text-sm font-bold">−</button>
                    <span className="w-5 text-center font-bold">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-7 h-7 bg-orange-500/20 hover:bg-orange-500/40 rounded-full text-sm font-bold">+</button>
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="text-xs text-gray-400 mb-1 block">📍 Адрес (кликните на карту)</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="ул. Амира Темура, 1..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 transition-all" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-gray-400 mb-1 block">💳 Оплата</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setPayment('Наличные')} className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${payment === 'Наличные' ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-white/5 border-white/10'}`}>💵 Наличные</button>
                  <button onClick={() => setPayment('Карта')} className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${payment === 'Карта' ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-white/5 border-white/10'}`}>💳 Карта</button>
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

            </div>
            <div className="p-4 border-t border-white/10 space-y-3 bg-black/40">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Сумма заказа</span>
                <span className="font-bold">{cartTotal.toLocaleString()} сум</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Оплата</span>
                <span className="font-bold">{payment === 'Карта' && selectedCardId ? `Карта •••• ${savedCards.find(c=>c.id===selectedCardId)?.number?.slice(-4) || ''}` : payment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Доставка</span>
                <span className="text-green-400 font-semibold">Бесплатно</span>
              </div>
              {cartTotal < (selectedRest?.minOrder || 0) && (
                <p className="text-xs text-red-400">Минимальный заказ: {selectedRest?.minOrder?.toLocaleString()} сум</p>
              )}
              <button onClick={placeOrder} disabled={!address || cartTotal < (selectedRest?.minOrder || 0)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-lg shadow-lg">
                ✅ Оформить заказ
              </button>
            </div>
          </div>
        )}

        {status === S.TRACKING && courier && (
          <div className="flex-1 p-5 space-y-4">
            <div className="space-y-2">
              {ORDER_STATUSES.map((s, idx) => (
                <div key={s.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${idx <= orderStatus ? 'bg-white/10 border-white/20 shadow-md' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <span className="text-xl">{s.icon}</span>
                  <span className={`font-semibold text-sm ${idx <= orderStatus ? s.color : 'text-gray-500'}`}>{s.label}</span>
                  {idx === orderStatus && idx < 4 && <div className="ml-auto w-3 h-3 rounded-full bg-current animate-pulse"></div>}
                  {idx < orderStatus && <span className="ml-auto text-green-400 text-xs">✓</span>}
                </div>
              ))}
            </div>

            {orderStatus >= 2 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-2xl">{courier.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold">{courier.name}</p>
                    <p className="text-xs text-gray-400">{courier.transport} · ⭐ {courier.rating}</p>
                  </div>
                  {eta > 0 && orderStatus >= 3 && (
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">~{eta}с</p>
                    </div>
                  )}
                </div>
                {orderStatus >= 3 && (
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-1">
              {cartItems.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span className="text-gray-300">{i.emoji} {i.name} ×{i.qty}</span>
                  <span>{(i.price * i.qty).toLocaleString()} сум</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                <span>Итого ({payment})</span>
                <span className="text-orange-400">{cartTotal.toLocaleString()} сум</span>
              </div>
            </div>

            {orderStatus < 2 && (
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold">❌ Отменить заказ</button>
            )}
          </div>
        )}

        {status === S.DONE && courier && (
          <div className="flex-1 p-6 flex flex-col items-center text-center gap-5">
            <div className="text-7xl animate-bounce">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Доставлено!</h2>
              <p className="text-gray-400 text-sm mt-1">Оцените курьера {courier.name}</p>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}
                  className="text-4xl hover:scale-110">
                  {s <= (hoverRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <button onClick={submitRating} disabled={rating === 0} className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 disabled:opacity-40 rounded-2xl font-bold text-black text-lg">✅ Отправить</button>
          </div>
        )}

        {status === S.RATED && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
            <div className="text-7xl">🙏</div>
            <h2 className="text-2xl font-bold">Спасибо!</h2>
            <button onClick={reset} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl font-bold">Новый заказ</button>
          </div>
        )}

        {status === S.CANCELLED && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
            <div className="text-6xl">❌</div>
            <h2 className="text-xl font-bold text-red-400">Заказ отменён</h2>
            <button onClick={reset} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl font-bold">Новый заказ</button>
          </div>
        )}
      </div>

      <div className={`flex-1 relative bg-[#0a0a0f] overflow-hidden ${mapType === 'dark' ? 'dark-map' : ''}`}>
        {selectedDish ? (
          <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedDish(null)} className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all shadow-lg flex items-center gap-2">
              <span>←</span> Назад к карте
            </button>
            <div className="text-[150px] mb-8 drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer">{selectedDish.emoji}</div>
            <h1 className="text-5xl font-black mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">{selectedDish.name}</h1>
            <p className="text-2xl text-gray-300 text-center max-w-3xl mb-10 leading-relaxed font-light">{selectedDish.desc}</p>
            <div className="text-5xl font-bold text-white mb-12 bg-white/10 px-8 py-4 rounded-3xl border border-white/10 shadow-xl">
              {selectedDish.price.toLocaleString()} сум
            </div>
            <button onClick={() => { addToCart(selectedDish); setSelectedDish(null); }} className="px-16 py-6 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 hover:-translate-y-2 transition-all rounded-[30px] text-2xl font-black text-white shadow-2xl shadow-orange-500/40 flex items-center gap-4">
              <span>🛒</span> Добавить в корзину
            </button>
          </div>
        ) : (
          <>
            {/* Floating Map Toggle */}
        <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex gap-1 shadow-2xl">
            <button onClick={() => setMapType('dark')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'dark' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Схема</button>
            <button onClick={() => setMapType('satellite')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mapType === 'satellite' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>Спутник</button>
        </div>

        <Map defaultViewState={{ longitude: 69.2492, latitude: 41.3123, zoom: 13 }}
          mapStyle={mapType === 'dark' ? mapStyleDark : mapStyleSatellite} attributionControl={false} onClick={handleMapClick} maxZoom={18}>
          <NavigationControl position="top-right" />

          {delivPath.length > 1 && (status === S.TRACKING || status === S.DONE) && (
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
                    'line-color': '#f97316', 
                    'line-width': routePulse ? 8 : 5,
                    'line-opacity': routePulse ? 1 : 0.7,
                    'line-opacity-transition': { duration: 800 },
                    'line-width-transition': { duration: 800 }
                }} 
              />
            </Source>
          )}

          {RESTAURANTS.map(r => (
            <Marker key={r.id} longitude={r.lng} latitude={r.lat} onClick={(e) => { e.originalEvent.stopPropagation(); if (status === S.BROWSE) setSelectedRest(r); }}>
              <div className={`cursor-pointer transition-all ${selectedRest?.id === r.id ? 'scale-125' : 'hover:scale-110'}`}>
                <div className={`text-2xl drop-shadow-lg ${selectedRest?.id === r.id ? 'ring-2 ring-orange-400 rounded-full' : ''}`}>🍽️</div>
                <div className="text-xs bg-black/70 text-white px-1.5 py-0.5 rounded-full text-center mt-0.5 whitespace-nowrap border border-white/10">{r.name}</div>
              </div>
            </Marker>
          ))}

          <Marker longitude={userPos[0]} latitude={userPos[1]}>
            <div className="relative flex items-center justify-center cursor-pointer">
              <div className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
              <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full z-10 shadow-lg"></div>
              <div className="absolute -top-7 text-xs bg-blue-600 px-2 rounded whitespace-nowrap">Мой дом</div>
            </div>
          </Marker>

          {status === S.TRACKING && orderStatus >= 2 && courier && (
            <Marker longitude={courierPos[0]} latitude={courierPos[1]}>
              <div className="bg-orange-500 text-white font-black text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative">
                {courier.avatar}
                <div className="absolute -top-7 text-xs bg-black/80 px-2 rounded-full whitespace-nowrap">{courier.name}</div>
              </div>
            </Marker>
          )}
        </Map>
        </>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">❌ Отменить заказ</h2>
            <input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Причина..." className="w-full bg-white/10 p-3 rounded-xl mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-white/10 rounded-xl">Назад</button>
              <button onClick={cancelOrder} disabled={!cancelReason} className="flex-1 py-3 bg-red-600 rounded-xl">Отменить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
