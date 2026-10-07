import React, { useState, useEffect } from 'react';

const INITIAL_STATS = [
  { label: 'Активные Такси', val: 142, icon: '🚕', color: 'text-yellow-400', trend: '↑ +12 сегодня' },
  { label: 'Доставки Еды', val: 87, icon: '🍔', color: 'text-orange-400', trend: '↑ +5 в пути' },
  { label: 'EV Зарядки', val: 48, icon: '⚡', color: 'text-green-400', trend: '16 свободны' },
  { label: 'Балл Пробок', val: 6, icon: '🚦', color: 'text-red-400', trend: 'Выше нормы' },
];

export default function Dashboard() {
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString('ru'));
  const [stats, setStats] = useState(INITIAL_STATS);
  const [revenue, setRevenue] = useState(15420000);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      try { setUser(JSON.parse(data)); } catch(e){}
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('ru'));
      
      // Имитация активности в реальном времени
      if (Math.random() > 0.5) {
        setStats(prev => prev.map((s, i) => {
          if (i === 0) return { ...s, val: s.val + (Math.random() > 0.5 ? 1 : -1) }; // Такси
          if (i === 1) return { ...s, val: s.val + (Math.random() > 0.5 ? 1 : -1) }; // Еда
          return s;
        }));
      }
      
      if (Math.random() > 0.7) {
        setRevenue(prev => prev + Math.floor(Math.random() * 50000));
      }
      
    }, 2000);
    return () => clearInterval(t);
  }, []);

  if (user?.role !== 'admin' && user?.email !== 'admin@gmail.com') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8 text-center">
        <div>
          <h1 className="text-6xl mb-4">🔒</h1>
          <h2 className="text-2xl font-bold mb-2">Доступ закрыт</h2>
          <p className="text-gray-400">Эта страница доступна только администраторам.</p>
          <button onClick={() => window.location.href='/login'} className="mt-6 px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20">Войти как Admin</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white min-h-screen bg-[#050505]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-500">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Центр управления платформой</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">Выручка за сегодня</p>
            <p className="text-xl font-bold text-green-400">{revenue.toLocaleString()} сум</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300 font-mono">{liveTime}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform shadow-lg">
            <span className="text-4xl mb-3">{stat.icon}</span>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={'text-3xl font-black ' + stat.color}>{stat.val}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">Последние транзакции (Живые)</h2>
          <div className="space-y-4">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{Math.random() > 0.5 ? '🚕' : '🍔'}</span>
                  <div>
                    <p className="font-semibold text-sm">Оплата заказа #{Math.floor(Math.random() * 10000)}</p>
                    <p className="text-xs text-gray-500">Карта **** {Math.floor(1000 + Math.random() * 9000)}</p>
                  </div>
                </div>
                <span className="font-bold text-green-400">+{Math.floor(15000 + Math.random() * 50000).toLocaleString()} сум</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">Статус серверов</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3">
              <span className="text-gray-400">Geo & Map Engine</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Online (12ms)</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-gray-400">Taxi Dispatch System</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Online (18ms)</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-gray-400">Food Delivery API</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Online (22ms)</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-gray-400">Payment Gateway</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Online (45ms)</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-gray-400">Traffic AI Engine</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">High Load (150ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
