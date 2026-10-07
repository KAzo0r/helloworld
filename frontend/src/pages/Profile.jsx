import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Пользователь',
    email: '',
    phone: '+998 90 123 45 67',
    address: 'Ташкент, Мирзо-Улугбек',
    cards: [
      { id: 1, number: '8600 1234 5678 9012', type: 'Uzcard', exp: '12/26' }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setProfile(p => ({ ...p, ...parsed }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const saveProfile = () => {
    localStorage.setItem('user', JSON.stringify(profile));
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const [newCard, setNewCard] = useState({ number: '', exp: '', type: 'Uzcard' });
  const [showAddCard, setShowAddCard] = useState(false);

  const addCard = () => {
    if(newCard.number.length < 16) return alert('Введите корректный номер карты');
    const updated = { ...profile, cards: [...(profile.cards || []), { id: Date.now(), ...newCard }] };
    setProfile(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setShowAddCard(false);
    setNewCard({ number: '', exp: '', type: 'Uzcard' });
  };

  const removeCard = (id) => {
    const updated = { ...profile, cards: profile.cards.filter(c => c.id !== id) };
    setProfile(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Мой Профиль</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-400">{profile.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Имя</label>
              <input 
                value={profile.name} 
                onChange={e => handleChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <input 
                value={profile.email} 
                onChange={e => handleChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Телефон</label>
              <input 
                value={profile.phone} 
                onChange={e => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Домашний адрес (для такси и доставки)</label>
              <input 
                value={profile.address} 
                onChange={e => handleChange('address', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            {isEditing ? (
              <>
                <button onClick={saveProfile} className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all">Сохранить</button>
                <button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Отмена</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-bold transition-all">Изменить профиль</button>
            )}
          </div>
          {saved && <p className="mt-4 text-green-400 text-sm">✅ Профиль успешно сохранен!</p>}
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">💳 Мои карты</h2>
            <button onClick={() => setShowAddCard(!showAddCard)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all">
              + Добавить карту
            </button>
          </div>

          <div className="space-y-4">
            {(profile.cards || []).map(card => (
              <div key={card.id} className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-black/40">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-8 rounded flex items-center justify-center font-bold text-xs ${card.type === 'Uzcard' ? 'bg-green-600' : card.type === 'Humo' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    {card.type}
                  </div>
                  <div>
                    <p className="font-mono text-lg">{card.number.replace(/(\d{4})/g, '$1 ')}</p>
                    <p className="text-xs text-gray-400">Срок: {card.exp}</p>
                  </div>
                </div>
                <button onClick={() => removeCard(card.id)} className="text-red-400 hover:text-red-300 p-2">🗑️</button>
              </div>
            ))}
            {!(profile.cards?.length) && <p className="text-gray-500 text-sm">У вас пока нет сохраненных карт</p>}
          </div>

          {showAddCard && (
            <div className="mt-6 p-6 border border-white/10 rounded-2xl bg-white/5">
              <h3 className="font-semibold mb-4">Добавление новой карты</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder="Номер карты (16 цифр)" 
                  maxLength={16}
                  value={newCard.number} 
                  onChange={e => setNewCard({...newCard, number: e.target.value.replace(/\D/g,'')})}
                  className="col-span-2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
                />
                <input 
                  placeholder="Срок (ММ/ГГ)" 
                  maxLength={5}
                  value={newCard.exp} 
                  onChange={e => setNewCard({...newCard, exp: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
                />
                <select 
                  value={newCard.type} 
                  onChange={e => setNewCard({...newCard, type: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="Uzcard">Uzcard</option>
                  <option value="Humo">Humo</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addCard} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all">Добавить</button>
                <button onClick={() => setShowAddCard(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Отмена</button>
              </div>
            </div>
          )}
        </div>

        <button onClick={logout} className="px-8 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 rounded-xl transition-all font-bold">
          🚪 Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
