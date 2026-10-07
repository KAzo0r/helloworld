import React, { useState, useRef, useEffect } from 'react';

const CITY_KB = {
  метро: 'В Ташкенте 3 линии метро: Красная (Чиланзарская), Синяя (Узбекистанская) и Юнусабадская. Всего 29 станций. Метро работает с 05:30 до 00:00.',
  парковка: 'Умные парковки: ЦУМ (45 мест свободно), Экопарк (12 мест), Tashkent City (400 мест). Система онлайн-резервации доступна в приложении.',
  пробки: 'Сейчас в Ташкенте пробки 6 баллов. Основные заторы: Алайский базар, пр. Навои, ул. Амира Темура. Рекомендую объезд через ул. Шота Руставели.',
  зарядка: 'EV зарядки: TokBor Экопарк (50kW, свободна), Megawatt ЦУМ (120kW, занята), Makro (22kW, свободна). Tashkent City EV — 8 постов, 2 свободны.',
  погода: 'Сейчас в Ташкенте +24°C, ясно. AQI: 42 (хорошо). Прогноз на неделю: солнечно, без осадков. UV индекс: 7 (высокий).',
  школы: 'Лучшие школы района: Westminster School (международная), Школа №110 (математический уклон), Школа №50 (IT и информатика). Средний рейтинг: 8.2/10.',
  больницы: 'Ближайшие клиники: MDS (круглосуточно, 1.2 км), Akfa Medline (частная, 2.1 км), Городская №1 (экстренная помощь, 2.8 км).',
  транспорт: 'Автобусы в реальном времени: №14, №51, №72, №93. Время ожидания: 3-8 минут. Данные обновляются каждые 30 секунд.',
  tashkent: 'Ташкент — умный город будущего! Население 3.2 млн. 850 школ, 120 больниц, 48 EV-зарядок. Площадь 335 км². Столица Узбекистана.',
  маршрут: 'Для построения маршрута откройте Smart Map и нажмите на любую точку. По городу рекомендую метро (быстро), для коротких дистанций — автобус.',
};

const QUICK = [
  { label: '🚇 Расписание метро', q: 'метро' },
  { label: '🚦 Пробки сейчас', q: 'пробки' },
  { label: '⚡ EV-зарядки', q: 'зарядка' },
  { label: '🅿️ Парковки рядом', q: 'парковка' },
  { label: '🌤️ Погода', q: 'погода' },
  { label: '🏫 Школы', q: 'школы' },
];

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  for (const key of Object.keys(CITY_KB)) {
    if (lower.includes(key)) return CITY_KB[key];
  }
  if (lower.includes('привет') || lower.includes('salom')) return 'Salom! 👋 Я AI-Помощник Smart Tashkent. Спросите про транспорт, пробки, зарядки или любой район города!';
  if (lower.includes('спасибо') || lower.includes('рахмат')) return 'Пожалуйста! 😊 Рад помочь. Если есть ещё вопросы — спрашивайте!';
  return `По запросу "${msg}" — в базе данных умного города Ташкента есть информация о транспорте, инфраструктуре и сервисах. Попробуйте: метро, пробки, парковки, зарядки, погода, школы, больницы.`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Salom! 👋 Я — AI-Помощник Smart Tashkent.\n\nМогу помочь с:\n• 🚇 Метро и маршруты\n• 🚦 Пробки в реальном времени\n• ⚡ EV-зарядные станции\n• 🅿️ Умные парковки\n• 🌤️ Погода и AQI\n\nСпрашивайте!', time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const send = (text) => {
    const t = text || input.trim();
    if (!t) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: t, time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: getAIResponse(t), time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-black/60 backdrop-blur-xl border-r border-white/10 p-6 flex-col gap-4 hidden md:flex">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">🤖</div>
          <div>
            <h2 className="font-bold">AI Помощник</h2>
            <div className="flex items-center gap-1 text-xs text-green-400"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Онлайн</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Быстрые вопросы</p>
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q.q)} className="text-left text-sm px-4 py-3 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/50 transition-all text-gray-300 hover:text-white">{q.label}</button>
        ))}
        <div className="mt-auto p-4 bg-gradient-to-br from-purple-900/30 to-cyan-900/20 rounded-2xl border border-purple-500/20">
          <p className="text-xs text-gray-400 mb-1">🧠 Smart City AI</p>
          <p className="text-xs text-gray-500">Данные: IoT сенсоры Ташкента + реальное время</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h1 className="font-bold">Smart Tashkent AI</h1>
            <p className="text-xs text-gray-400">Интеллектуальный помощник умного города</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Live данные
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-lg ${msg.role === 'ai' ? 'bg-gradient-to-br from-purple-500 to-cyan-500' : 'bg-gradient-to-br from-blue-600 to-cyan-600'}`}>
                {msg.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white/8 border border-white/10 rounded-tl-none' : 'bg-gradient-to-br from-blue-600 to-cyan-600 rounded-tr-none'}`}>
                  {msg.text.split('\n').map((line, i) => <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>)}
                </div>
                <span className="text-xs text-gray-600 px-1">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">🤖</div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-white/8 border border-white/10 flex gap-1 items-center">
                {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Спросите про транспорт, пробки, зарядки..."
              className="flex-1 bg-white/8 border border-white/15 rounded-2xl px-5 py-3 outline-none focus:border-purple-500/60 transition-all text-sm placeholder-gray-500"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 transition-all flex items-center justify-center hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
