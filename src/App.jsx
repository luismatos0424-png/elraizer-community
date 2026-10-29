import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AVATAR_COLORS = [
  '#7c5cff', '#00d4b1', '#ff5470', '#ffb020',
  '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth form states
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Onboarding states
  const [onboardUsername, setOnboardUsername] = useState('');
  const [onboardColor, setOnboardColor] = useState(AVATAR_COLORS[0]);
  const [onboardBio, setOnboardBio] = useState('');
  const [onboardError, setOnboardError] = useState('');

  // Main navigation & features
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'chat' | 'dm' | 'store' | 'cart' | 'notifications' | 'profile'
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);

  // Inputs
  const [newPostText, setNewPostText] = useState('');
  const [postMediaFiles, setPostMediaFiles] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showModModal, setShowModModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data || !data.username) {
        setOnboardingRequired(true);
      } else {
        setCurrentUser(data);
        setOnboardingRequired(false);
        loadAppData();
        subscribeToRealtime();
      }
    } catch (err) {
      setOnboardingRequired(true);
    } finally {
      setLoading(false);
    }
  };

  const loadAppData = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*');
    if (profilesData) setUsers(profilesData);

    const { data: postsData } = await supabase.from('posts').select('*, profiles(*)').order('created_at', { ascending: false });
    if (postsData) setPosts(postsData);

    const { data: productsData } = await supabase.from('products').select('*, profiles(*)').order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    const { data: messagesData } = await supabase.from('messages').select('*, profiles(*)').order('created_at', { ascending: true });
    if (messagesData) setChatMessages(messagesData);

    const { data: dmData } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (dmData) setDirectMessages(dmData);
  };

  const subscribeToRealtime = () => {
    supabase
      .channel('public_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setChatMessages((prev) => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setDirectMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else setAuthTab('login');
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!onboardUsername.trim() || onboardUsername.length < 3) {
      setOnboardError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    const newProfile = {
      id: session.user.id,
      username: onboardUsername.trim(),
      avatar_color: onboardColor,
      bio: onboardBio.trim(),
      role: session.user.email === 'ext3@elraizer.com' ? 'admin' : 'user',
      chat_role: session.user.email === 'ext3@elraizer.com' ? 'master' : 'nuevo',
      points: 0,
      points_given: 0,
      suspended: false
    };

    const { error } = await supabase.from('profiles').upsert(newProfile);
    if (error) {
      setOnboardError(error.message);
    } else {
      setCurrentUser(newProfile);
      setOnboardingRequired(false);
      loadAppData();
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentUser) return;
    await supabase.from('messages').insert({
      user_id: currentUser.id,
      text: chatInput.trim()
    });
    setChatInput('');
  };

  const handleSendDm = async () => {
    if (!dmInput.trim() || !currentUser || !activeDmUser) return;
    await supabase.from('direct_messages').insert({
      sender_id: currentUser.id,
      receiver_id: activeDmUser.id,
      text: dmInput.trim()
    });
    setDmInput('');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1116] text-[#e9eef5] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-[#7c5cff]" size={24} />
          <span>Cargando Elraizer Community...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0e1116] text-[#e9eef5]' : 'bg-[#f4f6fb] text-[#0f172a]'} flex items-center justify-center p-4`}>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b23] border border-[#2a323d] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">◈ Elraizer Community</h1>
            <p className="text-[#8b97a8]">Comunidad y Marketplace en un solo lugar.</p>
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
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-95 transition-all"
              >
                {authLoading ? 'Procesando...' : authTab === 'login' ? 'Entrar a Elraizer' : 'Crear mi cuenta'}
              </button>
            </form>

            <div className="relative my-4 text-center text-xs text-[#8b97a8]">
              <span className="bg-[#1d242e] px-2 relative z-10">O continúa con</span>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2a323d]"></div></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-[#161b23] hover:bg-[#2a323d] border border-[#2a323d] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              🌐 Continuar con Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (onboardingRequired) {
    return (
      <div className="min-h-screen bg-[#0e1116] text-[#e9eef5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl space-y-4">
          <h2 className="text-2xl font-bold text-center">Configura tu Perfil 🚀</h2>
          <p className="text-xs text-[#8b97a8] text-center">Completa tu información para unirte a la comunidad.</p>

          {onboardError && <div className="p-3 bg-[#ff5470]/10 border border-[#ff5470] text-[#ff5470] rounded-xl text-xs">{onboardError}</div>}

          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            <div>
              <label className="text-xs text-[#8b97a8] block mb-1">Nombre de Usuario (único)</label>
              <input
                type="text"
                required
                value={onboardUsername}
                onChange={(e) => setOnboardUsername(e.target.value)}
                className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]"
                placeholder="ej: DevMaster"
              />
            </div>

            <div>
              <label className="text-xs text-[#8b97a8] block mb-1">Color de Avatar</label>
              <div className="flex gap-2 justify-between">
                {AVATAR_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setOnboardColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${onboardColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8b97a8] block mb-1">Biografía (máx 80 caracteres)</label>
              <input
                type="text"
                maxLength={80}
                value={onboardBio}
                onChange={(e) => setOnboardBio(e.target.value)}
                className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]"
                placeholder="Desarrollador / Entusiasta de tecnología..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-95 transition-all"
            >
              Crear mi cuenta 🚀
            </button>
          </form>
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
          {currentUser?.role === 'admin' && (
            <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="p-2 bg-[#ffb020]/20 text-[#ffb020] rounded-xl border border-[#ffb020]/40 font-semibold text-xs flex items-center gap-1">
              👑 Panel Maestro
            </button>
          )}
          <button onClick={toggleTheme} className="p-2 bg-[#1d242e] rounded-xl border border-[#2a323d]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="p-2 bg-[#ff5470]/20 text-[#ff5470] rounded-xl border border-[#ff5470]/40">
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
                  onClick={async () => {
                    if (!newPostText.trim()) return;
                    await supabase.from('posts').insert({
                      author_id: currentUser.id,
                      text: newPostText.trim()
                    });
                    setNewPostText('');
                    loadAppData();
                  }}
                  className="px-4 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-sm font-semibold rounded-xl"
                >
                  Publicar
                </button>
              </div>
            </div>

            {posts.map((p) => (
              <div key={p.id} className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.profiles?.avatar_color || '#7c5cff' }}>
                      {p.profiles?.username ? p.profiles.username[0] : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {p.profiles?.username || 'Usuario'}
                        <span className="text-[10px] bg-[#2a323d] px-2 py-0.5 rounded-full text-[#8b97a8]">{p.profiles?.chat_role || 'nuevo'}</span>
                      </div>
                      <div className="text-xs text-[#8b97a8]">{new Date(p.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{p.text}</p>
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
              {chatMessages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.user_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-[#8b97a8] mb-1">{m.profiles?.username || 'Usuario'}</div>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${m.user_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                    {m.text}
                  </div>
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
              <h3 className="text-xs font-bold text-[#8b97a8] uppercase px-2 mb-2">Usuarios en línea</h3>
              {users.filter(u => u.id !== currentUser.id).map(u => (
                <button
                  key={u.id}
                  onClick={() => setActiveDmUser(u)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${activeDmUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#1d242e] border-[#2a323d] hover:bg-[#2a323d]'}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: u.avatar_color }}>
                    {u.username ? u.username[0] : 'U'}
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
