import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const EV_STATIONS = [
  { id: 1, name: 'TokBor — Экопарк', address: 'ул. Навои, 16', power: 50, connectors: 4, available: 3, status: 'Свободно', price: '1200 сум/кВт·ч', type: 'CCS + CHAdeMO', district: 'Мирзо-Улугбек', hours: '24/7' },
  { id: 2, name: 'Megawatt — ЦУМ', address: 'ул. Амира Темура, 1', power: 120, connectors: 6, available: 0, status: 'Занято', price: '1500 сум/кВт·ч', type: 'CCS2', district: 'Юнусабад', hours: '08:00–23:00' },
  { id: 3, name: 'Makro Superstore EV', address: 'Чиланзарский массив, 8', power: 22, connectors: 2, available: 2, status: 'Свободно', price: '900 сум/кВт·ч', type: 'Type 2', district: 'Чиланзар', hours: '09:00–22:00' },
  { id: 4, name: 'TokBor — Shohsaroy', address: 'пр. Бунёдкор, 54', power: 100, connectors: 8, available: 5, status: 'Свободно', price: '1400 сум/кВт·ч', type: 'CCS + Type2', district: 'Шохсарой', hours: '24/7' },
  { id: 5, name: 'Tashkent City EV Hub', address: 'Tashkent City Mall', power: 150, connectors: 10, available: 2, status: 'Ограничено', price: '1600 сум/кВт·ч', type: 'CCS2 Ultra', district: 'Центр', hours: '24/7' },
  { id: 6, name: 'PlugShare — Амир Темур', address: 'Хиёбон Амира Темура', power: 7, connectors: 3, available: 3, status: 'Свободно', price: '700 сум/кВт·ч', type: 'Type 2 (медленная)', district: 'Центр', hours: '24/7' },
  { id: 7, name: 'Korzinka EV', address: 'Кузнечная, 80', power: 50, connectors: 2, available: 1, status: 'Ограничено', price: '1100 сум/кВт·ч', type: 'CCS2', district: 'Яшнабад', hours: '08:00–22:00' },
];

export default function EVCharging() {
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString('ru'));

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date().toLocaleTimeString('ru')), 10000);
    return () => clearInterval(t);
  }, []);

  const filtered = EV_STATIONS.filter(s =>
    (filter === 'Все' || s.status === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.district.toLowerCase().includes(search.toLowerCase()))
  );

  const totalFree = EV_STATIONS.reduce((sum, s) => sum + s.available, 0);
  const totalConnectors = EV_STATIONS.reduce((sum, s) => sum + s.connectors, 0);

  const statusColor = (s) => s === 'Свободно' ? 'text-green-400 bg-green-500/10 border-green-500/20' : s === 'Занято' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  const dotColor = (s) => s === 'Свободно' ? 'bg-green-400' : s === 'Занято' ? 'bg-red-400' : 'bg-yellow-400';

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-500 mb-2">⚡ EV-Зарядки Ташкента</h1>
          <p className="text-gray-400">Электрозарядные станции в реальном времени</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live · {liveTime}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Станций в городе', val: '48', icon: '⚡', color: 'text-green-400' },
          { label: 'Свободных постов', val: totalFree, icon: '✅', color: 'text-cyan-400' },
          { label: 'Всего постов', val: totalConnectors, icon: '🔌', color: 'text-blue-400' },
          { label: 'Макс. мощность', val: '150 кВт', icon: '🔋', color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Поиск по названию или району..."
          className="flex-1 min-w-64 bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-green-500/60 transition-all text-sm placeholder-gray-500"
        />
        {['Все', 'Свободно', 'Ограничено', 'Занято'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-green-500 text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(station => (
          <div key={station.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-green-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{station.name}</h3>
                <p className="text-xs text-gray-500 mt-1">📍 {station.address}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ml-4 flex-shrink-0 ${statusColor(station.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dotColor(station.status)} ${station.status === 'Свободно' ? 'animate-pulse' : ''}`}></div>
                {station.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Мощность</p>
                <p className="font-bold text-green-400">{station.power} кВт</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Свободно</p>
                <p className="font-bold text-cyan-400">{station.available}/{station.connectors}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-400 mb-4">
              <div className="flex justify-between"><span>Тип:</span><span className="text-white">{station.type}</span></div>
              <div className="flex justify-between"><span>Цена:</span><span className="text-green-400">{station.price}</span></div>
              <div className="flex justify-between"><span>Часы:</span><span className="text-white">{station.hours}</span></div>
            </div>

            <Link to="/map" className="block w-full">
              <button className="w-full py-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 rounded-xl font-semibold text-sm transition-all opacity-0 group-hover:opacity-100">
                🗺️ Маршрут сюда
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
