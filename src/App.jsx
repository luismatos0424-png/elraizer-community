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
  },
  {
    id: 'prod_2',
    title: 'Plantilla Premium Single-Page WebView',
    description: 'Diseño responsive ultrafino optimizado para portales comunitarios y paneles e-commerce.',
    price: 45.00,
    category: 'Plantillas & UI Kits',
    seller_id: 'usr_demo1',
    seller_name: 'DevUser',
    seller_color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    sales: 24,
    createdAt: new Date().toISOString(),
    expiresAt: getFutureDateString(15)
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
    let loaded = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    const now = new Date();
    return loaded.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);
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

  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    const saved = localStorage.getItem('elraizer_pinned_dms');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation & Marketplace Filters
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [dmFolder, setDmFolder] = useState('all');
  const [dmSearchQuery, setDmSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [marketSearchQuery, setMarketSearchQuery] = useState('');

  // Modals & State
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Modal para Otorgar Puntos
  const [pointsModalPost, setPointsModalPost] = useState(null);
  const [pointsToGiveInput, setPointsToGiveInput] = useState('');
  const [pointsError, setPointsError] = useState('');

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
  const prodFileInputRef = useRef(null);

  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');

  // Sincronización mediante canal de transmisión (BroadcastChannel) y evento de almacenamiento
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    // 1. Escuchar evento nativo 'storage' (Se activa entre ventanas con diferentes usuarios/pestañas)
    const handleStorageChange = (e) => {
      if (e.key === 'elraizer_dms' && e.newValue) {
        setDirectMessages(JSON.parse(e.newValue));
      }
      if (e.key === 'elraizer_products' && e.newValue) {
        const fresh = JSON.parse(e.newValue);
        const now = new Date();
        setProducts(fresh.filter(p => !p.expiresAt || new Date(p.expiresAt) > now));
      }
      if (e.key === 'elraizer_users' && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 2. BroadcastChannel para comunicación dentro de la misma sesión o pestañas simultáneas
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('elraizer_messaging_channel');
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_DM') {
          const freshDms = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
          setDirectMessages(freshDms);
        } else if (event.data?.type === 'PRODUCTS_UPDATE') {
          const freshProds = JSON.parse(localStorage.getItem('elraizer_products') || '[]');
          const now = new Date();
          setProducts(freshProds.filter(p => !p.expiresAt || new Date(p.expiresAt) > now));
        } else if (event.data?.type === 'USERS_UPDATE') {
          const freshUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
          setUsers(freshUsers);
        }
      };
    }

    // 3. Polling de respaldo continuo (1 segundo) para forzar refresco
    const intervalId = setInterval(() => {
      const freshDmsStr = localStorage.getItem('elraizer_dms');
      if (freshDmsStr) {
        const freshDms = JSON.parse(freshDmsStr);
        setDirectMessages(prev => JSON.stringify(prev) !== JSON.stringify(freshDms) ? freshDms : prev);
      }

      const freshProdsStr = localStorage.getItem('elraizer_products');
      if (freshProdsStr) {
        const freshProds = JSON.parse(freshProdsStr);
        const now = new Date();
        const validProds = freshProds.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);
        setProducts(prev => JSON.stringify(prev) !== JSON.stringify(validProds) ? validProds : prev);
      }

      const freshUsersStr = localStorage.getItem('elraizer_users');
      if (freshUsersStr) {
        const freshUsers = JSON.parse(freshUsersStr);
        setUsers(prev => JSON.stringify(prev) !== JSON.stringify(freshUsers) ? freshUsers : prev);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      clearInterval(intervalId);
    };
  }, []);

  // Sync LocalStorage
  useEffect(() => { localStorage.setItem('elraizer_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('elraizer_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('elraizer_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('elraizer_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('elraizer_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('elraizer_dms', JSON.stringify(directMessages)); }, [directMessages]);
  useEffect(() => { localStorage.setItem('elraizer_pinned_dms', JSON.stringify(pinnedUserIds)); }, [pinnedUserIds]);

  // Marcar como leídos
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
  }, [activeDmUser, currentUser, activeTab, directMessages]);

  const onlineUsers = users.filter(u => u.isOnline);
  const unreadTotalCount = currentUser ? directMessages.filter(m => m.receiver_id === currentUser.id && !m.read).length : 0;

  const userRoleKey = currentUser?.chat_role || 'miembro';
  const maxDailyPoints = RANK_POINTS_LIMITS[userRoleKey] || 50;
  const currentGiven = currentUser?.dailyPointsGiven || 0;
  const remainingDailyPoints = Math.max(0, maxDailyPoints - currentGiven);

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // FIX COMPLETO PUBLICACIÓN DE PRODUCTO EN MARKETPLACE
  const handlePublishProduct = (e) => {
    e.preventDefault();
    if (!newProdTitle || !newProdPrice || !newProdDescription) return;

    const finalImage = prodImageType === 'url' ? (prodImageUrl.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80') : (prodImagePreview || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80');

    const newProduct = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newProdTitle.trim(),
      description: newProdDescription.trim(),
      price: parseFloat(newProdPrice) || 0,
      category: newProdCategory,
      seller_id: currentUser.id,
      seller_name: currentUser.username,
      seller_color: currentUser.avatar_color,
      image: finalImage,
      rating: 5.0,
      sales: 0,
      createdAt: new Date().toISOString(),
      expiresAt: getFutureDateString(30)
    };

    // 1. Obtener lista fresca de LocalStorage
    const currentFromStorage = JSON.parse(localStorage.getItem('elraizer_products') || '[]');
    const updatedProds = [newProduct, ...currentFromStorage];

    // 2. Guardar en LocalStorage primero
    localStorage.setItem('elraizer_products', JSON.stringify(updatedProds));

    // 3. Actualizar Estado de React
    setProducts(updatedProds);

    // 4. Emitir señal a otras pestañas
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'PRODUCTS_UPDATE' });
    }

    // Resetear filtro a "Todos" para asegurar que el nuevo producto aparezca en pantalla inmediatamente
    setSelectedCategory('Todos');
    setMarketSearchQuery('');

    // Limpiar campos y cerrar modal
    setNewProdTitle('');
    setNewProdPrice('');
    setNewProdDescription('');
    setProdImageUrl('');
    setProdImagePreview('');
    setShowSellModal(false);
  };

  const handleRenewProduct = (productId) => {
    const updatedProds = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          expiresAt: getFutureDateString(30)
        };
      }
      return p;
    });

    setProducts(updatedProds);
    localStorage.setItem('elraizer_products', JSON.stringify(updatedProds));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'PRODUCTS_UPDATE' });
    }
    alert('¡Publicación renovada con éxito por 30 días adicionales!');
  };

  // FIX COMPLETO ENVÍO DE MENSAJES PRIVADOS
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

    // Leer directo de LocalStorage para sincronización atómica
    const currentDmsFromStorage = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
    const updatedDms = [...currentDmsFromStorage, dm];

    localStorage.setItem('elraizer_dms', JSON.stringify(updatedDms));
    setDirectMessages(updatedDms);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'NEW_DM', payload: dm });
    }

    setDmInput('');
  };

  const handleAdminChangePassword = (e) => {
    e.preventDefault();
    if (!selectedAdminUser || !newAdminPassword.trim()) return;

    const updatedUsers = users.map(u => {
      if (u.id === selectedAdminUser.id) {
        return { ...u, password: newAdminPassword.trim() };
      }
      return u;
    });

    setUsers(updatedUsers);
    setSelectedAdminUser({ ...selectedAdminUser, password: newAdminPassword.trim() });
    localStorage.setItem('elraizer_users', JSON.stringify(updatedUsers));

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'USERS_UPDATE' });
    }

    setAdminPasswordSuccess(`¡Contraseña de @${selectedAdminUser.username} actualizada correctamente!`);
    setNewAdminPassword('');
    setTimeout(() => setAdminPasswordSuccess(''), 4000);
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return 30;
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffTime = exp - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const togglePinConversation = (targetUserId, e) => {
    e.stopPropagation();
    if (pinnedUserIds.includes(targetUserId)) {
      setPinnedUserIds(pinnedUserIds.filter(id => id !== targetUserId));
    } else {
      setPinnedUserIds([...pinnedUserIds, targetUserId]);
    }
  };

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

    setPosts(posts.map(p => p.id === pointsModalPost.id ? { ...p, votes: p.votes + pointsNum } : p));

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

    setCurrentUser(prev => ({
      ...prev,
      points: prev.chat_role === 'master' ? prev.points : prev.points - pointsNum,
      dailyPointsGiven: (prev.dailyPointsGiven || 0) + pointsNum
    }));

    setPointsModalPost(null);
    setPointsToGiveInput('');
  };

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

      setDirectMessages(prev => {
        const updated = [...prev, newDm];
        localStorage.setItem('elraizer_dms', JSON.stringify(updated));
        if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'NEW_DM' });
        return updated;
      });
    });

    setCart([]);
    setShowCartModal(false);
    setActiveTab('dm');
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

      const savedDms = localStorage.getItem('elraizer_dms');
      if (savedDms) setDirectMessages(JSON.parse(savedDms));
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

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('elraizer_users', JSON.stringify(updatedUsers));
    if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'USERS_UPDATE' });
  };

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

  const handleClearChatHistory = (targetUserId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('¿Deseas vaciar todo el historial de conversaciones con este usuario?')) {
      const updated = directMessages.filter(dm => 
        !(dm.sender_id === currentUser.id && dm.receiver_id === targetUserId) &&
        !(dm.sender_id === targetUserId && dm.receiver_id === currentUser.id)
      );
      setDirectMessages(updated);
      localStorage.setItem('elraizer_dms', JSON.stringify(updated));
      if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'NEW_DM' });
      if (activeDmUser?.id === targetUserId) setActiveDmUser(null);
    }
  };

  const handleClearAllConversations = () => {
    if (window.confirm('¿Deseas vaciar TODO tu panel de mensajes con TODOS los usuarios?')) {
      const updated = directMessages.filter(dm => dm.sender_id !== currentUser.id && dm.receiver_id !== currentUser.id);
      setDirectMessages(updated);
      localStorage.setItem('elraizer_dms', JSON.stringify(updated));
      if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'NEW_DM' });
      setActiveDmUser(null);
    }
  };

  const handleDeleteSingleDm = (dmId) => {
    const updated = directMessages.filter(dm => dm.id !== dmId);
    setDirectMessages(updated);
    localStorage.setItem('elraizer_dms', JSON.stringify(updated));
    if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'NEW_DM' });
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

      {/* USUARIOS CONECTADOS */}
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
        
        <button onClick={() => setActiveTab('dm')} className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dm' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>
          ✉️ Mensajería Pro
          {unreadTotalCount > 0 && (
            <span className="bg-[#ff5470] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {unreadTotalCount}
            </span>
          )}
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
            <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] bg-clip-text text-transparent flex items-center gap-2">
                  🛒 Marketplace Pro Elraizer
                </h2>
                <p className="text-xs text-[#8b97a8] mt-1">
                  Publicaciones activas durante <strong className="text-white">30 días</strong> con autorenovación. Compra y venta directa.
                </p>
              </div>
              <button 
                onClick={() => setShowSellModal(true)} 
                className="px-5 py-3 bg-gradient-to-r from-[#00d4b1] to-[#10b981] hover:from-[#00b89a] hover:to-[#059669] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xl transition-all"
              >
                <Plus size={18} /> Publicar un Producto
              </button>
            </div>

            {/* BÚSQUEDA Y CATEGORÍAS */}
            <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-[#8b97a8]" />
                <input
                  type="text"
                  value={marketSearchQuery}
                  onChange={(e) => setMarketSearchQuery(e.target.value)}
                  placeholder="Buscar en la tienda (Software, scripts, plantillas, cursos...)"
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

            {/* PRODUCTOS */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-[#161b23] border border-[#2a323d] rounded-2xl p-6">
                <ShoppingBag size={48} className="mx-auto text-[#8b97a8] mb-3 opacity-50" />
                <h3 className="font-bold text-base text-white">No hay productos en esta categoría</h3>
                <p className="text-xs text-[#8b97a8] mt-1">Sé el primero en publicar recursos o herramientas para la comunidad.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(prod => {
                  const daysLeft = getDaysRemaining(prod.expiresAt);
                  const isOwner = currentUser?.id === prod.seller_id;

                  return (
                    <div key={prod.id} className="bg-[#161b23] border border-[#2a323d] rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#7c5cff]/50 transition-all shadow-lg">
                      <div>
                        <div className="h-48 overflow-hidden relative bg-[#1d242e]">
                          <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className="absolute top-3 right-3 bg-[#161b23]/90 backdrop-blur-md text-[#00d4b1] border border-[#00d4b1]/30 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                            {prod.category}
                          </span>

                          <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow backdrop-blur-md ${daysLeft <= 5 ? 'bg-[#ff5470]/90 text-white' : 'bg-[#161b23]/90 text-[#ffb020] border border-[#ffb020]/30'}`}>
                            <Clock size={12} /> Expiración: {daysLeft} días
                          </span>

                          {currentUser.role === 'admin' && (
                            <button onClick={() => setProducts(products.filter(item => item.id !== prod.id))} className="absolute top-3 left-3 bg-[#ff5470] text-white p-1.5 rounded-xl text-xs shadow hover:bg-[#e03e58]">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#8b97a8]">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: prod.seller_color }}>{prod.seller_name[0]}</div>
                              <span className="font-semibold text-white">@{prod.seller_name}</span>
                            </div>
                            <span className="text-[10px] bg-[#1d242e] px-2 py-0.5 rounded border border-[#2a323d]">{prod.sales || 0} Ventas</span>
                          </div>
                          <h3 className="font-bold text-base text-[#e9eef5] line-clamp-1">{prod.title}</h3>
                          <p className="text-xs text-[#8b97a8] line-clamp-2 leading-relaxed">{prod.description}</p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between border-t border-[#2a323d]/50 mt-2">
                        <div>
                          <span className="text-[10px] text-[#8b97a8] block">Precio USD</span>
                          <span className="text-xl font-bold text-[#00d4b1]">${prod.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOwner && (
                            <button onClick={() => handleRenewProduct(prod.id)} title="Renovar publicación por 30 días adicionales" className="px-3 py-2 bg-[#ffb020]/20 hover:bg-[#ffb020]/30 text-[#ffb020] border border-[#ffb020]/40 text-xs font-bold rounded-xl flex items-center gap-1 transition-all">
                              <RefreshCw size={14} /> Renovar 30D
                            </button>
                          )}

                          <button onClick={() => setCart([...cart, { ...prod, qty: 1 }])} className="px-3.5 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all">
                            <ShoppingCart size={14} /> Comprar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

        {/* TAB MENSAJERÍA DIRECTA */}
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
                  const unreadCount = directMessages.filter(m => m.sender_id === u.id && m.receiver_id === currentUser.id && !m.read).length;

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
                            {unreadCount > 0 && <span className="bg-[#00d4b1] text-slate-950 text-[9px] font-bold px-1.5 rounded-full">NUEVO</span>}
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

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {directMessages.filter(dm => {
                      const isBetweenTheseTwo = 
                        (dm.sender_id === currentUser.id && dm.receiver_id === activeDmUser.id) ||
                        (dm.sender_id === activeDmUser.id && dm.receiver_id === currentUser.id);

                      if (!isBetweenTheseTwo) return false;

                      if (dmFolder === 'inbox') return dm.sender_id === activeDmUser.id;
                      if (dmFolder === 'sent') return dm.sender_id === currentUser.id;
                      return true;
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
              <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-[#7c5cff] text-white text-xs font-bold rounded-xl flex items-center gap-2"><Edit3 size={16} /> Editar Perfil</button>
            </div>
            <p className="text-xs text-[#e9eef5] bg-[#1d242e] p-3 rounded-xl border border-[#2a323d]">{currentUser.bio || 'Sin biografía especificada.'}</p>
          </div>
        )}
      </main>

      {/* MODAL PUBLICAR PRODUCTO MARKETPLACE */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#00d4b1]/50 text-[#e9eef5] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSellModal(false)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20} /></button>

            <div className="flex items-center gap-2 text-[#00d4b1] font-bold text-lg border-b border-[#2a323d] pb-3">
              <ShoppingBag size={22} /> Publicar Nuevo Producto en Marketplace
            </div>

            <form onSubmit={handlePublishProduct} className="space-y-4">
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

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#8b97a8]">Imagen del Producto</label>
                <div className="flex border border-[#2a323d] rounded-xl bg-[#1d242e] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setProdImageType('url')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${prodImageType === 'url' ? 'bg-[#00d4b1] text-slate-950' : 'text-[#8b97a8]'}`}
                  >
                    <LinkIcon size={14} /> Por Enlace URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdImageType('file')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${prodImageType === 'file' ? 'bg-[#00d4b1] text-slate-950' : 'text-[#8b97a8]'}`}
                  >
                    <Upload size={14} /> Subir Archivo
                  </button>
                </div>

                {prodImageType === 'url' ? (
                  <input
                    type="url"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1]"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={prodFileInputRef}
                      onChange={handleProductFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => prodFileInputRef.current.click()}
                      className="w-full bg-[#1d242e] border border-dashed border-[#00d4b1] hover:bg-[#2a323d] text-[#00d4b1] p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <ImageIcon size={18} /> Elegir Imagen del Dispositivo
                    </button>
                  </div>
                )}

                {(prodImageUrl || prodImagePreview) && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-[#2a323d]">
                    <img src={prodImageType === 'url' ? prodImageUrl : prodImagePreview} alt="Vista Previa" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Descripción Detallada *</label>
                <textarea
                  required
                  rows="3"
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Detalla qué incluye el producto, requisitos, garantía o soporte..."
                  className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-xs focus:outline-none focus:border-[#00d4b1] resize-none"
                />
              </div>

              <div className="p-3 bg-[#ffb020]/10 border border-[#ffb020]/30 rounded-xl text-xs text-[#ffb020] flex items-center gap-2">
                <Clock size={18} className="shrink-0" />
                <span>Esta publicación estará activa en Marketplace durante <strong>30 días</strong>. Tras su expiración podrás renovarla gratis con un solo clic.</span>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#00d4b1] to-[#10b981] text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg">
                Publicar Ahora en Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

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
                <p className="text-xs text-[#8b97a8]">Gestión de cuentas, recuperación de contraseña, correo y bloqueos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
              <div className="bg-[#1d242e] p-3 rounded-xl border border-[#2a323d] flex flex-col h-full overflow-hidden">
                <h4 className="text-xs font-bold text-[#8b97a8] uppercase mb-2">Usuarios Registrados ({users.length})</h4>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {users.map(u => (
                    <button key={u.id} onClick={() => { setSelectedAdminUser(u); setAdminPasswordSuccess(''); }} className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between ${selectedAdminUser?.id === u.id ? 'bg-[#7c5cff]/20 border-[#7c5cff]' : 'bg-[#161b23] border-[#2a323d]'}`}>
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
                        <p className="text-xs text-[#00d4b1] font-semibold flex items-center gap-1 mt-0.5">
                          <Mail size={13} /> Correo: {selectedAdminUser.email}
                        </p>
                        <p className="text-[10px] text-[#8b97a8] mt-0.5">Registrado: {selectedAdminUser.joinedDate}</p>
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

                    <div className="bg-[#161b23] p-3.5 rounded-xl border border-[#7c5cff]/40 space-y-3">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <KeyRound size={16} className="text-[#ffb020]" /> Cambiar / Restablecer Contraseña de Usuario
                      </h5>
                      
                      <div className="text-[11px] text-[#8b97a8]">
                        Contraseña actual registrada: <strong className="text-white bg-[#1d242e] px-2 py-0.5 rounded border border-[#2a323d]">{selectedAdminUser.password || 'Sin asignar'}</strong>
                      </div>

                      {adminPasswordSuccess && (
                        <div className="p-2 bg-[#00d4b1]/10 border border-[#00d4b1] text-[#00d4b1] rounded-lg text-xs">
                          {adminPasswordSuccess}
                        </div>
                      )}

                      <form onSubmit={handleAdminChangePassword} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Nueva contraseña..."
                          className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7c5cff]"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white font-bold rounded-xl text-xs flex items-center gap-1">
                          <Key size={14} /> Guardar
                        </button>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase text-[#7c5cff]">Publicaciones en el Feed</h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {posts.filter(p => p.author_id === selectedAdminUser.id).map(p => (
                          <div key={p.id} className="bg-[#161b23] p-2.5 rounded-xl border border-[#2a323d] flex items-center justify-between text-xs">
                            <span className="truncate pr-2">{p.text}</span>
                            <button onClick={() => setPosts(posts.filter(item => item.id !== p.id))} className="text-[#ff5470] p-1"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">
                    Selecciona un usuario a la izquierda para ver su correo, cambiar su contraseña o auditar sus datos.
                  </div>
                )}
              </div>
            </div>
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
