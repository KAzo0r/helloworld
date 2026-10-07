import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const SCHOOLS = [
  { id: 1, name: 'Westminster International School', type: 'Международная', rating: 9.8, students: 1200, district: 'Мирзо-Улугбек', programs: ['IB', 'A-Level', 'IGCSE'], fee: 'Платная', lat: 41.322, lng: 69.270 },
  { id: 2, name: 'IT Park Academy', type: 'Специализированная', rating: 9.5, students: 800, district: 'Юнусабад', programs: ['Программирование', 'AI', 'Кибербезопасность'], fee: 'Платная', lat: 41.345, lng: 69.290 },
  { id: 3, name: 'Школа №110 (Математическая)', type: 'Государственная', rating: 9.2, students: 1500, district: 'Чиланзар', programs: ['Математика', 'Физика', 'Олимпиады'], fee: 'Бесплатная', lat: 41.320, lng: 69.230 },
  { id: 4, name: 'Maktab №50 (IT-уклон)', type: 'Государственная', rating: 8.9, students: 1100, district: 'Сергели', programs: ['Информатика', 'Робототехника', 'IT'], fee: 'Бесплатная', lat: 41.300, lng: 69.260 },
  { id: 5, name: 'Tashkent City School', type: 'Частная', rating: 9.1, students: 650, district: 'Яшнабад', programs: ['Английский', 'Китайский', 'Бизнес'], fee: 'Платная', lat: 41.332, lng: 69.240 },
  { id: 6, name: 'Cambridge International', type: 'Международная', rating: 9.6, students: 900, district: 'Мирабад', programs: ['Cambridge', 'IELTS Prep', 'Sciences'], fee: 'Платная', lat: 41.318, lng: 69.260 },
];

const TYPES = ['Все', 'Государственная', 'Частная', 'Международная', 'Специализированная'];

export default function Schools() {
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = SCHOOLS.filter(s =>
    (filter === 'Все' || s.type === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.district.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">🏫 Школы Ташкента</h1>
        <p className="text-gray-400">Рейтинг и информация об учебных заведениях</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Всего школ', val: '850', icon: '🏫', color: 'text-yellow-400' },
          { label: 'Ср. рейтинг', val: '8.2', icon: '⭐', color: 'text-orange-400' },
          { label: 'Международных', val: '24', icon: '🌍', color: 'text-cyan-400' },
          { label: 'IT-направлений', val: '120', icon: '💻', color: 'text-green-400' },
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
          className="flex-1 min-w-64 bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-yellow-500/60 transition-all text-sm placeholder-gray-500"
        />
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === t ? 'bg-yellow-500 text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* School Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(school => (
          <div
            key={school.id}
            onClick={() => setSelected(selected?.id === school.id ? null : school)}
            className={`bg-white/5 border rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${selected?.id === school.id ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-white/10'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block ${
                  school.fee === 'Бесплатная' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>{school.fee}</span>
                <h3 className="font-bold text-lg leading-tight mt-1">{school.name}</h3>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-2xl font-black text-yellow-400">{school.rating}</div>
                <div className="text-xs text-gray-500">рейтинг</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <span>📍 {school.district}</span>
              <span>·</span>
              <span>👥 {school.students} уч.</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {school.programs.map((p, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300">{p}</span>
              ))}
            </div>

            {selected?.id === school.id && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <Link to="/map" className="block">
                  <button className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold text-black text-sm hover:opacity-90 transition-opacity">
                    🗺️ Показать на карте
                  </button>
                </Link>
                <button className="w-full py-2 bg-white/10 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors">
                  📞 Контакты
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-500">Ничего не найдено по запросу «{search}»</div>
        )}
      </div>
    </div>
  );
}
