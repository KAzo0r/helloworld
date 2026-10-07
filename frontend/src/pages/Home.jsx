// Home Page Component
// Designed with React, Tailwind CSS, and Framer Motion
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const [weather, setWeather] = useState('...');
  const [weatherIcon, setWeatherIcon] = useState('🌤️');
  const [traffic, setTraffic] = useState('...');
  const [metroStatus, setMetroStatus] = useState('...');

  useEffect(() => {
    // 1. Реальная погода (Open-Meteo API, Tashkent)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2995&longitude=69.2401&current_weather=true')
      .then(res => res.json())
      .then(data => {
         if(data && data.current_weather) {
            setWeather(`${Math.round(data.current_weather.temperature)}°C`);
            const code = data.current_weather.weathercode;
            if(code <= 1) setWeatherIcon('☀️');
            else if(code <= 3) setWeatherIcon('⛅');
            else if(code <= 60) setWeatherIcon('☁️');
            else if(code <= 69) setWeatherIcon('🌧️');
            else if(code <= 79) setWeatherIcon('❄️');
            else setWeatherIcon('⛈️');
         }
      })
      .catch(() => setWeather('Ошибка'));

    // 2. Реальное расписание метро
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 24) setMetroStatus('Работает');
    else setMetroStatus('Закрыто (ночь)');

    // 3. Реальные пробки (Yandex Maps API)
    const initYmaps = () => {
       if (window.ymaps && window.ymaps.Map) {
           window.ymaps.ready(() => {
               try {
                   // Невидимый контейнер для карты
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
                           setTraffic(`${level} баллов`);
                       }
                   });
                   
                   // Fallback если пробки не отдают уровень сразу
                   setTimeout(() => {
                       if (traffic === '...') setTraffic('Нет данных');
                   }, 5000);
               } catch (e) {
                   setTraffic('Недоступно');
               }
           });
       } else {
           setTimeout(initYmaps, 1000);
       }
    };
    initYmaps();
  }, []);
  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-hidden font-sans">
        {/* HERO SECTION */}
        <section className="relative h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10"></div>
                 <img src="/assets/virtual_tashkent.jpg" alt="Tashkent 3D" className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
            </div>

            <div className="relative z-20 text-center max-w-4xl w-full">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600"
                >
                    Smart Tashkent
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-xl md:text-2xl text-gray-300 mb-10"
                >
                    Единая смарт-платформа столицы. Исследуй, находи, управляй.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex relative max-w-2xl mx-auto mb-10"
                >
                    <input 
                        type="text" 
                        placeholder="Поиск по Ташкенту (адреса, организации, места)..." 
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full py-4 pl-8 pr-32 outline-none focus:border-cyan-400 transition-all text-lg shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                    />
                    <button className="absolute right-2 top-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full px-6 py-2 font-bold hover:scale-105 transition-transform text-white">
                        Искать
                    </button>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap justify-center gap-6"
                >
                    <Link to="/map" className="px-8 py-3 rounded-full bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center gap-2">
                        <span>🗺️</span> Открыть карту
                    </Link>
                    <Link to="/ai" className="px-8 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center gap-2">
                        <span>🤖</span> AI-Помощник
                    </Link>
                </motion.div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-10 left-0 w-full px-4 md:px-8 flex justify-center gap-4 md:gap-6 flex-wrap z-20"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-40 md:w-48 hover:-translate-y-2 transition-transform cursor-pointer shadow-xl">
                    <span className="text-3xl md:text-4xl">{weatherIcon}</span>
                    <div>
                        <p className="text-xs md:text-sm text-gray-400">Погода</p>
                        <p className="text-lg md:text-xl font-bold">{weather}</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-40 md:w-48 hover:-translate-y-2 transition-transform cursor-pointer shadow-xl">
                    <span className="text-3xl md:text-4xl">🚦</span>
                    <div>
                        <p className="text-xs md:text-sm text-gray-400">Пробки</p>
                        <p className="text-lg md:text-xl font-bold text-red-400">{traffic}</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-40 md:w-48 hover:-translate-y-2 transition-transform cursor-pointer shadow-xl">
                    <span className="text-3xl md:text-4xl">🚇</span>
                    <div>
                        <p className="text-xs md:text-sm text-gray-400">Транспорт</p>
                        <p className="text-lg md:text-xl font-bold text-green-400">{metroStatus}</p>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* QUICK CATEGORIES */}
        <section className="py-20 px-8 max-w-7xl mx-auto relative z-10">
            <h2 className="text-3xl font-bold mb-10 border-l-4 border-cyan-400 pl-4">Быстрые категории</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { title: 'Рестораны', emoji: '🍽️', link: '/food' },
                  { title: 'Локации', emoji: '📍', link: '/map' },
                  { title: 'Транспорт', emoji: '🚌', link: '/transport' },
                  { title: 'Больницы', emoji: '🏥', link: '/hospitals' },
                  { title: 'Школы', emoji: '🏫', link: '/schools' },
                  { title: 'Зарядки', emoji: '⚡', link: '/ev' },
                ].map((cat, i) => (
                    <Link to={cat.link} key={i}>
                        <motion.div 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            className="h-full bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors shadow-lg"
                        >
                            <span className="text-3xl mb-2">{cat.emoji}</span>
                            <span className="font-semibold text-sm">{cat.title}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>

        {/* POPULAR PLACES & NEWS / EVENTS */}
        <section className="py-10 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-8 border-l-4 border-blue-500 pl-4">Популярные места</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Ташкент Сити', desc: 'Бизнес-центр, Парк, Развлечения', img: '/assets/virtual_tashkent.jpg' },
                        { title: 'Амир Темур Хиёбони', desc: 'Сквер, Музей, Центр', img: '/assets/smart_tashkent.jpg' }
                    ].map((item, i) => (
                        <div key={i} className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer shadow-lg">
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                <img src={item.img} alt="Place" className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-10">
                <div>
                    <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-4">Последние новости</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-colors">
                            <p className="text-xs text-cyan-400 mb-1">Сегодня, 14:30</p>
                            <h4 className="font-semibold">Открыта новая линия умных светофоров</h4>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-colors">
                            <p className="text-xs text-cyan-400 mb-1">Вчера, 09:15</p>
                            <h4 className="font-semibold">В Ташкенте установили еще 50 EV-зарядок</h4>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">События</h2>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-colors flex gap-4 items-center">
                        <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-center min-w-[60px]">
                            <span className="block text-xl font-bold">15</span>
                            <span className="block text-xs uppercase">Окт</span>
                        </div>
                        <div>
                            <h4 className="font-semibold">Project: Urban Tech</h4>
                            <p className="text-sm text-gray-400">IT Park, Ташкент</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <footer className="bg-black py-10 mt-20 border-t border-white/10 text-center text-gray-500">
            <h2 className="text-xl font-bold text-white mb-2">Smart Tashkent</h2>
            <p>© 2026 Все права защищены.</p>
        </footer>
    </div>
  );
}
