import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-elraizer.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INITIAL_USERS = [
  { id: 'ext3-id', username: 'EXT3', bio: 'Cuenta maestra · Fundador de Elraizer Community', avatar_color: '#ffb020', role: 'admin', chat_role: 'master', points: 1250, points_given: 0, suspended: false },
  { id: 'lucia-id', username: 'LuciaDev', bio: 'Fullstack Dev & UI Enthusiast ⚡', avatar_color: '#7c5cff', role: 'user', chat_role: 'moderador', points: 120, points_given: 0, suspended: false },
  { id: 'marco-id', username: 'MarcoPro', bio: 'Gamer & Techie 🎮', avatar_color: '#00d4b1', role: 'user', chat_role: 'nuevo', points: 35, points_given: 0, suspended: false },
  { id: 'sofia-id', username: 'SofiaDesign', bio: 'UI/UX Designer & Art director 🎨', avatar_color: '#ff5470', role: 'user', chat_role: 'maestro', points: 210, points_given: 0, suspended: false },
  { id: 'diego-id', username: 'DiegoCodes', bio: 'Backend developer & Cloud engineer 🚀', avatar_color: '#3b82f6', role: 'user', chat_role: 'nuevo', points: 15, points_given: 0, suspended: false }
];

const INITIAL_POSTS = [
  { id: 'p1', author_id: 'ext3-id', author_name: 'EXT3', author_color: '#ffb020', author_chat_role: 'master', text: '¡Bienvenidos oficialmente a Elraizer Community! 🚀 Explora el feed, participa en el chat global, comercia en el marketplace y envía mensajes privados.', tags: ['bienvenida', 'comunidad', 'anuncio'], media: [], votes: 42, created_at: 'Hace 2 horas', comments: [] },
  { id: 'p2', author_id: 'lucia-id', author_name: 'LuciaDev', author_color: '#7c5cff', author_chat_role: 'moderador', text: 'Acabo de publicar un nuevo recurso de UI kits en el Marketplace. ¡Echadle un vistazo!', tags: ['diseño', 'marketplace'], media: [], votes: 15, created_at: 'Hace 1 hora', comments: [] }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', user_id: 'ext3-id', user_name: 'EXT3', chat_role: 'master', text: 'Chat global activo. Recuerden mantener el respeto.', created_at: '12:00' }
  ]);

  const [authStep, setAuthStep] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regColor, setRegColor] = useState('#7c5cff');
  const [regBio, setRegBio] = useState('');

  const [newPostText, setNewPostText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogin = (u) => {
    setCurrentUser(u);
    setActiveTab('feed');
  };

  const handleDemoLogin = (username) => {
    const found = users.find(u => u.username === username);
    if (found) handleLogin(found);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !currentUser) return;
    const msg = {
      id: 'm_' + Date.now(),
      user_id: currentUser.id,
      user_name: currentUser.username,
      chat_role: currentUser.chat_role,
      text: chatInput,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, msg]);
    setChatInput('');
  };

  const handleSendDm = () => {
    if (!dmInput.trim() || !currentUser || !activeDmUser) return;
    const dm = {
      id: 'dm_' + Date.now(),
      sender_id: currentUser.id,
      receiver_id: activeDmUser.id,
      text: dmInput,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDirectMessages([...directMessages, dm]);
    setDmInput('');
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0e1116] text-[#e9eef5]' : 'bg-[#f4f6fb] text-[#0f172a]'} flex items-center justify-center p-4`}>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b23] border border-[#2a323d] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">◈ Elraizer Community</h1>
            <p className="text-[#8b97a8]">Comunidad, Marketplace y Mensajería en un solo lugar.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span>💬</span> Chat global en vivo y mensajes privados</div>
              <div className="flex items-center gap-2"><span>🛍️</span> Marketplace de productos y servicios</div>
              <div className="flex items-center gap-2"><span>⭐</span> Sistema de reputación y rangos</div>
              <div className="flex items-center gap-2"><span>👑</span> Moderación jerárquica y seguridad RLS</div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4 bg-[#1d242e] p-6 rounded-xl border border-[#2a323d]">
            <h2 className="text-xl font-semibold">Iniciar Sesión Demo</h2>
            <p className="text-xs text-[#8b97a8]">Haz clic en cualquiera de los perfiles para ingresar de inmediato:</p>
            <div className="space-y-2">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleDemoLogin(u.username)}
                  className="w-full text-left px-4 py-3 bg-[#161b23] hover:bg-[#2a323d] border border-[#2a323d] rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: u.avatar_color }}>
                      {u.username[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {u.username} {u.chat_role === 'master' && '👑'}
                      </div>
                      <div className="text-xs text-[#8b97a8]">{u.bio}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#7c5cff]/20 text-[#a78bfa] px-2 py-1 rounded-md">{u.chat_role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0e1116] text-[#e9eef5]' : 'bg-[#f4f6fb] text-[#0f172a]'}`}>
      <header className="sticky top-0 z-40 bg-[#161b23]/90 backdrop-blur-md border-b border-[#2a323d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">
          ◈ Elraizer Community
        </div>
        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' && (
            <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="p-2 bg-[#ffb020]/20 text-[#ffb020] rounded-xl border border-[#ffb020]/40 font-semibold text-xs flex items-center gap-1">
              👑 Panel Maestro
            </button>
          )}
          <button onClick={toggleTheme} className="p-2 bg-[#1d242e] rounded-xl border border-[#2a323d]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setCurrentUser(null)} className="p-2 bg-[#ff5470]/20 text-[#ff5470] rounded-xl border border-[#ff5470]/40">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="sticky top-14 z-30 bg-[#161b23] border-b border-[#2a323d] flex justify-center gap-2 p-2 overflow-x-auto">
        <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🏠 Feed</button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>💬 Chat Global</button>
        <button onClick={() => setActiveTab('dm')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'dm' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>✉️ Mensajes Privados</button>
        <button onClick={() => setActiveTab('store')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'store' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🛍️ Tienda</button>
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>👤 Mi Perfil</button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="¿Qué quieres compartir hoy con la comunidad?"
                className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff] resize-none h-24"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-[#8b97a8]">
                  <button className="p-2 hover:bg-[#1d242e] rounded-lg"><Image size={18} /></button>
                  <button className="p-2 hover:bg-[#1d242e] rounded-lg"><Video size={18} /></button>
                  <button className="p-2 hover:bg-[#1d242e] rounded-lg"><Paperclip size={18} /></button>
                </div>
                <button
                  onClick={() => {
                    if (!newPostText.trim()) return;
                    setPosts([{
                      id: 'p_' + Date.now(),
                      author_id: currentUser.id,
                      author_name: currentUser.username,
                      author_color: currentUser.avatar_color,
                      author_chat_role: currentUser.chat_role,
                      text: newPostText,
                      tags: ['general'],
                      media: [],
                      votes: 0,
                      created_at: 'Ahora mismo',
                      comments: []
                    }, ...posts]);
                    setNewPostText('');
                  }}
                  className="px-4 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-sm font-semibold rounded-xl"
                >
                  Publicar
                </button>
              </div>
            </div>

            {posts.map(p => (
              <div key={p.id} className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.author_color }}>
                      {p.author_name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {p.author_name} <span className="text-[10px] bg-[#2a323d] px-2 py-0.5 rounded-full text-[#8b97a8]">{p.author_chat_role}</span>
                      </div>
                      <div className="text-xs text-[#8b97a8]">{p.created_at}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-4 text-xs text-[#8b97a8] pt-2 border-t border-[#2a323d]">
                  <button onClick={() => {
                    setPosts(posts.map(post => post.id === p.id ? { ...post, votes: post.votes + 1 } : post));
                  }} className="flex items-center gap-1 hover:text-[#7c5cff]">
                    <ThumbsUp size={14} /> {p.votes} Puntos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-[#2a323d] font-semibold text-sm flex items-center justify-between">
              <span>💬 Chat Global · Elraizer</span>
              <span className="text-xs text-[#00d4b1] flex items-center gap-1">🟢 En línea</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.user_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-[#8b97a8] mb-1">{m.user_name} ({m.chat_role})</div>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${m.user_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                    {m.text}
                  </div>
                  <div className="text-[9px] text-[#8b97a8] mt-1">{m.created_at}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#2a323d] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Escribe un mensaje al chat global..."
                className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]"
              />
              <button onClick={handleSendChat} className="p-2 bg-[#7c5cff] text-white rounded-xl"><Send size={18} /></button>
            </div>
          </div>
        )}

        {activeTab === 'dm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            <div className="bg-[#161b23] border border-[#2a323d] rounded-xl p-3 space-y-2 overflow-y-auto">
              <h3 className="text-xs font-bold text-[#8b97a8] uppercase px-2 mb-2">Contactos</h3>
              {users.filter(u => u.id !== currentUser.id).map(u => (
                <button
                  key={u.id}
                  onClick={() => setActiveDmUser(u)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${activeDmUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#1d242e] border-[#2a323d] hover:bg-[#2a323d]'}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: u.avatar_color }}>
                    {u.username[0]}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs">{u.username}</div>
                    <div className="text-[10px] text-[#8b97a8] truncate">{u.bio}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col">
              {activeDmUser ? (
                <>
                  <div className="p-3 border-b border-[#2a323d] font-semibold text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: activeDmUser.avatar_color }}>
                      {activeDmUser.username[0]}
                    </div>
                    <span>Chat Privado con {activeDmUser.username}</span>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {directMessages.filter(dm => (dm.sender_id === currentUser.id && dm.receiver_id === activeDmUser.id) || (dm.sender_id === activeDmUser.id && dm.receiver_id === currentUser.id)).map(dm => (
                      <div key={dm.id} className={`flex flex-col ${dm.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-xs text-sm ${dm.sender_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                          {dm.text}
                        </div>
                        <div className="text-[9px] text-[#8b97a8] mt-1">{dm.created_at}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[#2a323d] flex gap-2">
                    <input
                      type="text"
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendDm()}
                      placeholder={`Escribe un mensaje privado a ${activeDmUser.username}...`}
                      className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]"
                    />
                    <button onClick={handleSendDm} className="p-2 bg-[#7c5cff] text-white rounded-xl"><Send size={18} /></button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">
                  Selecciona un usuario a la izquierda para iniciar una conversación privada.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl" style={{ backgroundColor: currentUser.avatar_color }}>
                {currentUser.username[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {currentUser.username}
                  {currentUser.chat_role === 'master' && '👑'}
                </h2>
                <p className="text-sm text-[#8b97a8]">{currentUser.bio}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-[#7c5cff]/20 text-[#a78bfa] px-2 py-1 rounded-md border border-[#7c5cff]/30">Rol: {currentUser.chat_role}</span>
                  <span className="text-xs bg-[#00d4b1]/20 text-[#00d4b1] px-2 py-1 rounded-md border border-[#00d4b1]/30">Puntos: {currentUser.points}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
