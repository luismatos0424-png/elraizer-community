import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Corona, Moon, Sun, Bell, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image as ImageIcon, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail,
  DollarSign, Package, CheckCircle2, Crown, Users, Settings, Activity, Camera,
  Edit3, Globe, Github, Twitter, Linkedin, Briefcase, MapPin, Calendar, Heart, Eye
} from 'lucide-react';

const AVATAR_COLORS = [
  '#7c5cff', '#00d4b1', '#ff5470', '#ffb020',
  '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'
];

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
    joinedDate: 'Octubre 2024',
    suspended: false 
  }
];

const INITIAL_POSTS = [
  { id: 'p1', author_id: 'ext3-id', author_name: 'EXT3', author_color: '#ffb020', author_chat_role: 'master', text: '¡Bienvenidos oficialmente a Elraizer Community! 🚀 Explora el feed, participa en el chat global, comercia en el marketplace y envía mensajes privados.', tags: ['bienvenida', 'comunidad', 'anuncio'], media: [], votes: 42, created_at: 'Hace 2 horas' }
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
    seller_id: 'ext3-id',
    seller_name: 'EXT3',
    seller_color: '#ffb020',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    sales: 24,
    created_at: 'Hace 3 días'
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState(null);

  // Auth states
  const [authTab, setAuthTab] = useState('login');
  const [identifier, setIdentifier] = useState('');
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
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Inputs
  const [newPostText, setNewPostText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');

  // Form Venta Producto
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Digital');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('elraizer_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('elraizer_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('elraizer_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('elraizer_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elraizer_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('elraizer_dms', JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName || '');
      setEditHeadline(currentUser.headline || '');
      setEditBio(currentUser.bio || '');
      setEditLocation(currentUser.location || '');
      setEditWebsite(currentUser.website || '');
      setEditGithub(currentUser.github || '');
      setEditTwitter(currentUser.twitter || '');
      setEditAvatarUrl(currentUser.avatar_url || '');
      setEditBannerUrl(currentUser.banner_url || '');
    }
  }, [currentUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    const inputClean = identifier.trim().toLowerCase();

    const found = users.find(u => 
      u.email.toLowerCase() === inputClean || 
      u.username.toLowerCase() === inputClean
    );

    if (found) {
      if (found.suspended) {
        setAuthError('Esta cuenta ha sido suspendida por la administración.');
        return;
      }
      
      if (found.password && found.password !== password) {
        setAuthError('La contraseña ingresada es incorrecta.');
        return;
      }

      setCurrentUser(found);
    } else {
      setAuthError('Usuario o correo no encontrado. Verifique sus datos o regístrese.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!identifier || !password) {
      setAuthError('Completa todos los campos para registrarte.');
      return;
    }

    const inputClean = identifier.trim().toLowerCase();

    if (inputClean === 'ext3' || inputClean === 'ext3@elraizer.com') {
      setAuthError('Este usuario / correo está reservado para la cuenta maestra.');
      return;
    }

    const exists = users.find(u => 
      u.email.toLowerCase() === inputClean || 
      u.username.toLowerCase() === inputClean
    );

    if (exists) {
      setAuthError('Ya existe una cuenta con este usuario o correo electrónico.');
      return;
    }

    const isEmail = inputClean.includes('@');
    const uname = isEmail ? inputClean.split('@')[0] : identifier.trim();
    const newUser = {
      id: 'usr_' + Date.now(),
      email: isEmail ? inputClean : `${inputClean}@elraizer.com`,
      username: uname,
      password: password,
      fullName: uname,
      headline: 'Nuevo Miembro de Elraizer',
      bio: '¡Hola! Recientemente me he unido a Elraizer Community.',
      location: 'Colombia',
      website: '',
      github: '',
      twitter: '',
      avatar_url: '',
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      role: 'user',
      chat_role: 'nuevo',
      points: 0,
      joinedDate: 'Reciente',
      suspended: false
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      fullName: editFullName,
      headline: editHeadline,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
      github: editGithub,
      twitter: editTwitter,
      avatar_url: editAvatarUrl,
      banner_url: editBannerUrl
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setIsEditingProfile(false);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setEditAvatarUrl(reader.result);
        } else if (type === 'banner') {
          setEditBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleUserRole = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId && u.id !== 'ext3-id') {
        const newRole = u.role === 'admin' ? 'user' : 'admin';
        const newChatRole = newRole === 'admin' ? 'moderador' : 'miembro';
        return { ...u, role: newRole, chat_role: newChatRole };
      }
      return u;
    }));
  };

  const toggleUserSuspend = (userId) => {
    if (userId === 'ext3-id') return;
    setUsers(users.map(u => u.id === userId ? { ...u, suspended: !u.suspended } : u));
  };

  const givePoints = (userId, amount) => {
    setUsers(users.map(u => u.id === userId ? { ...u, points: u.points + amount } : u));
  };

  const deletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const deleteProduct = (prodId) => {
    setProducts(products.filter(p => p.id !== prodId));
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handlePublishProduct = (e) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice || !prodDesc) return;

    const newProd = {
      id: 'prod_' + Date.now(),
      title: prodTitle,
      price: parseFloat(prodPrice),
      category: prodCategory,
      description: prodDesc,
      seller_id: currentUser.id,
      seller_name: currentUser.username,
      seller_color: currentUser.avatar_color,
      image: prodImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      rating: 5.0,
      sales: 0,
      created_at: 'Ahora mismo'
    };

    setProducts([newProd, ...products]);
    setProdTitle('');
    setProdPrice('');
    setProdDesc('');
    setProdImage('');
    setShowSellModal(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setOrderSuccess(true);
    setTimeout(() => {
      setCart([]);
      setOrderSuccess(false);
      setShowCartModal(false);
    }, 2000);
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
                <span>Marketplace de productos, servicios y carrito de compras</span>
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

            <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">Usuario o Correo Electrónico</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff]"
                  placeholder="EXT3 o tuemail@ejemplo.com"
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
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-95 transition-all mt-2"
              >
                {authTab === 'login' ? 'Entrar a Elraizer' : 'Crear mi cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const myPostsCount = posts.filter(p => p.author_id === currentUser.id).length;
  const myProductsCount = products.filter(p => p.seller_id === currentUser.id).length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0e1116] text-[#e9eef5]' : 'bg-[#f4f6fb] text-[#0f172a]'}`}>
      <header className="sticky top-0 z-40 bg-[#161b23]/90 backdrop-blur-md border-b border-[#2a323d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">
          ◈ Elraizer Community
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCartModal(true)}
            className="relative p-2 bg-[#1d242e] hover:bg-[#2a323d] text-[#e9eef5] rounded-xl border border-[#2a323d] flex items-center gap-2 transition-all text-xs font-semibold"
          >
            <ShoppingCart size={18} className="text-[#00d4b1]" />
            <span className="hidden sm:inline">Carrito</span>
            {cart.length > 0 && (
              <span className="bg-[#7c5cff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>

          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => setShowAdminModal(true)} 
              className="p-2 bg-[#ffb020]/20 text-[#ffb020] hover:bg-[#ffb020]/30 rounded-xl border border-[#ffb020]/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Crown size={16} />
              <span>Panel Maestro</span>
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
        <button onClick={() => setActiveTab('marketplace')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'marketplace' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>🛒 Marketplace</button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>💬 Chat Global</button>
        <button onClick={() => setActiveTab('dm')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'dm' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>✉️ Mensajes Privados</button>
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
              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-[#8b97a8]">
                  <button className="p-2 hover:bg-[#1d242e] rounded-lg"><ImageIcon size={18} /></button>
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
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={p.author_name} className="w-9 h-9 rounded-full object-cover border border-[#7c5cff]/30" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.author_color }}>
                        {p.author_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {p.author_name} <span className="text-[10px] bg-[#2a323d] px-2 py-0.5 rounded-full text-[#8b97a8]">{p.author_chat_role}</span>
                      </div>
                      <div className="text-xs text-[#8b97a8]">{p.created_at}</div>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={() => deletePost(p.id)}
                      className="p-1.5 text-[#ff5470] hover:bg-[#ff5470]/10 rounded-lg transition-all text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
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

        {/* TAB MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] bg-clip-text text-transparent">
                  Marketplace Digital
                </h2>
                <p className="text-xs text-[#8b97a8] mt-1">Compra y vende recursos, servicios y software de forma segura.</p>
              </div>
              <button
                onClick={() => setShowSellModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#00d4b1] to-[#10b981] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
              >
                <Plus size={16} /> Publicar Producto / Servicio
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(prod => (
                <div key={prod.id} className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#7c5cff]/50 transition-all group">
                  <div>
                    <div className="h-44 overflow-hidden relative">
                      <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 right-3 bg-[#161b23]/80 backdrop-blur-md text-[#00d4b1] border border-[#00d4b1]/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {prod.category}
                      </span>
                      {currentUser.role === 'admin' && (
                        <button 
                          onClick={() => deleteProduct(prod.id)}
                          className="absolute top-3 left-3 bg-[#ff5470] text-white p-1.5 rounded-xl text-xs hover:opacity-90 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#8b97a8]">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: prod.seller_color }}>
                          {prod.seller_name[0]}
                        </div>
                        <span>{prod.seller_name}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#e9eef5] group-hover:text-[#7c5cff] transition-colors">{prod.title}</h3>
                      <p className="text-xs text-[#8b97a8] line-clamp-2">{prod.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-[#2a323d]/50 mt-2">
                    <div className="text-lg font-bold text-[#00d4b1]">${prod.price.toFixed(2)}</div>
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-3 py-1.5 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                    >
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

        {/* TAB MENSAJES PRIVADOS */}
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
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: u.avatar_color }}>
                      {u.username[0]}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="font-semibold text-xs">{u.username}</div>
                    <div className="text-[10px] text-[#8b97a8] truncate">{u.headline || u.bio}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col">
              {activeDmUser ? (
                <>
                  <div className="p-3 border-b border-[#2a323d] font-semibold text-sm flex items-center gap-2">
                    {activeDmUser.avatar_url ? (
                      <img src={activeDmUser.avatar_url} alt={activeDmUser.username} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: activeDmUser.avatar_color }}>
                        {activeDmUser.username[0]}
                      </div>
                    )}
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

        {/* TAB PERFIL PROFESIONAL FUNCIONAL */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden shadow-2xl relative">
              {/* BANNER PORTADA */}
              <div className="h-48 w-full relative bg-[#1d242e]">
                <img 
                  src={currentUser.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'} 
                  alt="Portada" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b23] via-transparent to-transparent"></div>
              </div>

              {/* DETALLES DE PERFIL */}
              <div className="px-6 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
                  {/* FOTO DE PERFIL / AVATAR */}
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl border-4 border-[#161b23] overflow-hidden shadow-2xl flex items-center justify-center bg-[#1d242e]">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-white" style={{ backgroundColor: currentUser.avatar_color }}>
                          {currentUser.username[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Edit3 size={16} /> Editar Perfil Profesional
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      {currentUser.fullName || currentUser.username}
                      {currentUser.chat_role === 'master' && <Crown size={20} className="text-[#ffb020]" />}
                    </h1>
                    <p className="text-sm text-[#7c5cff] font-medium">{currentUser.headline || 'Miembro de Elraizer'}</p>
                    <p className="text-xs text-[#8b97a8] mt-0.5">@{currentUser.username} · {currentUser.email}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#e9eef5] max-w-2xl bg-[#1d242e]/50 p-3 rounded-xl border border-[#2a323d]/50">
                    {currentUser.bio || 'Sin descripción aún.'}
                  </p>

                  {/* METADATOS Y REDES */}
                  <div className="flex flex-wrap gap-4 text-xs text-[#8b97a8] pt-2 border-t border-[#2a323d]">
                    {currentUser.location && (
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00d4b1]" /> {currentUser.location}</span>
                    )}
                    {currentUser.website && (
                      <a href={currentUser.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#7c5cff]"><Globe size={14} className="text-[#7c5cff]" /> Sitio Web</a>
                    )}
                    {currentUser.github && (
                      <span className="flex items-center gap-1"><Github size={14} /> {currentUser.github}</span>
                    )}
                    {currentUser.twitter && (
                      <span className="flex items-center gap-1"><Twitter size={14} className="text-sky-400" /> {currentUser.twitter}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar size={14} /> Unido en {currentUser.joinedDate || '2024'}</span>
                  </div>
                </div>

                {/* METRICAS Y ESTADISTICAS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                    <div className="text-lg font-bold text-[#00d4b1]">{currentUser.points}</div>
                    <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Puntos Reputación</div>
                  </div>
                  <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                    <div className="text-lg font-bold text-[#7c5cff]">{myPostsCount}</div>
                    <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Publicaciones</div>
                  </div>
                  <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                    <div className="text-lg font-bold text-[#ffb020]">{myProductsCount}</div>
                    <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Productos Venta</div>
                  </div>
                  <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                    <div className="text-lg font-bold text-sky-400">{currentUser.role === 'admin' ? 'Administrador' : 'Miembro'}</div>
                    <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Rango Actual</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDITAR PERFIL PROFESIONAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b23] border border-[#2a323d] text-[#e9eef5] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b border-[#2a323d] pb-3">
              <Edit3 size={22} className="text-[#7c5cff]" />
              <h3 className="text-lg font-bold">Editar Perfil Profesional</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="overflow-y-auto flex-1 space-y-4 pr-1">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#7c5cff] tracking-wider">Imágenes de Perfil y Portada</h4>
                
                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">URL Foto de Perfil / Avatar</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={avatarInputRef} 
                      onChange={(e) => handleImageUpload(e, 'avatar')} 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current.click()}
                      className="px-3 py-2 bg-[#2a323d] hover:bg-[#3a4454] text-xs font-semibold rounded-xl flex items-center gap-1"
                    >
                      <Camera size={14} /> Cargar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">URL Foto de Portada / Banner</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editBannerUrl}
                      onChange={(e) => setEditBannerUrl(e.target.value)}
                      className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="https://ejemplo.com/mi-portada.jpg"
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleImageUpload(e, 'banner')} 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current.click()}
                      className="px-3 py-2 bg-[#2a323d] hover:bg-[#3a4454] text-xs font-semibold rounded-xl flex items-center gap-1"
                    >
                      <Camera size={14} /> Cargar
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#2a323d]">
                <h4 className="text-xs font-bold uppercase text-[#7c5cff] tracking-wider">Información Personal & Profesional</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8b97a8] block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="Luis Ernesto Matos"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b97a8] block mb-1">Titular Profesional</label>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={(e) => setEditHeadline(e.target.value)}
                      className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="Desarrollador Web / Especialista Soporte"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                    placeholder="Armenia, Quindío, Colombia"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">Biografía / Descripción Profesional</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows="3"
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff] resize-none"
                    placeholder="Describe tu experiencia, habilidades e intereses principales..."
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#2a323d]">
                <h4 className="text-xs font-bold uppercase text-[#7c5cff] tracking-wider">Enlaces y Redes Sociales</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[#8b97a8] block mb-1">Sitio Web</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="https://misitio.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b97a8] block mb-1">GitHub</label>
                    <input
                      type="text"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="usuario"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b97a8] block mb-1">Twitter / X</label>
                    <input
                      type="text"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                      placeholder="@usuario"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] text-white font-bold py-3 rounded-xl text-xs hover:opacity-95 transition-all shadow-lg mt-2"
              >
                Guardar Cambios de Perfil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PANEL MAESTRO / ADMINISTRACIÓN */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b23] border border-[#ffb020]/40 text-[#e9eef5] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a323d] pb-4">
              <div className="p-2 bg-[#ffb020]/20 border border-[#ffb020]/40 rounded-xl text-[#ffb020]">
                <Crown size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Panel Maestro de Administración
                </h3>
                <p className="text-xs text-[#8b97a8]">Gestión total de usuarios, roles, reputación y moderación de contenido.</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                  <div className="text-xl font-bold text-[#00d4b1]">{users.length}</div>
                  <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Usuarios</div>
                </div>
                <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                  <div className="text-xl font-bold text-[#7c5cff]">{posts.length}</div>
                  <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Publicaciones</div>
                </div>
                <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] text-center">
                  <div className="text-xl font-bold text-[#ffb020]">{products.length}</div>
                  <div className="text-[10px] text-[#8b97a8] uppercase font-bold">Productos</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#8b97a8] tracking-wider">Gestión de Usuarios Registrados</h4>
                {users.map(u => (
                  <div key={u.id} className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: u.avatar_color }}>
                        {u.username[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                          {u.username}
                          {u.id === 'ext3-id' && <span className="bg-[#ffb020]/20 text-[#ffb020] border border-[#ffb020]/30 text-[9px] px-1.5 py-0.2 rounded-full">FUNDADOR</span>}
                          {u.suspended && <span className="bg-[#ff5470]/20 text-[#ff5470] border border-[#ff5470]/30 text-[9px] px-1.5 py-0.2 rounded-full">SUSPENDIDO</span>}
                        </div>
                        <div className="text-[10px] text-[#8b97a8]">{u.email} · {u.points} pts</div>
                      </div>
                    </div>

                    {u.id !== 'ext3-id' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => givePoints(u.id, 100)}
                          className="px-2.5 py-1 bg-[#00d4b1]/10 border border-[#00d4b1]/30 text-[#00d4b1] hover:bg-[#00d4b1]/20 rounded-lg text-[11px] font-semibold transition-all"
                        >
                          +100 Pts
                        </button>
                        <button
                          onClick={() => toggleUserRole(u.id)}
                          className={`px-2.5 py-1 border rounded-lg text-[11px] font-semibold transition-all ${u.role === 'admin' ? 'bg-[#7c5cff]/20 border-[#7c5cff]/40 text-[#a78bfa]' : 'bg-[#2a323d] border-[#3a4454] text-[#8b97a8]'}`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Hacer Admin'}
                        </button>
                        <button
                          onClick={() => toggleUserSuspend(u.id)}
                          className={`px-2.5 py-1 border rounded-lg text-[11px] font-semibold transition-all ${u.suspended ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]' : 'bg-[#ff5470]/20 border-[#ff5470]/40 text-[#ff5470]'}`}
                        >
                          {u.suspended ? 'Activar' : 'Suspender'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRITO DE COMPRAS */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b23] border border-[#2a323d] text-[#e9eef5] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowCartModal(false)}
              className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b border-[#2a323d] pb-3">
              <ShoppingCart size={22} className="text-[#00d4b1]" />
              <h3 className="text-lg font-bold">Carrito de Compras</h3>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-[#00d4b1]" />
                <h4 className="text-lg font-bold text-white">¡Compra realizada con éxito!</h4>
                <p className="text-xs text-[#8b97a8]">Recibirás la confirmación e instrucciones de acceso de inmediato.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-[#8b97a8] text-sm">
                Tu carrito de compras está vacío.
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">
                      <div className="truncate flex-1 pr-2">
                        <div className="font-semibold text-xs text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-[#00d4b1]">${item.price.toFixed(2)} x {item.qty}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#ff5470] hover:bg-[#ff5470]/10 p-1.5 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#2a323d] pt-3 flex justify-between items-center text-sm font-bold">
                  <span>Total:</span>
                  <span className="text-lg text-[#00d4b1]">${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] text-slate-950 font-bold py-3 rounded-xl text-xs hover:opacity-95 transition-all shadow-lg"
                >
                  Procesar Pago
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL PUBLICAR PRODUCTO EN MARKETPLACE */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b23] border border-[#2a323d] text-[#e9eef5] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowSellModal(false)}
              className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b border-[#2a323d] pb-3">
              <ShoppingBag size={22} className="text-[#7c5cff]" />
              <h3 className="text-lg font-bold">Publicar en Marketplace</h3>
            </div>

            <form onSubmit={handlePublishProduct} className="space-y-3">
              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">Título del Producto/Servicio</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                  placeholder="Ej: Script de automatización Web / UI Kit"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">Precio ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b97a8] block mb-1">Categoría</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                  >
                    <option value="Digital">Digital</option>
                    <option value="Software">Software</option>
                    <option value="Plantillas">Plantillas</option>
                    <option value="Servicios">Servicios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">URL de Imagen (Opcional)</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-[#8b97a8] block mb-1">Descripción corta</label>
                <textarea
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows="3"
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#7c5cff] resize-none"
                  placeholder="Explica detalladamente qué ofrece tu producto o servicio..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] text-white font-bold py-3 rounded-xl text-xs hover:opacity-95 transition-all shadow-lg mt-2"
              >
                Publicar Ahora
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
