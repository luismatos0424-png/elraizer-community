import React, { useState, useEffect } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail
} from 'lucide-react';

const AVATAR_COLORS = [
  '#7c5cff', '#00d4b1', '#ff5470', '#ffb020',
  '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'
];

// Base de datos limpia: SOLO la cuenta maestra EXT3
const INITIAL_USERS = [
  { id: 'ext3-id', email: 'ext3@elraizer.com', username: 'EXT3', bio: 'Cuenta maestra · Fundador de Elraizer Community', avatar_color: '#ffb020', role: 'admin', chat_role: 'master', points: 1250, points_given: 0, suspended: false }
];

const INITIAL_POSTS = [
  { id: 'p1', author_id: 'ext3-id', author_name: 'EXT3', author_color: '#ffb020', author_chat_role: 'master', text: '¡Bienvenidos oficialmente a Elraizer Community! 🚀 Explora el feed, participa en el chat global, comercia en el marketplace y envía mensajes privados.', tags: ['bienvenida', 'comunidad', 'anuncio'], media: [], votes: 42, created_at: 'Hace 2 horas' }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

  // Auth states
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // App data states
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('elraizer_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('elraizer_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('elraizer_chat');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', user_id: 'ext3-id', user_name: 'EXT3', chat_role: 'master', text: 'Chat global activo. Recuerden mantener el respeto.', created_at: '12:00' }
    ];
  });

  const [directMessages, setDirectMessages] = useState(() => {
    const saved = localStorage.getItem('elraizer_dms');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);

  // Inputs
  const [newPostText, setNewPostText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    localStorage.setItem('elraizer_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('elraizer_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('elraizer_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('elraizer_dms', JSON.stringify(directMessages));
  }, [directMessages]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.suspended) {
        setAuthError('Esta cuenta ha sido suspendida por la administración.');
        return;
      }
      setCurrentUser(found);
    } else {
      setAuthError('Correo o contraseña incorrectos. Si no tienes cuenta, regístrate.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Completa todos los campos para registrarte.');
      return;
    }
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setAuthError('Ya existe una cuenta con este correo electrónico.');
      return;
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      email: email.toLowerCase(),
      username: email.split('@')[0],
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      bio: 'Miembro de Elraizer Community 🚀',
      role: 'user',
      chat_role: 'nuevo',
      points: 0,
      points_given: 0,
      suspended: false
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const handleSelectGoogleAccount = (googleAccount) => {
    setGoogleAuthLoading(true);
    setTimeout(() => {
      const existing = users.find(u => u.email.toLowerCase() === googleAccount.email.toLowerCase());
      if (existing) {
        setCurrentUser(existing);
      } else {
        const newGUser = {
          id: 'usr_' + Date.now(),
          email: googleAccount.email,
          username: googleAccount.name,
          avatar_color: googleAccount.color,
          bio: 'Conectado con cuenta Google 🌐',
          role: 'user',
          chat_role: 'nuevo',
          points: 10,
          points_given: 0,
          suspended: false
        };
        setUsers(prev => [...prev, newGUser]);
        setCurrentUser(newGUser);
      }
      setGoogleAuthLoading(false);
      setShowGoogleModal(false);
    }, 600);
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !currentUser) return;
    const msg = {
      id: 'm_' + Date.now(),
      user_id: currentUser.id,
      user_name: currentUser.username,
      chat_role: currentUser.chat_role,
      text: chatInput.trim(),
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
      text: dmInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDirectMessages([...directMessages, dm]);
    setDmInput('');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0e1116] text-[#e9eef5]' : 'bg-[#f4f6fb] text-[#0f172a]'} flex items-center justify-center p-4`}>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b23] border border-[#2a323d] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">◈ Elraizer Community</h1>
            <p className="text-[#8b97a8]">Comunidad, Marketplace y Mensajería en un solo lugar.</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">
                <MessageSquare className="text-[#7c5cff]" size={20} />
                <span>Chat global en vivo y mensajes privados directos</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">
                <ShoppingBag className="text-[#00d4b1]" size={20} />
                <span>Marketplace de productos y servicios digitales</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">
                <Award className="text-[#ffb020]" size={20} />
                <span>Sistema de reputación, rangos y moderación</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1d242e] p-6 rounded-xl border border-[#2a323d] space-y-4">
            <div className="flex border-b border-[#2a323d] mb-4">
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 pb-2 font-semibold text-sm ${authTab === 'login' ? 'border-b-2 border-[#7c5cff] text-[#7c5cff]' : 'text-[#8b97a8]'}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 pb-2 font-semibold text-sm ${authTab === 'register' ? 'border-b-2 border-[#7c5cff] text-[#7c5cff]' : 'text-[#8b97a8]'}`}
              >
                Crear Cuenta
              </button>
            </div>

            {authError && <div className="p-3 bg-[#ff5470]/10 border border-[#ff5470] text-[#ff5470] rounded-xl text-xs">{authError}</div>}

            <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]"
                  placeholder="tuemail@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-95 transition-all"
              >
                {authTab === 'login' ? 'Entrar a Elraizer' : 'Crear mi cuenta'}
              </button>
            </form>

            <div className="relative my-4 text-center text-xs text-[#8b97a8]">
              <span className="bg-[#1d242e] px-2 relative z-10">O continúa con</span>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2a323d]"></div></div>
            </div>

            <button
              onClick={() => setShowGoogleModal(true)}
              type="button"
              className="w-full bg-[#161b23] hover:bg-[#2a323d] border border-[#2a323d] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>

        {/* MODAL GOOGLE AUTH */}
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white text-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="text-lg font-bold text-slate-900">Iniciar sesión con Google</h3>
                <p className="text-xs text-slate-500">Selecciona una cuenta para ir a <span className="font-semibold text-slate-800">Elraizer Community</span></p>
              </div>

              {googleAuthLoading ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="animate-spin text-[#7c5cff]" size={28} />
                  <span className="text-xs text-slate-500">Iniciando sesión de forma segura...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { name: 'Usuario Google', email: 'usuario.google@gmail.com', color: '#7c5cff' },
                    { name: 'Cuenta Personal', email: 'personal.account@gmail.com', color: '#00d4b1' }
                  ].map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-left"
                    >
                      <div className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ backgroundColor: acc.color }}>
                        {acc.name[0]}
                      </div>
                      <div className="truncate flex-1">
                        <div className="text-xs font-semibold text-slate-800">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 text-center">
                Para continuar, Google compartirá tu nombre y correo con Elraizer Community.
              </div>
            </div>
          </div>
        )}
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
          {currentUser?.role === 'admin' && (
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
                      text: newPostText.trim(),
                      tags: ['general'],
                      media: [],
                      votes: 0,
                      created_at: 'Ahora mismo'
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
