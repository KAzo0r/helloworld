import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Импорт всех страниц
import Home from './pages/Home';
import MapPage from './pages/Map';
import Traffic from './pages/Traffic';
import Schools from './pages/Schools';
import Hospitals from './pages/Hospitals';
import EVCharging from './pages/EVCharging';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Taxi from './pages/Taxi';
import FoodDelivery from './pages/FoodDelivery';
import Transport from './pages/Transport';

// Layout компонент (оболочка для всех страниц с меню)
function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } catch(e) {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Боковое или верхнее меню */}
      <nav className="p-4 border-b border-gray-800 flex flex-wrap gap-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 items-center text-sm">
        <Link to="/" className="text-[#00f0ff] font-bold text-base">Tashkent Innovates</Link>
        <Link to="/map" className="hover:text-[#00f0ff]">Smart Map</Link>
        <Link to="/traffic" className="hover:text-[#00f0ff]">Пробки</Link>
        <Link to="/schools" className="hover:text-[#00f0ff]">Школы</Link>
        <Link to="/ev" className="hover:text-[#00f0ff]">EV Зарядки</Link>
        <Link to="/ai" className="hover:text-[#00f0ff] text-purple-400">AI Помощник</Link>
        <Link to="/taxi" className="hover:text-[#00f0ff] text-yellow-400">🚕 Такси</Link>
        <Link to="/food" className="hover:text-[#00f0ff] text-orange-400">🍔 Еда</Link>
        <Link to="/transport" className="hover:text-[#00f0ff] text-blue-400">🚌 Автобусы</Link>
        
        <div className="ml-auto flex gap-4 items-center">
            {/* Translate Widget Placeholder */}
            <div id="google_translate_element" className="scale-90 opacity-80 hover:opacity-100 transition-opacity mr-2"></div>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => document.body.classList.toggle('light-theme')}
              className="text-xl cursor-pointer hover:scale-110 transition-transform px-2"
              title="Переключить тему"
            >
              🌓
            </button>

            {user ? (
              <>
                <Link to="/profile" className="hover:text-green-400 font-bold">👤 {user.name}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-red-400 hover:text-red-300 font-bold">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-white cursor-pointer ml-2">Выйти</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-400 hover:text-white px-4 py-1.5 border border-gray-600 rounded-lg hover:border-white transition-colors">Войти</Link>
            )}
        </div>
      </nav>
      {/* Контент страницы */}
      <main>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/ev" element={<EVCharging />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/taxi" element={<Taxi />} />
          <Route path="/food" element={<FoodDelivery />} />
          <Route path="/transport" element={<Transport />} />
          {/* Здесь будут добавлены остальные 20+ роутов */}
          <Route path="*" element={<div className="p-10">404 - Страница не найдена</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
