import React, { useState, useEffect } from 'react';

const ROADS = [
  { name: 'пр. Амира Темура', score: 8, color: 'bg-red-500', status: 'Пробка', from: 'Площадь Мустакиллик', to: 'ЦУМ', time: 22 },
  { name: 'ул. Навои', score: 6, color: 'bg-orange-500', status: 'Затруднено', from: 'Хамза', to: 'Алайский', time: 14 },
  { name: 'ул. Шота Руставели', score: 3, color: 'bg-yellow-500', status: 'Умеренно', from: 'Сергели', to: 'Центр', time: 8 },
  { name: 'Малая кольцевая', score: 1, color: 'bg-green-500', status: 'Свободно', from: 'Юнусабад', to: 'Чиланзар', time: 5 },
  { name: 'пр. Бунёдкор', score: 4, color: 'bg-yellow-400', status: 'Умеренно', from: 'Стадион', to: 'Шохсарой', time: 10 },
  { name: 'ул. Фарғона йўли', score: 7, color: 'bg-red-400', status: 'Затруднено', from: 'ТЦ Ривьера', to: 'Аэропорт', time: 18 },
];

const INCIDENTS = [
  { type: '🚧', title: 'Ремонт дороги', loc: 'ул. Навои, 44', time: '10:30', severity: 'high' },
  { type: '🚗', title: 'ДТП устранено', loc: 'пр. Амира Темура, 112', time: '11:45', severity: 'medium' },
  { type: '⚠️', title: 'Сужение полос', loc: 'Малая кольцевая (3 км)', time: '09:00', severity: 'low' },
  { type: '🚕', title: 'Перекрытие митинга', loc: 'Пл. Мустакиллик', time: '12:00', severity: 'high' },
];

const STATS = [
  { label: 'Баллы пробок', value: '6/10', icon: '🚦', color: 'text-red-400', sub: 'Выше среднего' },
  { label: 'Ср. скорость', value: '28 км/ч', icon: '🚗', color: 'text-orange-400', sub: 'Норма: 50 км/ч' },
  { label: 'ДТП сегодня', value: '3', icon: '⚠️', color: 'text-yellow-400', sub: '1 активно' },
  { label: 'Камеры онлайн', value: '247', icon: '📹', color: 'text-green-400', sub: 'из 312' },
];

export default function Traffic() {
  const [score, setScore] = useState(0);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString('ru'));

  useEffect(() => {
    const t = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('ru'));
    }, 1000);

    // Подтягиваем реальные пробки из Yandex Maps
    const initYmaps = () => {
       if (window.ymaps && window.ymaps.Map) {
           window.ymaps.ready(() => {
               try {
                   const mapContainer = document.createElement('div');
                   mapContainer.style.display = 'none';
                   document.body.appendChild(mapContainer);

                   const map = new window.ymaps.Map(mapContainer, {
                       center: [41.311081, 69.240562], // Ташкент
                       zoom: 12,
                       controls: []
                   });
                   const actualProvider = new window.ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
                   actualProvider.setMap(map);
                   
                   actualProvider.state.events.add('change', () => {
                       const level = actualProvider.state.get('level');
                       if (level !== undefined) {
                           setScore(level);
                       }
                   });
               } catch (e) {
                   console.error("Yandex Error", e);
               }
           });
       } else {
           setTimeout(initYmaps, 1000);
       }
    };
    initYmaps();

    return () => clearInterval(t);
  }, []);

  const getScoreColor = (s) => s >= 7 ? 'text-red-400' : s >= 4 ? 'text-yellow-400' : 'text-green-400';
  const getBgColor = (s) => s >= 7 ? 'bg-red-500' : s >= 4 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
            🚦 Трафик Ташкента
          </h1>
          <p className="text-gray-400 mt-1">Мониторинг дорог в реальном времени</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live · {liveTime}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-3">{s.icon}</div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>
              {s.label === 'Баллы пробок' ? (score === 0 ? '...' : `${score}/10`) : s.value}
            </p>
            <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Live Score Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Общий балл пробок</h2>
          <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score === 0 ? '...' : `${score}/10`}</span>
        </div>
        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${getBgColor(score)}`}
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Свободно</span>
          <span>Умеренно</span>
          <span>Пробки</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Road List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">Основные дороги</h2>
          <div className="space-y-3">
            {ROADS.map((road, i) => (
              <div
                key={i}
                onClick={() => setSelectedRoad(selectedRoad?.name === road.name ? null : road)}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
              >
                <div className={`w-3 h-12 rounded-full ${road.color} flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{road.name}</p>
                  <p className="text-xs text-gray-500 truncate">{road.from} → {road.to}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${road.score >= 7 ? 'text-red-400' : road.score >= 4 ? 'text-yellow-400' : 'text-green-400'}`}>{road.status}</p>
                  <p className="text-xs text-gray-500">~{road.time} мин</p>
                </div>
              </div>
            ))}
          </div>
          {selectedRoad && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
              <h3 className="font-bold text-cyan-400 mb-2">📍 {selectedRoad.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Откуда:</span> <span>{selectedRoad.from}</span></div>
                <div><span className="text-gray-500">Куда:</span> <span>{selectedRoad.to}</span></div>
                <div><span className="text-gray-500">Балл:</span> <span>{selectedRoad.score}/10</span></div>
                <div><span className="text-gray-500">Время:</span> <span>~{selectedRoad.time} мин</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Incidents */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">Инциденты сегодня</h2>
          <div className="space-y-4">
            {INCIDENTS.map((inc, i) => (
              <div key={i} className={`flex gap-4 p-4 rounded-xl border transition-all hover:-translate-x-1 ${
                inc.severity === 'high' ? 'bg-red-900/10 border-red-500/20' :
                inc.severity === 'medium' ? 'bg-orange-900/10 border-orange-500/20' :
                'bg-yellow-900/10 border-yellow-500/20'
              }`}>
                <span className="text-3xl flex-shrink-0">{inc.type}</span>
                <div>
                  <p className="font-semibold text-sm">{inc.title}</p>
                  <p className="text-xs text-gray-400 mt-1">📍 {inc.loc}</p>
                  <p className="text-xs text-gray-500 mt-1">🕐 {inc.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-green-900/20 to-cyan-900/10 rounded-xl border border-green-500/20">
            <h3 className="font-semibold text-green-400 mb-2">💡 Рекомендация AI</h3>
            <p className="text-sm text-gray-300">
              Избегайте центра до 14:00. Оптимальный маршрут: ул. Шота Руставели или Малая кольцевая. Метро — самый быстрый вариант сейчас.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
