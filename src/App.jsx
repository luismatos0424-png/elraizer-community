import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image as ImageIcon, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail,
  DollarSign, Package, CheckCircle2, Crown, Users, Settings, Activity, Camera,
  Edit3, Globe, Github, Twitter, Linkedin, Briefcase, MapPin, Calendar, Heart, Eye,
  Archive, Inbox, Send as SendIcon, FileText, CheckCheck, UserMinus, ShieldOff, Layers, Filter,
  Wifi, Circle, Award as AwardIcon, Gift, Clock, Key, KeyRound, Upload, Link as LinkIcon
} from 'lucide-react';

const AVATAR_COLORS = [
  '#7c5cff', '#00d4b1', '#ff5470', '#ffb020',
  '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'
];

const MARKETPLACE_CATEGORIES = [
  'Todos',
  'Software & Apps',
  'Scripts & Bot Tools',
  'Plantillas & UI Kits',
  'Servicios IT & Hosting',
  'Cuentas & Licencias',
  'Cursos & E-Books',
  'Hardware & Equipos',
  'Otros Recursos'
];

const RANK_POINTS_LIMITS = {
  master: 500,
  moderador: 200,
  veterano: 100,
  miembro: 50,
  nuevo: 20
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

const getFutureDateString = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString();
};

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Kit de Scripts Automation Tampermonkey',
    description: 'Pack de scripts utilitarios en JavaScript para automatizar tareas web y scraping básico.',
    price: 25.00,
    category: 'Scripts & Bot Tools',
    seller_id: 'ext3-id',
    seller_name: 'EXT3',
    seller_color: '#ffb020',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    sales: 18,
    createdAt: new Date().toISOString(),
    expiresAt: getFutureDateString(28)
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
    try {
      const saved = localStorage.getItem('elraizer_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_products');
      let loaded = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      const now = new Date();
      return loaded.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_chat');
      return saved ? JSON.parse(saved) : [
        { id: 'm1', user_id: 'ext3-id', user_name: 'EXT3', chat_role: 'master', text: 'Chat global activo. Recuerden mantener el respeto.', created_at: '12:00' }
      ];
    } catch {
      return [];
    }
  });

  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_dms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_pinned_dms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [dmSearchQuery, setDmSearchQuery] = useState('');

  // Marketplace Filters
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [marketSearchQuery, setMarketSearchQuery] = useState('');

  // Modals & Profile Edit State
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form State
  const [profileFullName, setProfileFullName] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileGithub, setProfileGithub] = useState('');
  const [profileTwitter, setProfileTwitter] = useState('');

  // Formulario Publicar Producto Marketplace
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Software & Apps');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [prodImageType, setProdImageType] = useState('url');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImagePreview, setProdImagePreview] = useState('');

  // Inputs Feed/Chat
  const [newPostText, setNewPostText] = useState('');
  const [postAttachments, setPostAttachments] = useState([]);
  const postFileInputRef = useRef(null);
  const postVideoInputRef = useRef(null);
  const postGeneralFileInputRef = useRef(null);

  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');

  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setProfileFullName(currentUser.fullName || '');
      setProfileHeadline(currentUser.headline || '');
      setProfileBio(currentUser.bio || '');
      setProfileLocation(currentUser.location || '');
      setProfileWebsite(currentUser.website || '');
      setProfileGithub(currentUser.github || '');
      setProfileTwitter(currentUser.twitter || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'elraizer_dms' && e.newValue) setDirectMessages(JSON.parse(e.newValue));
        if (e.key === 'elraizer_products' && e.newValue) {
          const fresh = JSON.parse(e.newValue);
          const now = new Date();
          setProducts(fresh.filter(p => !p.expiresAt || new Date(p.expiresAt) > now));
        }
        if (e.key === 'elraizer_posts' && e.newValue) setPosts(JSON.parse(e.newValue));
        if (e.key === 'elraizer_users' && e.newValue) setUsers(JSON.parse(e.newValue));
      } catch (err) {
        console.error("Storage error:", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('elraizer_messaging_channel');
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        try {
          if (event.data?.type === 'NEW_DM') {
            const freshDms = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
            setDirectMessages(freshDms);
          } else if (event.data?.type === 'PRODUCTS_UPDATE') {
            const freshProds = JSON.parse(localStorage.getItem('elraizer_products') || '[]');
            const now = new Date();
            setProducts(freshProds.filter(p => !p.expiresAt || new Date(p.expiresAt) > now));
          } else if (event.data?.type === 'POSTS_UPDATE') {
            const freshPosts = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
            setPosts(freshPosts);
          } else if (event.data?.type === 'USERS_UPDATE') {
            const freshUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
            setUsers(freshUsers);
          }
        } catch (err) {
          console.error("Broadcast error:", err);
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
    };
  }, []);

  useEffect(() => { localStorage.setItem('elraizer_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('elraizer_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('elraizer_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('elraizer_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('elraizer_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('elraizer_dms', JSON.stringify(directMessages)); }, [directMessages]);
  useEffect(() => { localStorage.setItem('elraizer_pinned_dms', JSON.stringify(pinnedUserIds)); }, [pinnedUserIds]);

  useEffect(() => {
    if (currentUser && activeDmUser && activeTab === 'dm') {
      const hasUnread = directMessages.some(m => m.sender_id === activeDmUser.id && m.receiver_id === currentUser.id && !m.read);
      if (hasUnread) {
        setDirectMessages(prev => {
          const updated = prev.map(m => {
            if (m.sender_id === activeDmUser.id && m.receiver_id === currentUser.id) {
              return { ...m, read: true };
            }
            return m;
          });
          localStorage.setItem('elraizer_dms', JSON.stringify(updated));
          if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'NEW_DM' });
          return updated;
        });
      }
    }
  }, [activeDmUser, currentUser, activeTab]);

  const unreadTotalCount = currentUser ? directMessages.filter(m => m.receiver_id === currentUser.id && !m.read).length : 0;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      fullName: profileFullName,
      headline: profileHeadline,
      bio: profileBio,
      location: profileLocation,
      website: profileWebsite,
      github: profileGithub,
      twitter: profileTwitter
    };

    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsersList);
    setCurrentUser(updatedUser);
    setIsEditingProfile(false);
    alert('Perfil actualizado con éxito.');
  };

  const executePublishProduct = (e) => {
    if (e) e.preventDefault();
    if (!newProdTitle.trim() || !newProdPrice || !newProdDescription.trim()) {
      alert('Por favor completa todos los campos requeridos: Título, Precio y Descripción.');
      return;
    }

    const finalImage = prodImageType === 'url' 
      ? (prodImageUrl.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80') 
      : (prodImagePreview || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80');

    const newProduct = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newProdTitle.trim(),
      description: newProdDescription.trim(),
      price: parseFloat(newProdPrice) || 0,
      category: newProdCategory,
      seller_id: currentUser ? currentUser.id : 'ext3-id',
      seller_name: currentUser ? currentUser.username : 'EXT3',
      seller_color: currentUser ? currentUser.avatar_color : '#ffb020',
      image: finalImage,
      rating: 5.0,
      sales: 0,
      createdAt: new Date().toISOString(),
      expiresAt: getFutureDateString(30)
    };

    const currentFromStorage = JSON.parse(localStorage.getItem('elraizer_products') || '[]');
    const updatedProds = [newProduct, ...currentFromStorage];
    localStorage.setItem('elraizer_products', JSON.stringify(updatedProds));
    setProducts(updatedProds);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'PRODUCTS_UPDATE' });
    }

    setSelectedCategory('Todos');
    setMarketSearchQuery('');
    setNewProdTitle('');
    setNewProdPrice('');
    setNewProdDescription('');
    setProdImageUrl('');
    setProdImagePreview('');
    setShowSellModal(false);
  };

  const handleCreatePost = (e) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() && postAttachments.length === 0) {
      alert('Escribe un texto o adjunta una imagen/archivo para publicar.');
      return;
    }

    const newPost = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      author_id: currentUser ? currentUser.id : 'ext3-id',
      author_name: currentUser ? currentUser.username : 'EXT3',
      author_color: currentUser ? currentUser.avatar_color : '#ffb020',
      author_chat_role: currentUser ? currentUser.chat_role : 'master',
      text: newPostText.trim(),
      tags: ['comunidad'],
      attachments: postAttachments,
      votes: 0,
      created_at: 'Ahora mismo'
    };

    const currentPostsFromStorage = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
    const updatedPosts = [newPost, ...currentPostsFromStorage];
    localStorage.setItem('elraizer_posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'POSTS_UPDATE' });
    }

    setNewPostText('');
    setPostAttachments([]);
  };

  const handleSendDm = (e) => {
    if (e) e.preventDefault();
    if (!dmInput.trim() || !currentUser || !activeDmUser) return;
    
    const dm = {
      id: 'dm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      sender_id: currentUser.id,
      receiver_id: activeDmUser.id,
      text: dmInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    const currentDmsFromStorage = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
    const updatedDms = [...currentDmsFromStorage, dm];
    localStorage.setItem('elraizer_dms', JSON.stringify(updatedDms));
    setDirectMessages(updatedDms);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'NEW_DM', payload: dm });
    }

    setDmInput('');
  };

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

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const savedUsers = localStorage.getItem('elraizer_users');
    const currentUsersList = savedUsers ? JSON.parse(savedUsers) : users;

    const inputClean = identifier.trim().toLowerCase();
    const found = currentUsersList.find(u => u.email.toLowerCase() === inputClean || u.username.toLowerCase() === inputClean);

    if (found) {
      if (found.status === 'suspended') return setAuthError('Esta cuenta ha sido suspendida temporalmente.');
      if (found.status === 'banned') return setAuthError('Esta cuenta ha sido BANEADA permanentemente.');
      if (found.password && found.password !== password) return setAuthError('Contraseña incorrecta.');
      
      const loggedUser = { ...found, isOnline: true };
      const updatedList = currentUsersList.map(u => u.id === found.id ? loggedUser : u);
      setUsers(updatedList);
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

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('elraizer_users', JSON.stringify(updatedUsers));
  };

  const togglePinConversation = (targetUserId, e) => {
    e.stopPropagation();
    if (pinnedUserIds.includes(targetUserId)) {
      setPinnedUserIds(pinnedUserIds.filter(id => id !== targetUserId));
    } else {
      setPinnedUserIds([...pinnedUserIds, targetUserId]);
    }
  };

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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesQuery = !marketSearchQuery.trim() || p.title.toLowerCase().includes(marketSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(marketSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
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
          </div>

          <button onClick={() => setShowCartModal(true)} className="relative p-2 bg-[#1d242e] hover:bg-[#2a323d] text-[#e9eef5] rounded-xl border border-[#2a323d] flex items-center gap-2 text-xs font-semibold">
            <ShoppingCart size={18} className="text-[#00d4b1]" />
            <span className="hidden sm:inline">Carrito</span>
            {cart.length > 0 && <span className="bg-[#7c5cff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
          </button>

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

      <nav className="sticky top-14 z-30 bg-[#161b23] border-b border-[#2a323d] flex justify-center gap-2 p-2 overflow-x-auto">
        <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🏠 Feed</button>
        <button onClick={() => setActiveTab('marketplace')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'marketplace' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🛒 Marketplace</button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>💬 Chat Global</button>
        <button onClick={() => setActiveTab('dm')} className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dm' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>
          ✉️ Mensajería Pro
          {unreadTotalCount > 0 && <span className="bg-[#ff5470] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">{unreadTotalCount}</span>}
        </button>
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
                      <button type="button" onClick={() => removePostAttachment(att.id)} className="text-[#ff5470] hover:bg-[#ff5470]/20 p-1 rounded-full"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-[#8b97a8]">
                  <input type="file" multiple accept="image/*" ref={postFileInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'image')} />
                  <button type="button" onClick={() => postFileInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#00d4b1] flex items-center gap-1 text-xs font-semibold">
                    <ImageIcon size={18} /> <span className="hidden sm:inline">Foto</span>
                  </button>

                  <input type="file" multiple accept="video/*" ref={postVideoInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'video')} />
                  <button type="button" onClick={() => postVideoInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#7c5cff] flex items-center gap-1 text-xs font-semibold">
                    <Video size={18} /> <span className="hidden sm:inline">Video</span>
                  </button>

                  <input type="file" multiple ref={postGeneralFileInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'file')} />
                  <button type="button" onClick={() => postGeneralFileInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#ffb020] flex items-center gap-1 text-xs font-semibold">
                    <Paperclip size={18} /> <span className="hidden sm:inline">Archivo</span>
                  </button>
                </div>
                
                <button 
                  type="button" 
                  onClick={handleCreatePost} 
                  className="px-5 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Publicar
                </button>
              </div>
            </div>

            {posts.map(p => (
              <div key={p.id} className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: p.author_color }}>
                      {p.author_name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        @{p.author_name}
                      </div>
                      <div className="text-xs text-[#8b97a8]">{p.created_at}</div>
                    </div>
                  </div>
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
              </div>
            ))}
          </div>
        )}

        {/* TAB MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] bg-clip-text text-transparent flex items-center gap-2">
                  🛒 Marketplace Pro Elraizer
                </h2>
                <p className="text-xs text-[#8b97a8] mt-1">Publicaciones activas en la plataforma durante 30 días.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowSellModal(true)} 
                className="px-5 py-3 bg-gradient-to-r from-[#00d4b1] to-[#10b981] hover:from-[#00b89a] hover:to-[#059669] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xl transition-all cursor-pointer"
              >
                <Plus size={18} /> Publicar un Producto
              </button>
            </div>

            <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-[#8b97a8]" />
                <input
                  type="text"
                  value={marketSearchQuery}
                  onChange={(e) => setMarketSearchQuery(e.target.value)}
                  placeholder="Buscar en la tienda..."
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#00d4b1]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                {MARKETPLACE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#00d4b1] text-slate-950 font-bold' : 'bg-[#1d242e] text-[#8b97a8] hover:bg-[#2a323d] hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden flex flex-col justify-between group p-4 space-y-3">
                  <img src={prod.image} alt={prod.title} className="w-full h-48 object-cover rounded-xl" />
                  <div>
                    <span className="text-[10px] bg-[#7c5cff]/20 text-[#7c5cff] font-bold px-2 py-0.5 rounded-full uppercase">{prod.category}</span>
                    <h3 className="font-bold text-base text-[#e9eef5] mt-1">{prod.title}</h3>
                    <p className="text-xs text-[#8b97a8] line-clamp-2">{prod.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#2a323d] pt-3">
                    <span className="text-xl font-bold text-[#00d4b1]">${prod.price.toFixed(2)}</span>
                    <button onClick={() => setCart([...cart, { ...prod, qty: 1 }])} className="px-3.5 py-1.5 bg-[#7c5cff] text-white text-xs font-bold rounded-xl flex items-center gap-1">
                      <ShoppingCart size={14} /> Comprar
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
                  <div className="text-[10px] text-[#8b97a8] mb-1">@{m.user_name}</div>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${m.user_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                    {m.text}
                  </div>
                  <div className="text-[9px] text-[#8b97a8] mt-1">{m.created_at}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#2a323d] flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setChatMessages([...chatMessages, { id: 'm_' + Date.now(), user_id: currentUser.id, user_name: currentUser.username, text: chatInput, created_at: 'Ahora' }]), setChatInput(''))} placeholder="Escribe un mensaje al chat global..." className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]" />
              <button onClick={() => { if(chatInput.trim()) { setChatMessages([...chatMessages, { id: 'm_' + Date.now(), user_id: currentUser.id, user_name: currentUser.username, text: chatInput, created_at: 'Ahora' }]); setChatInput(''); }}} className="p-2 bg-[#7c5cff] text-white rounded-xl"><Send size={18} /></button>
            </div>
          </div>
        )}

        {/* TAB MENSAJERÍA DIRECTA */}
        {activeTab === 'dm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            <div className="bg-[#161b23] border border-[#2a323d] rounded-xl p-3 space-y-3 flex flex-col">
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

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredUsersForDm.map(u => {
                  const isPinned = pinnedUserIds.includes(u.id);
                  const unreadCount = directMessages.filter(m => m.sender_id === u.id && m.receiver_id === currentUser.id && !m.read).length;

                  return (
                    <div
                      key={u.id}
                      onClick={() => setActiveDmUser(u)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${activeDmUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#1d242e] border-[#2a323d] hover:bg-[#2a323d]'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative text-white" style={{ backgroundColor: u.avatar_color }}>
                          {u.username[0]}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-white flex items-center gap-1">
                            @{u.username}
                            {unreadCount > 0 && <span className="bg-[#00d4b1] text-slate-950 text-[9px] font-bold px-1.5 rounded-full">NUEVO</span>}
                          </div>
                          <div className="text-[10px] text-[#8b97a8] truncate">{u.email}</div>
                        </div>
                      </div>
                      <button onClick={(e) => togglePinConversation(u.id, e)} className="p-1.5 text-[#8b97a8] hover:text-[#ffb020]"><Pin size={13} className={isPinned ? 'fill-[#ffb020] text-[#ffb020]' : ''} /></button>
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
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: activeDmUser.avatar_color }}>
                        {activeDmUser.username[0]}
                      </div>
                      <span className="text-xs font-bold text-white">@{activeDmUser.username}</span>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {directMessages.filter(dm => 
                      (dm.sender_id === currentUser.id && dm.receiver_id === activeDmUser.id) ||
                      (dm.sender_id === activeDmUser.id && dm.receiver_id === currentUser.id)
                    ).map(dm => (
                      <div key={dm.id} className={`flex flex-col group ${dm.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-xs text-sm ${dm.sender_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>
                          {dm.text}
                        </div>
                        <div className="text-[9px] text-[#8b97a8] mt-1">{dm.created_at}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendDm} className="p-3 border-t border-[#2a323d] flex gap-2">
                    <input 
                      type="text" 
                      value={dmInput} 
                      onChange={(e) => setDmInput(e.target.value)} 
                      placeholder={`Enviar mensaje a @${activeDmUser.username}...`} 
                      className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff]" 
                    />
                    <button type="submit" className="p-2 bg-[#7c5cff] text-white rounded-xl">
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">
                  Selecciona un usuario a la izquierda para conversar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB MI PERFIL COMPLETO RESTAURADO */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden shadow-xl">
              <div 
                className="h-44 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${currentUser.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b23] via-transparent to-transparent" />
              </div>

              <div className="px-6 pb-6 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-4 gap-4">
                  <div className="flex items-end gap-4">
                    <div 
                      className="w-24 h-24 rounded-2xl border-4 border-[#161b23] flex items-center justify-center font-extrabold text-3xl text-white shadow-2xl relative"
                      style={{ backgroundColor: currentUser.avatar_color }}
                    >
                      {currentUser.username[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentUser.fullName || currentUser.username}</h2>
                      <p className="text-xs text-[#7c5cff] font-semibold">@{currentUser.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 bg-[#1d242e] hover:bg-[#2a323d] border border-[#2a323d] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Edit3 size={14} /> {isEditingProfile ? 'Cancelar Edición' : 'Editar Perfil'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 bg-[#1d242e] p-5 rounded-xl border border-[#2a323d] mt-4">
                    <h3 className="font-bold text-sm text-[#00d4b1] border-b border-[#2a323d] pb-2">Editar Datos de Perfil</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8b97a8] mb-1">Nombre Completo</label>
                        <input type="text" value={profileFullName} onChange={(e) => setProfileFullName(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs text-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8b97a8] mb-1">Titular / Rol Profesional</label>
                        <input type="text" value={profileHeadline} onChange={(e) => setProfileHeadline(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#8b97a8] mb-1">Biografía</label>
                      <textarea rows="2" value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs text-white resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8b97a8] mb-1">Ubicación</label>
                        <input type="text" value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs text-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8b97a8] mb-1">Sitio Web</label>
                        <input type="text" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs text-white" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="submit" className="px-5 py-2 bg-[#7c5cff] text-white font-bold text-xs rounded-xl shadow-md">Guardar Cambios</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-[#8b97a8] font-medium">{currentUser.headline || 'Sin titular especificado.'}</p>
                    <p className="text-xs text-[#e9eef5] bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">{currentUser.bio || 'Sin biografía especificada.'}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-[#8b97a8] border-t border-[#2a323d] pt-3">
                      {currentUser.location && <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00d4b1]" /> {currentUser.location}</span>}
                      {currentUser.website && <a href={currentUser.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#7c5cff] hover:underline"><Globe size={14} /> {currentUser.website}</a>}
                      <span className="flex items-center gap-1"><Calendar size={14} /> Miembro desde: {currentUser.joinedDate || 'Reciente'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PUBLICAR PRODUCTO */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#00d4b1]/50 text-[#e9eef5] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowSellModal(false)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20} /></button>

            <div className="flex items-center gap-2 text-[#00d4b1] font-bold text-lg border-b border-[#2a323d] pb-3">
              <ShoppingBag size={22} /> Publicar Nuevo Producto en Marketplace
            </div>

            <form onSubmit={executePublishProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Título del Producto / Servicio *</label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="Ej. Script Automatizado, Licencia Hosting, Plantilla Web..."
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Categoría *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1] text-white"
                  >
                    {MARKETPLACE_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Precio (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Descripción Detallada *</label>
                <textarea
                  required
                  rows="3"
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Detalla qué incluye el producto..."
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1] resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#00d4b1] to-[#10b981] text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Publicar Ahora en Marketplace
              </button>
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
                <ShoppingCart size={18} className="text-[#00d4b1]" /> Carrito de Compras
              </h3>
              <button onClick={() => setShowCartModal(false)}><X size={18} /></button>
            </div>
            {cart.length === 0 ? <p className="text-xs text-[#8b97a8] text-center py-6">Tu carrito está vacío.</p> : (
              <div className="space-y-3">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
