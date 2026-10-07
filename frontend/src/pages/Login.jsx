import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'admin') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin', email }));
      navigate('/dashboard');
    } else if (email && password) {
      localStorage.setItem('user', JSON.stringify({ role: 'user', name: email.split('@')[0], email }));
      navigate('/');
    } else {
      setError('Заполните все поля');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
          Smart Platform
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Войдите для доступа к сервисам</p>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/60 transition-all"
              placeholder="admin@gmail.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/60 transition-all"
              placeholder="••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
