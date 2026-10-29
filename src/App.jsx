import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image as ImageIcon, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail,
  DollarSign, Package, CheckCircle2, Crown, Users, Settings, Activity, Camera,
  Edit3, Globe, Github, Twitter, Linkedin, Briefcase, MapPin, Calendar, Heart, Eye,
  Archive, Inbox, Send as SendIcon, FileText, CheckCheck, UserMinus, ShieldOff, Layers, Filter,
  Wifi, Circle, Award as AwardIcon, Gift
} from 'lucide-react';

const AVATAR_COLORS = [
  '#7c5cff', '#00d4b1', '#ff5470', '#ffb020',
  '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'
];

// RANGOS Y LIMITES DIARIOS DE PUNTOS SEGUN CATEGORIA/RANGO
const RANK_POINTS_LIMITS = {
  master: 500,     // Administrador/Maestro
  moderador: 200,  // Moderadores
  veterano: 100,   // Usuarios veteranos
  miembro: 50,     // Usuarios estándar
  nuevo: 20        // Nuevos registrados
};

const INITIAL_USERS = [
  { 
    id: 'ext3-id', 
    email: 'ext3@elraizer.com', 
    username: 'EXT3', 
    password: 'Elraizer5374e*', 
    fullName: 'Luis Ernesto Matos',
    headline: 'Fundador & Desarrollador Principal',
    bio: 'Apasionado por la tecnología, el desarrollo web a medida, automatización y arquitecturas de e-commerce.', 
    location: 'Armenia, Colombia',
    website: 'https://elraizer.com',
    github: 'EXT3-Dev',
    twitter: '@EXT3_Official',
    avatar_url: '',
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    avatar_color: '#ffb020', 
    role: 'admin', 
    chat_role: 'master', 
    points: 1250, 
    dailyPointsGiven: 0,
    joinedDate: 'Octubre 2024',
    status: 'active',
    isOnline: true
  },
  { 
    id: 'usr_demo1', 
    email: 'demo@elraizer.com', 
    username: 'DevUser', 
    password: 'User1234*', 
    fullName: 'Carlos Mendoza',
    headline: 'Desarrollador Frontend',
    bio: 'Apasionado por React, Tailwind y animaciones.', 
    location: 'Bogotá, Colombia',
    website: '',
    github: 'devuser',
    twitter: '',
    avatar_url: '',
    banner_url: '',
    avatar_color: '#3b82f6', 
    role: 'user', 
    chat_role: 'miembro', 
    points: 120, 
    dailyPointsGiven: 0,
    joinedDate: 'Enero 2025',
    status: 'active',
    isOnline: true
  },
  { 
    id: 'usr_demo2', 
    email: 'sora@elraizer.com', 
    username: 'SoraCode', 
    password: 'User1234*', 
    fullName: 'Soraia Vivas',
    headline: 'Diseñadora UI/UX',
    bio: 'Especialista en prototipado y diseño de interfaces dark mode.', 
    location: 'Medellín, Colombia',
    website: '',
    github: 'soracode',
    twitter: '',
    avatar_url: '',
    banner_url: '',
    avatar_color: '#ec4899', 
    role: 'user', 
    chat_role: 'miembro', 
    points: 340, 
    dailyPointsGiven: 0,
    joinedDate: 'Febrero 2025',
    status: 'active',
    isOnline: false
  }
];

const INITIAL_POSTS = [
  { 
    id: 'p1', 
    author_id: 'ext3-id', 
    author_name: 'EXT3', 
    author_color: '#ffb020', 
    author_chat_role: 'master', 
    text: '¡Bienvenidos oficialmente a Elraizer Community! 🚀 Explora el feed, participa en el chat global, comercia en el marketplace y otorga puntos a los posts que más te gusten.', 
    tags: ['bienvenida', 'comunidad', 'anuncio'], 
    attachments: [], 
    votes: 42, 
    created_at: 'Hace 2 horas' 
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Kit de Scripts Automation Tampermonkey',
    description: 'Pack de scripts utilitarios en JavaScript para automatizar tareas web y scraping básico.',
    price: 25.00,
    category: 'Software',
    seller_id: 'ext3-id',
    seller_name: 'EXT3',
    seller_color: '#ffb020',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    sales: 18,
    created_at: 'Ayer'
  },
  {
    id: 'prod_2',
    title: 'Plantilla Premium Single-Page WebView',
    description: 'Diseño responsive ultrafino optimizado para portales comunitarios y paneles e-commerce.',
    price: 45.00,
    category: 'Plantillas',
    seller_id: 'usr_demo1',
    seller_name: 'DevUser',
    seller_color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    sales: 24,
    created_at: 'Hace 3 días'
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState(null);

  // Auth
  const [authTab, setAuthTab] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Main Data
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('elraizer_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('elraizer_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('elraizer_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('elraizer_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('elraizer_chat');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', user_id: 'ext3-id', user_name: 'EXT3', chat_role: 'master', text: 'Chat global activo. Recuerden mantener el respeto.', created_at: '12:00' }
    ];
  });

  const [directMessages, setDirectMessages] = useState(() => {
    const saved = localStorage.getItem('elraizer_dms');
    return saved ? JSON.parse(saved) : [
      { id: 'dm_init', sender_id: 'usr_demo1', receiver_id: 'ext3-id', text: '¡Hola EXT3! Excelente trabajo con la comunidad.', created_at: '10:30 AM', read: false }
    ];
  });

  // Lista de IDs de usuarios con conversaciones fijadas (Pinned)
  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    const saved = localStorage.getItem('elraizer_pinned_dms');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [dmFolder, setDmFolder] = useState('all'); // 'all' muestra todos los mensajes con el usuario sin filtrar indebidamente
  const [dmSearchQuery, setDmSearchQuery] = useState('');

  // Modals
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Modal para Otorgar Puntos Personalizados
  const [pointsModalPost, setPointsModalPost] = useState(null);
  const [pointsToGiveInput, setPointsToGiveInput] = useState('');
  const [pointsError, setPointsError] = useState('');

  // New Post Inputs & File Attachments
  const [newPostText, setNewPostText] = useState('');
  const [postAttachments, setPostAttachments] = useState([]);
  const postFileInputRef = useRef(null);

  // Chat & DM Inputs
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editTwitter, setEditTwitter] = useState('');

  // Sync LocalStorage
  useEffect(() => { localStorage.setItem('elraizer_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('elraizer_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('elraizer_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('elraizer_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('elraizer_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('elraizer_dms', JSON.stringify(directMessages)); }, [directMessages]);
  useEffect(() => { localStorage.setItem('elraizer_pinned_dms', JSON.stringify(pinnedUserIds)); }, [pinnedUserIds]);

  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName || '');
      setEditHeadline(currentUser.headline || '');
      setEditBio(currentUser.bio || '');
      setEditLocation(currentUser.location || '');
      setEditWebsite(currentUser.website || '');
      setEditGithub(currentUser.github || '');
      setEditTwitter(currentUser.twitter || '');
    }
  }, [currentUser]);

  // Online status helper
  const onlineUsers = users.filter(u => u.isOnline);

  // Rango / Categoria límite de puntos del usuario actual
  const userRoleKey = currentUser?.chat_role || 'miembro';
  const maxDailyPoints = RANK_POINTS_LIMITS[userRoleKey] || 50;
  const currentGiven = currentUser?.dailyPointsGiven || 0;
  const remainingDailyPoints = Math.max(0, maxDailyPoints - currentGiven);

  // Toggle fijar conversación
  const togglePinConversation = (targetUserId, e) => {
    e.stopPropagation();
    if (pinnedUserIds.includes(targetUserId)) {
      setPinnedUserIds(pinnedUserIds.filter(id => id !== targetUserId));
    } else {
      setPinnedUserIds([...pinnedUserIds, targetUserId]);
    }
  };

  // Otorgar Puntos con validación estricta de límites diarios y saldo
  const handleGivePointsSubmit = (e) => {
    e.preventDefault();
    setPointsError('');

    const pointsNum = parseInt(pointsToGiveInput, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      setPointsError('Ingresa un número de puntos válido mayor a 0.');
      return;
    }

    if (pointsNum > remainingDailyPoints) {
      setPointsError(`Excedes tu límite diario restante. Solo puedes dar hasta ${remainingDailyPoints} puntos hoy.`);
      return;
    }

    if (pointsNum > currentUser.points && currentUser.chat_role !== 'master') {
      setPointsError(`No tienes suficientes puntos disponibles (${currentUser.points} Pts).`);
      return;
    }

    // 1. Actualizar Post
    setPosts(posts.map(p => p.id === pointsModalPost.id ? { ...p, votes: p.votes + pointsNum } : p));

    // 2. Actualizar Usuario Autor del Post (Suma Puntos)
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === pointsModalPost.author_id) {
        return { ...u, points: u.points + pointsNum };
      }
      if (u.id === currentUser.id) {
        return {
          ...u,
          points: u.chat_role === 'master' ? u.points : u.points - pointsNum,
          dailyPointsGiven: (u.dailyPointsGiven || 0) + pointsNum
        };
      }
      return u;
    }));

    // 3. Actualizar currentUser
    setCurrentUser(prev => ({
      ...prev,
      points: prev.chat_role === 'master' ? prev.points : prev.points - pointsNum,
      dailyPointsGiven: (prev.dailyPointsGiven || 0) + pointsNum
    }));

    setPointsModalPost(null);
    setPointsToGiveInput('');
  };

  // Handle Checkout / Direct Message Payment Request
  const handleCheckout = () => {
    if (cart.length === 0 || !currentUser) return;

    cart.forEach(item => {
      const seller = users.find(u => u.id === item.seller_id) || { id: item.seller_id, username: item.seller_name };
      const autoMessage = `🛒 ¡Hola @${seller.username}! Estoy interesado en comprar tu producto "${item.title}" por $${item.price.toFixed(2)} USD. ¿Cuáles son los métodos de pago disponibles (Transferencia, Crypto, Nequi, Paypal)?`;

      const newDm = {
        id: 'dm_order_' + Date.now() + Math.random(),
        sender_id: currentUser.id,
        receiver_id: seller.id,
        text: autoMessage,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };

      setDirectMessages(prev => [...prev, newDm]);
    });

    setCart([]);
    setShowCartModal(false);
    setActiveTab('dm');
  };

  // Handle Post File Attachments
  const handlePostFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostAttachments(prev => [...prev, {
          id: 'att_' + Date.now() + Math.random(),
          name: file.name,
          type: fileType || (file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file'),
          url: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePostAttachment = (id) => {
    setPostAttachments(postAttachments.filter(a => a.id !== id));
  };

  const handleCreatePost = () => {
    if (!newPostText.trim() && postAttachments.length === 0) return;
    const newPost = {
      id: 'p_' + Date.now(),
      author_id: currentUser.id,
      author_name: currentUser.username,
      author_color: currentUser.avatar_color,
      author_chat_role: currentUser.chat_role,
      text: newPostText.trim(),
      tags: ['comunidad'],
      attachments: postAttachments,
      votes: 0,
      created_at: 'Ahora mismo'
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setPostAttachments([]);
  };

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const inputClean = identifier.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === inputClean || u.username.toLowerCase() === inputClean);

    if (found) {
      if (found.status === 'suspended') return setAuthError('Esta cuenta ha sido suspendida temporalmente.');
      if (found.status === 'banned') return setAuthError('Esta cuenta ha sido BANEADA permanentemente.');
      if (found.password && found.password !== password) return setAuthError('Contraseña incorrecta.');
      
      const loggedUser = { ...found, isOnline: true };
      setUsers(users.map(u => u.id === found.id ? loggedUser : u));
      setCurrentUser(loggedUser);
    } else {
      setAuthError('Usuario no encontrado.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!identifier || !password) return setAuthError('Completa todos los campos.');

    const inputClean = identifier.trim().toLowerCase();
    if (inputClean === 'ext3' || inputClean === 'ext3@elraizer.com') return setAuthError('Reservado para la cuenta maestra.');

    const exists = users.find(u => u.email.toLowerCase() === inputClean || u.username.toLowerCase() === inputClean);
    if (exists) return setAuthError('Usuario o correo ya registrado.');

    const isEmail = inputClean.includes('@');
    const uname = isEmail ? inputClean.split('@')[0] : identifier.trim();
    const newUser = {
      id: 'usr_' + Date.now(),
      email: isEmail ? inputClean : `${inputClean}@elraizer.com`,
      username: uname,
      password: password,
      fullName: uname,
      headline: 'Nuevo Miembro',
      bio: '¡Hola! Me he unido a Elraizer Community.',
      location: 'Colombia',
      website: '', github: '', twitter: '', avatar_url: '', banner_url: '',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      role: 'user', chat_role: 'nuevo', points: 10, dailyPointsGiven: 0, joinedDate: 'Reciente', status: 'active', isOnline: true
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  // Admin Actions
  const handleAdminUserAction = (userId, action) => {
    if (userId === 'ext3-id') return;
    setUsers(users.map(u => {
      if (u.id === userId) {
        if (action === 'suspend') return { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' };
        if (action === 'ban') return { ...u, status: u.status === 'banned' ? 'active' : 'banned' };
      }
      return u;
    }));
  };

  const handleAdminDeleteUser = (userId) => {
    if (userId === 'ext3-id') return;
    if (window.confirm('¿Estás seguro de ELIMINAR PERMANENTEMENTE esta cuenta y todos sus registros?')) {
      setUsers(users.filter(u => u.id !== userId));
      setPosts(posts.filter(p => p.author_id !== userId));
      setProducts(products.filter(p => p.seller_id !== userId));
      setDirectMessages(directMessages.filter(m => m.sender_id !== userId && m.receiver_id !== userId));
      setSelectedAdminUser(null);
    }
  };

  // Clear Conversations / DMs
  const handleClearChatHistory = (targetUserId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('¿Deseas vaciar todo el historial de conversaciones con este usuario?')) {
      setDirectMessages(directMessages.filter(dm => 
        !(dm.sender_id === currentUser.id && dm.receiver_id === targetUserId) &&
        !(dm.sender_id === targetUserId && dm.receiver_id === currentUser.id)
      ));
      if (activeDmUser?.id === targetUserId) {
        setActiveDmUser(null);
      }
    }
  };

  const handleClearAllConversations = () => {
    if (window.confirm('¿Deseas vaciar TODO tu panel de mensajes con TODOS los usuarios?')) {
      setDirectMessages(directMessages.filter(dm => dm.sender_id !== currentUser.id && dm.receiver_id !== currentUser.id));
      setActiveDmUser(null);
    }
  };

  const handleDeleteSingleDm = (dmId) => {
    setDirectMessages(directMessages.filter(dm => dm.id !== dmId));
  };

  // FIX CRÍTICO: Envío de mensajes garantizado
  const handleSendDm = () => {
    if (!dmInput.trim() || !currentUser || !activeDmUser) return;
    
    const dm = {
      id: 'dm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      sender_id: currentUser.id,
      receiver_id: activeDmUser.id,
      text: dmInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setDirectMessages(prevMessages => [...prevMessages, dm]);
    setDmInput('');
  };

  // Filter users for DM with pinned sorting
  const filteredUsersForDm = users.filter(u => {
    if (u.id === currentUser?.id) return false;
    if (!dmSearchQuery.trim()) return true;
    return u.username.toLowerCase().includes(dmSearchQuery.trim().toLowerCase());
  }).sort((a, b) => {
    const aPinned = pinnedUserIds.includes(a.id);
    const bPinned = pinnedUserIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0e1116] text-[#e9eef5] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b23] border border-[#2a323d] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">◈ Elraizer Community</h1>
            <p className="text-[#8b97a8]">Comunidad, Marketplace, Mensajería Directa y Panel Maestro.</p>
          </div>
          <div className="bg-[#1d242e] p-6 rounded-xl border border-[#2a323d] space-y-4">
            <div className="flex border-b border-[#2a323d] mb-4">
              <button onClick={() => setAuthTab('login')} className={`flex-1 pb-2 font-semibold text-sm ${authTab === 'login' ? 'border-b-2 border-[#7c5cff] text-[#7c5cff]' : 'text-[#8b97a8]'}`}>Iniciar Sesión</button>
              <button onClick={() => setAuthTab('register')} className={`flex-1 pb-2 font-semibold text-sm ${authTab === 'register' ? 'border-b-2 border-[#7c5cff] text-[#7c5cff]' : 'text-[#8b97a8]'}`}>Crear Cuenta</button>
            </div>
            {authError && <div className="p-3 bg-[#ff5470]/10 border border-[#ff5470] text-[#ff5470] rounded-xl text-xs">{authError}</div>}
            <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]" placeholder="Ingresa tu email o usuario" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]" placeholder="••••••••" />
              <button type="submit" className="w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white py-3 rounded-xl font-bold text-sm shadow-lg">{authTab === 'login' ? 'Entrar a Elraizer' : 'Crear mi cuenta'}</button>
            </form>
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
          <div className="hidden sm:flex items-center gap-1.5 bg-[#1d242e] border border-[#7c5cff]/40 px-3 py-1.5 rounded-xl text-xs">
            <AwardIcon size={16} className="text-[#ffb020]" />
            <span className="font-bold text-white">{currentUser.points} Pts</span>
            <span className="text-[10px] text-[#8b97a8] ml-1">(Límite hoy: {remainingDailyPoints}/{maxDailyPoints})</span>
          </div>

          <button onClick={() => setShowCartModal(true)} className="relative p-2 bg-[#1d242e] hover:bg-[#2a323d] text-[#e9eef5] rounded-xl border border-[#2a323d] flex items-center gap-2 text-xs font-semibold">
            <ShoppingCart size={18} className="text-[#00d4b1]" />
            <span className="hidden sm:inline">Carrito</span>
            {cart.length > 0 && <span className="bg-[#7c5cff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
          </button>

          {currentUser?.role === 'admin' && (
            <button onClick={() => setShowAdminModal(true)} className="p-2 bg-[#ffb020]/20 text-[#ffb020] hover:bg-[#ffb020]/30 rounded-xl border border-[#ffb020]/40 font-semibold text-xs flex items-center gap-1.5 shadow-md">
              <Crown size={16} />
              <span>Panel Maestro Pro</span>
            </button>
          )}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-[#1d242e] rounded-xl border border-[#2a323d]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => {
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
            setCurrentUser(null);
          }} className="p-2 bg-[#ff5470]/20 text-[#ff5470] rounded-xl border border-[#ff5470]/40">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* SECCIÓN VISIBLE DEL PANEL PRINCIPAL: USUARIOS CONECTADOS */}
      <div className="bg-[#161b23] border-b border-[#2a323d] px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#00d4b1] font-bold">
            <Wifi size={16} className="animate-pulse" />
            <span>Usuarios Online ({onlineUsers.length})</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {onlineUsers.map(u => (
              <div key={u.id} className="flex items-center gap-1.5 bg-[#1d242e] border border-[#2a323d] px-2.5 py-1 rounded-full text-[11px]">
                <div className="w-2 h-2 rounded-full bg-[#00d4b1]"></div>
                <span className="font-semibold text-white">@{u.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="sticky top-14 z-30 bg-[#161b23] border-b border-[#2a323d] flex justify-center gap-2 p-2 overflow-x-auto">
        <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🏠 Feed</button>
        <button onClick={() => setActiveTab('marketplace')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'marketplace' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🛒 Marketplace</button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>💬 Chat Global</button>
        <button onClick={() => setActiveTab('dm')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'dm' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>✉️ Mensajería Pro</button>
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>👤 Mi Perfil</button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* TAB FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="¿Qué quieres compartir hoy con la comunidad?"
                className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff] resize-none h-24"
              />

              {postAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-[#1d242e] rounded-xl border border-[#2a323d]">
                  {postAttachments.map(att => (
                    <div key={att.id} className="relative group bg-[#161b23] p-1.5 rounded-lg border border-[#2a323d] flex items-center gap-2 max-w-xs">
                      {att.type === 'image' && <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded" />}
                      {att.type === 'video' && <video src={att.url} className="w-10 h-10 object-cover rounded" />}
                      {att.type === 'file' && <Paperclip size={20} className="text-[#00d4b1]" />}
                      <span className="text-[11px] truncate max-w-[100px]">{att.name}</span>
                      <button onClick={() => removePostAttachment(att.id)} className="text-[#ff5470] hover:bg-[#ff5470]/20 p-1 rounded-full"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-[#8b97a8]">
                  <input type="file" multiple accept="image/*" ref={postFileInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'image')} />
                  <button onClick={() => postFileInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#00d4b1] flex items-center gap-1 text-xs font-semibold">
                    <ImageIcon size={18} /> <span className="hidden sm:inline">Foto</span>
                  </button>

                  <input type="file" multiple accept="video/*" id="videoUpload" className="hidden" onChange={(e) => handlePostFileUpload(e, 'video')} />
                  <button onClick={() => document.getElementById('videoUpload').click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#7c5cff] flex items-center gap-1 text-xs font-semibold">
                    <Video size={18} /> <span className="hidden sm:inline">Video</span>
                  </button>

                  <input type="file" multiple id="fileUpload" className="hidden" onChange={(e) => handlePostFileUpload(e, 'file')} />
                  <button onClick={() => document.getElementById('fileUpload').click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#ffb020] flex items-center gap-1 text-xs font-semibold">
                    <Paperclip size={18} /> <span className="hidden sm:inline">Archivo</span>
                  </button>
                </div>
                <button onClick={handleCreatePost} className="px-5 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-sm font-semibold rounded-xl">Publicar</button>
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
                        @{p.author_name} <span className="text-[10px] bg-[#2a323d] px-2 py-0.5 rounded-full text-[#8b97a8]">{p.author_chat_role}</span>
                      </div>
                      <div className="text-xs text-[#8b97a8]">{p.created_at}</div>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button onClick={() => setPosts(posts.filter(item => item.id !== p.id))} className="p-1.5 text-[#ff5470] hover:bg-[#ff5470]/10 rounded-lg text-xs flex items-center gap-1">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{p.text}</p>

                {p.attachments && p.attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {p.attachments.map(att => (
                      <div key={att.id} className="bg-[#1d242e] p-2 rounded-xl border border-[#2a323d] overflow-hidden">
                        {att.type === 'image' && <img src={att.url} alt={att.name} className="w-full h-48 object-cover rounded-lg" />}
                        {att.type === 'video' && <video src={att.url} controls className="w-full h-48 object-cover rounded-lg" />}
                        {att.type === 'file' && (
                          <a href={att.url} download={att.name} className="flex items-center gap-2 p-3 text-xs text-[#00d4b1] font-semibold hover:underline">
                            <Paperclip size={18} /> Descargar {att.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#8b97a8] pt-2 border-t border-[#2a323d]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#ffb020] flex items-center gap-1"><AwardIcon size={14} /> {p.votes} Puntos Acumulados</span>
                  </div>

                  <button onClick={() => { setPointsModalPost(p); setPointsToGiveInput(''); setPointsError(''); }} className="px-3 py-1.5 bg-[#ffb020]/20 hover:bg-[#ffb020]/30 text-[#ffb020] border border-[#ffb020]/40 rounded-xl font-bold flex items-center gap-1.5 transition-all">
                    <Gift size={14} /> Dar Puntos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] bg-clip-text text-transparent">Marketplace Digital</h2>
                <p className="text-xs text-[#8b97a8] mt-1">Compra y vende recursos, servicios y software de forma segura.</p>
              </div>
              <button onClick={() => setShowSellModal(true)} className="px-4 py-2.5 bg-gradient-to-r from-[#00d4b1] to-[#10b981] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg">
                <Plus size={16} /> Publicar Producto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(prod => (
                <div key={prod.id} className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="h-44 overflow-hidden relative">
                      <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute top-3 right-3 bg-[#161b23]/80 backdrop-blur-md text-[#00d4b1] border border-[#00d4b1]/30 text-[10px] font-bold px-2.5 py-1 rounded-full">{prod.category}</span>
                      {currentUser.role === 'admin' && (
                        <button onClick={() => setProducts(products.filter(item => item.id !== prod.id))} className="absolute top-3 left-3 bg-[#ff5470] text-white p-1.5 rounded-xl text-xs">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#8b97a8]">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: prod.seller_color }}>{prod.seller_name[0]}</div>
                        <span>@{prod.seller_name}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#e9eef5]">{prod.title}</h3>
                      <p className="text-xs text-[#8b97a8] line-clamp-2">{prod.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-[#2a323d]/50 mt-2">
                    <div className="text-lg font-bold text-[#00d4b1]">${prod.price.toFixed(2)}</div>
                    <button onClick={() => setCart([...cart, { ...prod, qty: 1 }])} className="px-3 py-1.5 bg-[#7c5cff] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5">
                      <ShoppingCart size={14} /> Añadir al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CHAT GLOBAL */}
        {activeTab === 'chat' && (
          <div className="bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-[#2a323d] font-semibold text-sm flex items-center justify-between">
              <span>💬 Chat Global · Elraizer</span>
              <span className="text-xs text-[#00d4b1]">🟢 En línea</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.user_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-[#8b97a8] mb-1">@{m.user_name} ({m.chat_role})</div>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${m.user_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                    {m.text}
                  </div>
                  <div className="text-[9px] text-[#8b97a8] mt-1">{m.created_at}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#2a323d] flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setChatMessages([...chatMessages, { id: 'm_' + Date.now(), user_id: currentUser.id, user_name: currentUser.username, chat_role: currentUser.chat_role, text: chatInput, created_at: 'Ahora' }]), setChatInput(''))} placeholder="Escribe un mensaje al chat global..." className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]" />
              <button onClick={() => { if(chatInput.trim()) { setChatMessages([...chatMessages, { id: 'm_' + Date.now(), user_id: currentUser.id, user_name: currentUser.username, chat_role: currentUser.chat_role, text: chatInput, created_at: 'Ahora' }]); setChatInput(''); }}} className="p-2 bg-[#7c5cff] text-white rounded-xl"><Send size={18} /></button>
            </div>
          </div>
        )}

        {/* TAB MENSAJERÍA DIRECTA CON FILTRADO Y ENVÍO REPARADO */}
        {activeTab === 'dm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            <div className="bg-[#161b23] border border-[#2a323d] rounded-xl p-3 space-y-3 flex flex-col">
              <div className="flex border-b border-[#2a323d] pb-2 gap-1">
                <button onClick={() => setDmFolder('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${dmFolder === 'all' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] bg-[#1d242e]'}`}>
                  <MessageSquare size={14} /> Todos
                </button>
                <button onClick={() => setDmFolder('inbox')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${dmFolder === 'inbox' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] bg-[#1d242e]'}`}>
                  <Inbox size={14} /> Recibidos
                </button>
                <button onClick={() => setDmFolder('sent')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${dmFolder === 'sent' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] bg-[#1d242e]'}`}>
                  <SendIcon size={14} /> Enviados
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#8b97a8]" />
                <input
                  type="text"
                  value={dmSearchQuery}
                  onChange={(e) => setDmSearchQuery(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                />
              </div>

              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-bold text-[#8b97a8] uppercase">Seleccionar Conversación</h3>
                <button onClick={handleClearAllConversations} className="text-[10px] text-[#ff5470] hover:underline font-bold flex items-center gap-0.5">
                  <Trash2 size={12} /> Vaciar Todo
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredUsersForDm.map(u => {
                  const isPinned = pinnedUserIds.includes(u.id);

                  return (
                    <div
                      key={u.id}
                      onClick={() => setActiveDmUser(u)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${activeDmUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#1d242e] border-[#2a323d] hover:bg-[#2a323d]'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative" style={{ backgroundColor: u.avatar_color }}>
                          {u.username[0]}
                          {u.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00d4b1] border-2 border-[#161b23] rounded-full"></span>}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-white flex items-center gap-1">
                            @{u.username}
                            {isPinned && <Pin size={12} className="text-[#ffb020] fill-[#ffb020]" />}
                          </div>
                          <div className="text-[10px] text-[#8b97a8] truncate">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => togglePinConversation(u.id, e)}
                          title={isPinned ? 'Desfijar conversación' : 'Fijar conversación'}
                          className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'text-[#ffb020] bg-[#ffb020]/20' : 'text-[#8b97a8] hover:text-[#ffb020] hover:bg-[#2a323d]'}`}
                        >
                          <Pin size={13} className={isPinned ? 'fill-[#ffb020]' : ''} />
                        </button>

                        <button
                          onClick={(e) => handleClearChatHistory(u.id, e)}
                          title="Eliminar conversación"
                          className="p-1.5 text-[#ff5470] hover:bg-[#ff5470]/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col">
              {activeDmUser ? (
                <>
                  <div className="p-3 border-b border-[#2a323d] font-semibold text-sm flex items-center justify-between bg-[#1d242e]/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: activeDmUser.avatar_color }}>
                        {activeDmUser.username[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          @{activeDmUser.username}
                          {activeDmUser.isOnline && <span className="text-[9px] text-[#00d4b1] bg-[#00d4b1]/10 px-1.5 rounded">online</span>}
                        </div>
                        <div className="text-[10px] text-[#8b97a8]">{activeDmUser.email}</div>
                      </div>
                    </div>

                    <button onClick={(e) => handleClearChatHistory(activeDmUser.id, e)} className="px-2.5 py-1 bg-[#ff5470]/20 text-[#ff5470] border border-[#ff5470]/30 hover:bg-[#ff5470]/30 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Trash2 size={14} /> Vaciar Conversación
                    </button>
                  </div>

                  {/* VISUALIZACIÓN DE MENSAJES CORREGIDA */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {directMessages.filter(dm => {
                      const isBetweenTheseTwo = 
                        (dm.sender_id === currentUser.id && dm.receiver_id === activeDmUser.id) ||
                        (dm.sender_id === activeDmUser.id && dm.receiver_id === currentUser.id);

                      if (!isBetweenTheseTwo) return false;

                      if (dmFolder === 'inbox') return dm.sender_id === activeDmUser.id;
                      if (dmFolder === 'sent') return dm.sender_id === currentUser.id;
                      return true; // Folder 'all'
                    }).length === 0 ? (
                      <div className="text-center text-xs text-[#8b97a8] py-8">
                        No hay mensajes registrados. ¡Escribe el primer mensaje a continuación!
                      </div>
                    ) : (
                      directMessages.filter(dm => {
                        const isBetweenTheseTwo = 
                          (dm.sender_id === currentUser.id && dm.receiver_id === activeDmUser.id) ||
                          (dm.sender_id === activeDmUser.id && dm.receiver_id === currentUser.id);

                        if (!isBetweenTheseTwo) return false;

                        if (dmFolder === 'inbox') return dm.sender_id === activeDmUser.id;
                        if (dmFolder === 'sent') return dm.sender_id === currentUser.id;
                        return true;
                      }).map(dm => (
                        <div key={dm.id} className={`flex flex-col group ${dm.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1">
                            <div className={`p-3 rounded-2xl max-w-xs text-sm ${dm.sender_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                              {dm.text}
                            </div>
                            <button onClick={() => handleDeleteSingleDm(dm.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#ff5470] hover:bg-[#ff5470]/20 rounded transition-all"><X size={12} /></button>
                          </div>
                          <div className="text-[9px] text-[#8b97a8] mt-1">{dm.created_at}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* FORMULARIO DE ENVÍO DE MENSAJES */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSendDm(); }} className="p-3 border-t border-[#2a323d] flex gap-2">
                    <input 
                      type="text" 
                      value={dmInput} 
                      onChange={(e) => setDmInput(e.target.value)} 
                      placeholder={`Enviar mensaje privado a @${activeDmUser.username}...`} 
                      className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]" 
                    />
                    <button type="submit" className="p-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white rounded-xl transition-all">
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">
                  Busca y selecciona un usuario de la lista izquierda para chatear.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB PERFIL PROFESIONAL */}
        {activeTab === 'profile' && (
          <div className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#2a323d] pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white" style={{ backgroundColor: currentUser.avatar_color }}>
                  {currentUser.username[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">{currentUser.fullName || currentUser.username} {currentUser.chat_role === 'master' && '👑'}</h2>
                  <p className="text-xs text-[#7c5cff] font-medium">{currentUser.headline || 'Miembro de Elraizer'}</p>
                  <p className="text-xs text-[#8b97a8]">@{currentUser.username} · {currentUser.email}</p>
                </div>
              </div>
              <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-[#7c5cff] text-white text-xs font-bold rounded-xl flex items-center gap-2"><Edit3 size={16} /> Editar Perfil</button>
            </div>
            <p className="text-xs text-[#e9eef5] bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">{currentUser.bio || 'Sin biografía especificada.'}</p>
          </div>
        )}
      </main>

      {/* RECUADRO PARA OTORGAR PUNTOS */}
      {pointsModalPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#ffb020]/50 text-[#e9eef5] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setPointsModalPost(null)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={18} /></button>

            <div className="flex items-center gap-2 text-[#ffb020] font-bold text-base border-b border-[#2a323d] pb-3">
              <Gift size={20} /> Otorgar Puntos al Post
            </div>

            <div className="text-xs text-[#8b97a8] space-y-1">
              <p>Autor: <strong className="text-white">@{pointsModalPost.author_name}</strong></p>
              <p>Tu Rango/Categoría: <strong className="text-[#7c5cff] capitalize">{currentUser.chat_role}</strong></p>
              <p>Tu Límite Diario: <strong className="text-white">{maxDailyPoints} Pts</strong> (Dado hoy: {currentGiven} Pts)</p>
              <p>Puntos Disponibles para Dar Hoy: <strong className="text-[#00d4b1]">{remainingDailyPoints} Pts</strong></p>
            </div>

            {pointsError && <div className="p-2.5 bg-[#ff5470]/10 border border-[#ff5470] text-[#ff5470] rounded-xl text-xs">{pointsError}</div>}

            <form onSubmit={handleGivePointsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Cantidad de puntos a regalar:</label>
                <input
                  type="number"
                  min="1"
                  max={remainingDailyPoints}
                  value={pointsToGiveInput}
                  onChange={(e) => setPointsToGiveInput(e.target.value)}
                  placeholder={`Máximo ${remainingDailyPoints}`}
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#ffb020]"
                />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#ffb020] to-[#f59e0b] text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg">
                Confirmar y Transferir Puntos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PANEL MAESTRO */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#ffb020]/40 text-[#e9eef5] rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20} /></button>

            <div className="flex items-center gap-3 border-b border-[#2a323d] pb-4">
              <Crown size={28} className="text-[#ffb020]" />
              <div>
                <h3 className="text-xl font-bold text-white">Panel Maestro de Administración</h3>
                <p className="text-xs text-[#8b97a8]">Gestión total de usuarios, ventas, publicaciones y bloqueos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
              <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] flex flex-col h-full overflow-hidden">
                <h4 className="text-xs font-bold text-[#8b97a8] uppercase mb-2">Usuarios Registrados ({users.length})</h4>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {users.map(u => (
                    <button key={u.id} onClick={() => setSelectedAdminUser(u)} className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between ${selectedAdminUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#161b23] border-[#2a323d]'}`}>
                      <div className="truncate">
                        <div className="font-semibold text-xs text-white flex items-center gap-1">
                          @{u.username}
                          {u.status === 'suspended' && <span className="bg-[#ffb020]/20 text-[#ffb020] text-[8px] px-1 rounded">SUSP</span>}
                          {u.status === 'banned' && <span className="bg-[#ff5470]/20 text-[#ff5470] text-[8px] px-1 rounded">BAN</span>}
                        </div>
                        <div className="text-[10px] text-[#8b97a8] truncate">{u.email}</div>
                      </div>
                      <ChevronRight size={14} className="text-[#8b97a8]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-[#1d242e] p-4 rounded-xl border border-[#2a323d] flex flex-col h-full overflow-y-auto space-y-4">
                {selectedAdminUser ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2a323d] pb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          @{selectedAdminUser.username}
                          <span className="text-xs bg-[#7c5cff]/20 text-[#a78bfa] px-2 py-0.5 rounded-full">{selectedAdminUser.role}</span>
                        </h4>
                        <p className="text-xs text-[#8b97a8]">{selectedAdminUser.email} · Registrado: {selectedAdminUser.joinedDate}</p>
                      </div>

                      {selectedAdminUser.id !== 'ext3-id' && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleAdminUserAction(selectedAdminUser.id, 'suspend')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedAdminUser.status === 'suspended' ? 'bg-[#00d4b1]/20 border-[#00d4b1] text-[#00d4b1]' : 'bg-[#ffb020]/20 border-[#ffb020] text-[#ffb020]'}`}>
                            {selectedAdminUser.status === 'suspended' ? 'Quitar Suspensión' : 'Suspender'}
                          </button>
                          <button onClick={() => handleAdminUserAction(selectedAdminUser.id, 'ban')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedAdminUser.status === 'banned' ? 'bg-[#00d4b1]/20 border-[#00d4b1] text-[#00d4b1]' : 'bg-[#ff5470]/20 border-[#ff5470] text-[#ff5470]'}`}>
                            {selectedAdminUser.status === 'banned' ? 'Desbanear' : 'Banear'}
                          </button>
                          <button onClick={() => handleAdminDeleteUser(selectedAdminUser.id)} className="px-2.5 py-1 bg-[#ff5470] text-white rounded-lg text-xs font-bold flex items-center gap-1">
                            <Trash2 size={14} /> Eliminar Cuenta
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase text-[#7c5cff]">Publicaciones en el Feed</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {posts.filter(p => p.author_id === selectedAdminUser.id).map(p => (
                          <div key={p.id} className="bg-[#161b23] p-2.5 rounded-xl border border-[#2a323d] flex items-center justify-between text-xs">
                            <span className="truncate pr-2">{p.text}</span>
                            <button onClick={() => setPosts(posts.filter(item => item.id !== p.id))} className="text-[#ff5470] p-1"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase text-[#00d4b1]">Productos Publicados / Vendidos</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {products.filter(prod => prod.seller_id === selectedAdminUser.id).map(prod => (
                          <div key={prod.id} className="bg-[#161b23] p-2.5 rounded-xl border border-[#2a323d] flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white block">{prod.title}</span>
                              <span className="text-[10px] text-[#00d4b1]">${prod.price} · {prod.sales} ventas</span>
                            </div>
                            <button onClick={() => setProducts(products.filter(item => item.id !== prod.id))} className="text-[#ff5470] p-1"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">
                    Selecciona un usuario a la izquierda para auditar sus publicaciones, ventas y gestionar su acceso.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#2a323d] text-[#e9eef5] rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a323d] pb-2">
              <h3 className="font-bold text-sm">Editar Datos de Perfil</h3>
              <button onClick={() => setIsEditingProfile(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsEditingProfile(false); }} className="space-y-3">
              <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs" placeholder="Nombre completo" />
              <input type="text" value={editHeadline} onChange={(e) => setEditHeadline(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs" placeholder="Titular profesional" />
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs resize-none" placeholder="Biografía" rows="3" />
              <button type="submit" className="w-full bg-[#7c5cff] text-white font-bold py-2.5 rounded-xl text-xs">Guardar Perfil</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARRITO */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#2a323d] text-[#e9eef5] rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a323d] pb-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#00d4b1]" /> Carrito & Acuerdo de Pago Directo
              </h3>
              <button onClick={() => setShowCartModal(false)}><X size={18} /></button>
            </div>
            {cart.length === 0 ? <p className="text-xs text-[#8b97a8] text-center py-6">Tu carrito está vacío.</p> : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-[#1d242e] p-2.5 rounded-xl border border-[#2a323d] text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.title}</span>
                        <span className="text-[10px] text-[#8b97a8]">Vendedor: @{item.seller_name}</span>
                      </div>
                      <span className="font-bold text-[#00d4b1]">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#00d4b1]/10 border border-[#00d4b1]/30 rounded-xl text-xs text-[#00d4b1]">
                  Al procesar el pago, se creará automáticamente un <strong>mensaje directo privado</strong> con el vendedor para acuerden la transferencia (Nequi, Crypto, Paypal, etc.) y la entrega.
                </div>

                <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2">
                  <MessageCircle size={16} /> Contactar Vendedor y Procesar Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
