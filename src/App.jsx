import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Moon, Sun, ShoppingCart, User, LogOut, MessageSquare,
  Send, Plus, ThumbsUp, Star, Trash2, Pin, VolumeX, Ban, UserCheck, ShieldAlert,
  Search, ExternalLink, Image as ImageIcon, Video, Paperclip, Smile, Check, X, Tag, RefreshCw,
  ShoppingBag, Lock, UserX, AlertTriangle, ChevronRight, Award, MessageCircle, Mail,
  DollarSign, Package, CheckCircle2, Crown, Users, Settings, Activity, Camera,
  Edit3, Globe, Github, Twitter, Linkedin, Briefcase, MapPin, Calendar, Heart, Eye,
  Archive, Inbox, Send as SendIcon, FileText, CheckCheck, UserMinus, ShieldOff, Layers, Filter,
  Wifi, Circle, Award as AwardIcon, Gift, Clock, Key, KeyRound, Upload, Link as LinkIcon, Sparkles, TrendingUp, MessageSquarePlus, MessageCircleReply
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
    text: '¡Sí señor, bienvenidos oficialmente a Elraizer Community! 🚀 Explora el feed, participa en el chat global, comercia en el marketplace y ahora con la nueva función de comentarios en los posts.', 
    tags: ['bienvenida', 'comunidad', 'anuncio'], 
    attachments: [], 
    votes: 42, 
    votedBy: [],
    comments: [
      { id: 'c1', author_id: 'usr_demo1', author_name: 'DevUser', author_color: '#3b82f6', text: '¡Excelente actualización, felicidades Sí señor!', created_at: 'Hace 1 hora' }
    ],
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

  // Estados robustos con persistencia segura en localStorage
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch { return INITIAL_USERS; }
  });

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch { return INITIAL_POSTS; }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_products');
      let loaded = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      const now = new Date();
      return loaded.filter(p => !p.expiresAt || new Date(p.expiresAt) > now);
    } catch { return INITIAL_PRODUCTS; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_chat');
      return saved ? JSON.parse(saved) : [
        { id: 'm1', user_id: 'ext3-id', user_name: 'EXT3', chat_role: 'master', text: 'Chat global activo. Sí señor, mantengamos el respeto.', created_at: '12:00' }
      ];
    } catch { return []; }
  });

  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_dms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [pinnedUserIds, setPinnedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem('elraizer_pinned_dms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('feed');
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [dmSearchQuery, setDmSearchQuery] = useState('');

  // Marketplace Filters
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState('default');

  // Modals & States
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  
  // Admin User Detail Modal State
  const [adminModalUser, setAdminModalUser] = useState(null);
  const [adminEditEmail, setAdminEditEmail] = useState('');
  const [adminEditPassword, setAdminEditPassword] = useState('');
  const [adminEditPoints, setAdminEditPoints] = useState(0);

  // Profile Form State
  const [profileFullName, setProfileFullName] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileGithub, setProfileGithub] = useState('');
  const [profileTwitter, setProfileTwitter] = useState('');

  // Formulario Publicar Producto
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Software & Apps');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [prodImageType, setProdImageType] = useState('url');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImagePreview, setProdImagePreview] = useState('');
  const prodFileInputRef = useRef(null);

  // Inputs Feed/Chat/Comentarios
  const [newPostText, setNewPostText] = useState('');
  const [postAttachments, setPostAttachments] = useState([]);
  const postFileInputRef = useRef(null);
  const postVideoInputRef = useRef(null);

  // Estado para controlar qué post tiene abierto el input de comentarios
  const [commentInputs, setCommentInputs] = useState({});

  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');

  const chatEndRef = useRef(null);
  const dmEndRef = useRef(null);

  // Sync state across tabs safely
  useEffect(() => {
    const syncData = () => {
      try {
        const savedChat = localStorage.getItem('elraizer_chat');
        if (savedChat) setChatMessages(JSON.parse(savedChat));

        const savedDms = localStorage.getItem('elraizer_dms');
        if (savedDms) setDirectMessages(JSON.parse(savedDms));

        const savedUsers = localStorage.getItem('elraizer_users');
        if (savedUsers) setUsers(JSON.parse(savedUsers));

        const savedPosts = localStorage.getItem('elraizer_posts');
        if (savedPosts) setPosts(JSON.parse(savedPosts));

        const savedProds = localStorage.getItem('elraizer_products');
        if (savedProds) {
          const loaded = JSON.parse(savedProds);
          const now = new Date();
          setProducts(loaded.filter(p => !p.expiresAt || new Date(p.expiresAt) > now));
        }
        
        const savedCart = localStorage.getItem('elraizer_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    window.addEventListener('storage', syncData);
    const timer = setInterval(syncData, 1000);

    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(timer);
    };
  }, []);

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
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (activeTab === 'dm' && activeDmUser) {
      dmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeDmUser, activeTab]);

  const updateChat = (newChat) => {
    setChatMessages(newChat);
    localStorage.setItem('elraizer_chat', JSON.stringify(newChat));
  };
  const updateDms = (newDms) => {
    setDirectMessages(newDms);
    localStorage.setItem('elraizer_dms', JSON.stringify(newDms));
  };
  const updateUsersList = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('elraizer_users', JSON.stringify(newUsers));
  };
  const updatePostsList = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('elraizer_posts', JSON.stringify(newPosts));
  };
  const updateProductsList = (newProds) => {
    setProducts(newProds);
    localStorage.setItem('elraizer_products', JSON.stringify(newProds));
  };
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('elraizer_cart', JSON.stringify(newCart));
  };

  const addToCart = (prod) => {
    const existing = cart.find(p => p.id === prod.id);
    if (existing) {
      updateCart(cart.map(p => p.id === prod.id ? { ...p, qty: p.qty + 1 } : p));
    } else {
      updateCart([...cart, { ...prod, qty: 1 }]);
    }
    alert(`Sí señor, agregado al carrito: ${prod.title}`);
  };

  // SOLUCIÓN DEFINITIVA Y PROFESIONAL DE PAGO Y MENSAJE DIRECTO AL VENDEDOR
  const handleSecureCheckout = () => {
    if (!currentUser || cart.length === 0) return;

    const currentDms = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
    let addedDms = [...currentDms];

    // Agrupar productos por vendedor (seller_id)
    const sellerMap = {};
    cart.forEach(item => {
      const sId = item.seller_id || 'ext3-id';
      if (!sellerMap[sId]) {
        sellerMap[sId] = [];
      }
      sellerMap[sId].push(item);
    });

    let firstOtherSellerId = null;

    // Enviar un DM automático a cada vendedor con los detalles exactos de la compra
    Object.keys(sellerMap).forEach(sellerId => {
      if (sellerId === currentUser.id) return; // No enviarse DM a uno mismo

      if (!firstOtherSellerId) {
        firstOtherSellerId = sellerId;
      }

      const itemsListStr = sellerMap[sellerId].map(i => `• ${i.title} (Cant: ${i.qty}) - $${(i.price * i.qty).toFixed(2)} USD`).join('\n');
      const totalSellerPrice = sellerMap[sellerId].reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);

      const dmMessageText = `¡Hola Sí señor! 👋 Acabo de realizar el "Pago Seguro" en el Marketplace de Elraizer Community por tus productos:\n\n${itemsListStr}\n\nTotal a coordinar: $${totalSellerPrice} USD.\nPor favor, confírmame los métodos de pago directos disponibles. ¡Quedo atento!`;

      const newDm = {
        id: 'dm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        sender_id: currentUser.id,
        receiver_id: sellerId,
        text: dmMessageText,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      addedDms.push(newDm);
    });

    // Actualizar DMs y vaciar carrito limpiamente (SIN ALERTAS MOLESTAS DE SIMULACIÓN)
    updateDms(addedDms);
    updateCart([]);
    setShowCartModal(false);

    // Redirección profesional inmediata a mensajería directa con el vendedor
    if (firstOtherSellerId) {
      const targetUser = users.find(u => u.id === firstOtherSellerId);
      if (targetUser) {
        setActiveDmUser(targetUser);
        setActiveTab('dm');
        return;
      }
    }

    // Si compró sus propios productos o no hay otro vendedor
    setActiveTab('dm');
  };

  const unreadTotalCount = currentUser ? directMessages.filter(m => m.receiver_id === currentUser.id && !m.read).length : 0;
  const onlineUsersCount = users.filter(u => u.isOnline).length;

  const handleSendGlobalChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    const newMsg = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      user_id: currentUser.id,
      user_name: currentUser.username,
      chat_role: currentUser.chat_role || 'miembro',
      text: chatInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const currentChat = JSON.parse(localStorage.getItem('elraizer_chat') || '[]');
    updateChat([...currentChat, newMsg]);
    setChatInput('');
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
    const currentDms = JSON.parse(localStorage.getItem('elraizer_dms') || '[]');
    updateDms([...currentDms, dm]);
    setDmInput('');
  };

  // NUEVA FUNCIONALIDAD: Comentar publicaciones del Feed
  const handleAddComment = (postId, e) => {
    if (e) e.preventDefault();
    const commentText = (commentInputs[postId] || '').trim();
    if (!commentText || !currentUser) return;

    const newComment = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      author_id: currentUser.id,
      author_name: currentUser.username,
      author_color: currentUser.avatar_color,
      text: commentText,
      created_at: 'Hace un momento'
    };

    const currentPosts = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
    const updatedPosts = currentPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    });

    updatePostsList(updatedPosts);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleVotePost = (postId) => {
    if (!currentUser) return;
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;
    if (targetPost.author_id === currentUser.id) return alert("Sí señor, no puedes darle like a tu propio post.");

    const currentPosts = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
    const updated = currentPosts.map(p => {
      if (p.id === postId) {
        const votedBy = p.votedBy || [];
        if (votedBy.includes(currentUser.id)) return p;
        return { ...p, votes: (p.votes || 0) + 1, votedBy: [...votedBy, currentUser.id] };
      }
      return p;
    });

    if (!(targetPost.votedBy || []).includes(currentUser.id)) {
      const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
      const updatedUsers = currentUsers.map(u => u.id === targetPost.author_id ? { ...u, points: (u.points || 0) + 1 } : u);
      updateUsersList(updatedUsers);
      if (currentUser.id === targetPost.author_id) {
         setCurrentUser(updatedUsers.find(u => u.id === currentUser.id));
      }
    }
    updatePostsList(updated);
  };

  const handleDonatePoints = (postId, authorId) => {
    if (!currentUser) return;
    if (currentUser.id === authorId) return alert("Sí señor, no puedes donarte puntos a ti mismo.");
    if ((currentUser.points || 0) < 5) return alert("Sí señor, no tienes suficientes puntos. Necesitas al menos 5 pts para donar.");
    
    if (!window.confirm("¿Sí señor, deseas donar 5 puntos de tu saldo a este usuario para premiar su publicación?")) return;

    const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
    const updatedUsers = currentUsers.map(u => {
      if (u.id === currentUser.id) return { ...u, points: u.points - 5 };
      if (u.id === authorId) return { ...u, points: (u.points || 0) + 5 };
      return u;
    });
    
    updateUsersList(updatedUsers);
    setCurrentUser(updatedUsers.find(u => u.id === currentUser.id));
    alert("Sí señor, ¡has donado 5 puntos exitosamente!");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      fullName: profileFullName, headline: profileHeadline, bio: profileBio,
      location: profileLocation, website: profileWebsite, github: profileGithub, twitter: profileTwitter
    };
    const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
    const updatedList = currentUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    updateUsersList(updatedList);
    setCurrentUser(updatedUser);
    alert('Sí señor, perfil actualizado con éxito.');
  };

  const handleAdminUserAction = (userId, newStatus, newRole) => {
    if (currentUser?.role !== 'admin') return;
    const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
    const updatedList = currentUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...(newStatus ? { status: newStatus } : {}),
          ...(newRole ? { chat_role: newRole } : {})
        };
      }
      return u;
    });
    updateUsersList(updatedList);
  };

  const openAdminDetailModal = (u) => {
    setAdminModalUser(u);
    setAdminEditEmail(u.email);
    setAdminEditPassword(u.password || '');
    setAdminEditPoints(u.points || 0);
  };

  const handleSaveAdminDetail = (e) => {
    e.preventDefault();
    const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
    const updatedList = currentUsers.map(u => {
      if (u.id === adminModalUser.id) {
        return {
          ...u,
          email: adminEditEmail,
          password: adminEditPassword,
          points: parseInt(adminEditPoints) || 0
        };
      }
      return u;
    });
    updateUsersList(updatedList);
    setAdminModalUser(null);
    alert('Sí señor, credenciales y puntos del usuario actualizados exitosamente.');
  };

  const handleAdminDeletePost = (postId) => {
    if (!window.confirm("¿Sí señor, deseas eliminar esta publicación del usuario?")) return;
    const currentPosts = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
    updatePostsList(currentPosts.filter(p => p.id !== postId));
  };

  const compressImage = (file, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_DIM = 800; 
      
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.floor(height * (MAX_DIM / width));
          width = MAX_DIM;
        } else {
          width = Math.floor(width * (MAX_DIM / height));
          height = MAX_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, (dataUrl) => {
      setProdImagePreview(dataUrl);
      setProdImageType('upload');
    });
  };

  const executePublishProduct = (e) => {
    if (e) e.preventDefault();
    if (!newProdTitle.trim() || !newProdPrice || !newProdDescription.trim()) {
      alert('Sí señor, por favor completa todos los campos requeridos: Título, Precio y Descripción.');
      return;
    }
    const finalImage = prodImageType === 'url' 
      ? (prodImageUrl.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80') 
      : (prodImagePreview || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80');

    const newProduct = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newProdTitle.trim(), description: newProdDescription.trim(), price: parseFloat(newProdPrice) || 0,
      category: newProdCategory, seller_id: currentUser ? currentUser.id : 'ext3-id',
      seller_name: currentUser ? currentUser.username : 'EXT3', seller_color: currentUser ? currentUser.avatar_color : '#ffb020',
      image: finalImage, rating: 5.0, sales: 0, createdAt: new Date().toISOString(), expiresAt: getFutureDateString(30)
    };
    const currentProds = JSON.parse(localStorage.getItem('elraizer_products') || '[]');
    updateProductsList([newProduct, ...currentProds]);
    setSelectedCategory('Todos'); setMarketSearchQuery(''); setNewProdTitle(''); setNewProdPrice('');
    setNewProdDescription(''); setProdImageUrl(''); setProdImagePreview(''); setShowSellModal(false);
  };

  const handleCreatePost = (e) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() && postAttachments.length === 0) {
      alert('Sí señor, escribe un texto o adjunta una imagen/archivo para publicar.');
      return;
    }
    const newPost = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      author_id: currentUser.id, author_name: currentUser.username, author_color: currentUser.avatar_color,
      author_chat_role: currentUser.chat_role, text: newPostText.trim(), tags: ['comunidad'],
      attachments: postAttachments, votes: 0, votedBy: [], comments: [], created_at: 'Ahora mismo'
    };
    const currentPosts = JSON.parse(localStorage.getItem('elraizer_posts') || '[]');
    updatePostsList([newPost, ...currentPosts]);
    setNewPostText(''); setPostAttachments([]);
  };

  const handlePostFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (fileType === 'image' || file.type.startsWith('image/')) {
        compressImage(file, (dataUrl) => {
          try {
            setPostAttachments(prev => [...prev, { id: 'att_' + Date.now() + Math.random(), name: file.name, type: 'image', url: dataUrl }]);
          } catch (err) {
            alert('Sí señor, la imagen es demasiado pesada.');
          }
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            setPostAttachments(prev => [...prev, { id: 'att_' + Date.now() + Math.random(), name: file.name, type: fileType || 'file', url: reader.result }]);
          } catch(err) {
             alert('Sí señor, archivo muy pesado.');
          }
        };
        reader.readAsDataURL(file);
      }
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
      updateUsersList(updatedList);
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
      id: 'usr_' + Date.now(), email: isEmail ? inputClean : `${inputClean}@elraizer.com`, username: uname, password: password,
      fullName: uname, headline: 'Nuevo Miembro', bio: '¡Sí señor, me he unido a Elraizer Community!', location: 'Colombia',
      website: '', github: '', twitter: '', avatar_url: '', banner_url: '',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      role: 'user', chat_role: 'nuevo', points: 10, dailyPointsGiven: 0, joinedDate: 'Reciente', status: 'active', isOnline: true
    };
    updateUsersList([...users, newUser]);
    setCurrentUser(newUser);
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
  }).sort((a, b) => {
    if (priceSort === 'low_high') return a.price - b.price;
    if (priceSort === 'high_low') return b.price - a.price;
    return 0;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0e1116] text-[#e9eef5] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b23] border border-[#2a323d] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent">Sí señor - Elraizer Community</h1>
            <p className="text-[#8b97a8]">Comunidad, Marketplace con Pago Seguro Directo, Comentarios en Posts y Panel Maestro.</p>
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
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg bg-gradient-to-r from-[#7c5cff] to-[#00d4b1] bg-clip-text text-transparent flex items-center gap-2">
            Sí señor - Elraizer Community
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#10b981]/10 border border-[#10b981]/30 px-3 py-1 rounded-full text-xs text-[#10b981] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>{onlineUsersCount} Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#1d242e] border border-[#7c5cff]/40 px-3 py-1.5 rounded-xl text-xs">
            <AwardIcon size={16} className="text-[#ffb020]" />
            <span className="font-bold text-white">{currentUser.points} Pts</span>
          </div>
          <button onClick={() => setShowCartModal(true)} className="relative p-2 bg-[#1d242e] hover:bg-[#2a323d] text-[#e9eef5] rounded-xl border border-[#2a323d] flex items-center gap-2 text-xs font-semibold">
            <ShoppingCart size={18} className="text-[#00d4b1]" />
            <span className="hidden sm:inline">Carrito</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#7c5cff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-[#1d242e] rounded-xl border border-[#2a323d]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => {
            const currentUsers = JSON.parse(localStorage.getItem('elraizer_users') || '[]');
            updateUsersList(currentUsers.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
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
          ✉️ Mensajería
          {unreadTotalCount > 0 && <span className="bg-[#ff5470] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">{unreadTotalCount}</span>}
        </button>
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[#7c5cff] text-white' : 'text-[#8b97a8] hover:bg-[#1d242e]'}`}>👤 Mi Perfil</button>
        {currentUser.role === 'admin' && (
          <button onClick={() => setActiveTab('master_panel')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'master_panel' ? 'bg-[#ffb020] text-slate-950 font-bold' : 'text-[#ffb020] hover:bg-[#1d242e]'}`}>🛡️ Panel Maestro</button>
        )}
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-3">
              <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="¿Qué quieres compartir hoy con la comunidad, Sí señor?" className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7c5cff] resize-none h-24" />
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
                  <input type="file" accept="image/*" ref={postFileInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'image')} />
                  <button type="button" onClick={() => postFileInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#00d4b1] flex items-center gap-1 text-xs font-semibold"><ImageIcon size={18} /> <span className="hidden sm:inline">Foto</span></button>
                  <input type="file" accept="video/*" ref={postVideoInputRef} className="hidden" onChange={(e) => handlePostFileUpload(e, 'video')} />
                  <button type="button" onClick={() => postVideoInputRef.current.click()} className="p-2 hover:bg-[#1d242e] rounded-lg text-[#7c5cff] flex items-center gap-1 text-xs font-semibold"><Video size={18} /> <span className="hidden sm:inline">Video</span></button>
                </div>
                <button type="button" onClick={handleCreatePost} className="px-5 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">Publicar</button>
              </div>
            </div>

            {posts.map(p => {
              const hasVoted = (p.votedBy || []).includes(currentUser.id);
              const postComments = p.comments || [];
              const commentInputVal = commentInputs[p.id] || '';

              return (
                <div key={p.id} className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: p.author_color }}>{p.author_name[0]}</div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1">@{p.author_name}</div>
                        <div className="text-xs text-[#8b97a8]">{p.created_at}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {p.author_id !== currentUser.id && (
                          <button onClick={() => handleDonatePoints(p.id, p.author_id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ffb020]/40 text-xs font-bold transition-all bg-[#ffb020]/10 text-[#ffb020] hover:bg-[#ffb020]/30">
                            <Gift size={14} /> Dar 5 Pts
                          </button>
                       )}
                       <button onClick={() => handleVotePost(p.id)} disabled={hasVoted || p.author_id === currentUser.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${hasVoted ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-[#7c5cff]' : 'bg-[#1d242e] border-[#2a323d] text-[#8b97a8] hover:text-white hover:border-[#7c5cff]'} disabled:opacity-50`}>
                         <ThumbsUp size={14} className={hasVoted ? 'fill-[#7c5cff]' : ''} /> <span>{p.votes || 0}</span>
                       </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{p.text}</p>
                  {p.attachments && p.attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {p.attachments.map(att => (
                        <div key={att.id} className="bg-[#1d242e] p-2 rounded-xl border border-[#2a323d] overflow-hidden">
                          {att.type === 'image' && <img src={att.url} alt={att.name} className="w-full max-h-60 object-contain rounded-lg bg-black/50" />}
                          {att.type === 'video' && <video src={att.url} controls className="w-full max-h-60 object-contain rounded-lg bg-black/50" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SECCIÓN DE COMENTARIOS EN EL POST */}
                  <div className="border-t border-[#2a323d] pt-3 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8b97a8]">
                      <MessageCircleReply size={14} className="text-[#00d4b1]" />
                      <span>Comentarios ({postComments.length})</span>
                    </div>

                    {postComments.length > 0 && (
                      <div className="space-y-2 bg-[#11151c] p-3 rounded-xl border border-[#2a323d]">
                        {postComments.map(c => (
                          <div key={c.id} className="flex items-start gap-2.5 border-b border-[#2a323d]/40 pb-2 last:border-b-0 last:pb-0">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0" style={{ backgroundColor: c.author_color }}>
                              {c.author_name[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-white">@{c.author_name}</span>
                                <span className="text-[9px] text-[#8b97a8]">{c.created_at}</span>
                              </div>
                              <p className="text-xs text-[#e9eef5] mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => handleAddComment(p.id, e)} className="flex gap-2">
                      <input 
                        type="text" 
                        value={commentInputVal} 
                        onChange={(e) => setCommentInputs({ ...commentInputs, [p.id]: e.target.value })} 
                        placeholder="Escribe un comentario, Sí señor..." 
                        className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7c5cff] text-white" 
                      />
                      <button type="submit" className="px-3 py-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow">
                        <Send size={12} /> Comentar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'marketplace' && (
           <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#2a323d] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] bg-clip-text text-transparent flex items-center gap-2">🛒 Marketplace Pro Elraizer</h2>
              </div>
              <button type="button" onClick={() => setShowSellModal(true)} className="px-5 py-3 bg-gradient-to-r from-[#00d4b1] to-[#10b981] hover:from-[#00b89a] hover:to-[#059669] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xl transition-all cursor-pointer">
                <Plus size={18} /> Publicar Producto
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="bg-[#161b23] border border-[#2a323d] rounded-2xl p-4 flex flex-col space-y-3 hover:border-[#7c5cff]/50 transition-all">
                  <img src={prod.image} className="w-full h-40 object-cover rounded-xl" />
                  <div className="flex-1">
                    <span className="text-[10px] bg-[#7c5cff]/20 text-[#7c5cff] font-bold px-2 py-0.5 rounded-full uppercase">{prod.category}</span>
                    <h3 className="font-bold text-white mt-2">{prod.title}</h3>
                    <p className="text-xs text-[#8b97a8] mt-1 line-clamp-2">{prod.description}</p>
                    <div className="text-[10px] text-[#00d4b1] mt-2">Vendedor: @{prod.seller_name}</div>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#2a323d] pt-3">
                    <span className="text-xl font-bold text-[#00d4b1]">${prod.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(prod)} className="px-3.5 py-1.5 bg-[#7c5cff] hover:bg-[#6b47ff] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"><ShoppingCart size={14}/> Comprar</button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-1 sm:col-span-2 text-center text-[#8b97a8] p-8 bg-[#161b23] border border-[#2a323d] rounded-xl">No hay productos en esta categoría.</div>
              )}
            </div>
           </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-[#161b23] border border-[#2a323d] rounded-xl flex flex-col h-[600px]">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.user_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-[#8b97a8] mb-1 px-1">@{m.user_name}</span>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${m.user_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendGlobalChat} className="p-3 border-t border-[#2a323d] flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff] text-white" placeholder="Escribe un mensaje, Sí señor..." />
              <button type="submit" className="p-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white rounded-xl"><Send size={18}/></button>
            </form>
          </div>
        )}

        {activeTab === 'dm' && (
           <div className="bg-[#161b23] border border-[#2a323d] rounded-xl flex h-[600px] overflow-hidden">
              <div className="w-1/3 border-r border-[#2a323d] flex flex-col bg-[#11151c]">
                 <div className="p-3 border-b border-[#2a323d]">
                    <div className="relative">
                      <input type="text" placeholder="Buscar usuario..." value={dmSearchQuery} onChange={e=>setDmSearchQuery(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#7c5cff] text-white" />
                      <Search size={14} className="absolute left-2.5 top-2.5 text-[#8b97a8]" />
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto">
                    {filteredUsersForDm.map(u => {
                       const unread = directMessages.filter(m => m.sender_id === u.id && m.receiver_id === currentUser.id && !m.read).length;
                       return (
                         <button key={u.id} onClick={() => {
                            setActiveDmUser(u);
                            const updatedDms = directMessages.map(m => (m.sender_id === u.id && m.receiver_id === currentUser.id) ? { ...m, read: true } : m);
                            updateDms(updatedDms);
                         }} className={`w-full text-left p-3 flex items-center gap-3 border-b border-[#2a323d]/50 transition-colors ${activeDmUser?.id === u.id ? 'bg-[#1d242e] border-l-2 border-l-[#7c5cff]' : 'hover:bg-[#1d242e]'}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white relative shrink-0" style={{ backgroundColor: u.avatar_color }}>
                              {u.username[0]}
                              {u.isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#10b981] rounded-full border border-[#11151c]" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <div className="font-bold text-xs text-white truncate">@{u.username}</div>
                               <div className="text-[10px] text-[#8b97a8] truncate">{u.headline || 'Miembro'}</div>
                            </div>
                            {unread > 0 && <span className="bg-[#ff5470] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{unread}</span>}
                         </button>
                       );
                    })}
                    {filteredUsersForDm.length === 0 && <div className="p-4 text-center text-xs text-[#8b97a8]">No se encontraron usuarios.</div>}
                 </div>
              </div>

              <div className="flex-1 flex flex-col bg-[#161b23]">
                 {activeDmUser ? (
                    <>
                       <div className="p-3 border-b border-[#2a323d] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeDmUser.avatar_color }}>{activeDmUser.username[0]}</div>
                          <div>
                            <div className="font-bold text-sm text-white">Chat con @{activeDmUser.username}</div>
                            <div className="text-[10px] text-[#8b97a8]">{activeDmUser.isOnline ? 'En línea' : 'Desconectado'}</div>
                          </div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {directMessages.filter(m => (m.sender_id === currentUser.id && m.receiver_id === activeDmUser.id) || (m.sender_id === activeDmUser.id && m.receiver_id === currentUser.id)).map(m => (
                             <div key={m.id} className={`flex flex-col ${m.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                               <div className={`p-2.5 rounded-xl max-w-xs text-sm ${m.sender_id === currentUser.id ? 'bg-[#7c5cff] text-white rounded-br-none' : 'bg-[#1d242e] text-[#e9eef5] rounded-bl-none'}`}>{m.text}</div>
                               <span className="text-[9px] text-[#8b97a8] mt-1 mx-1">{m.created_at}</span>
                             </div>
                          ))}
                          <div ref={dmEndRef} />
                       </div>
                       <form onSubmit={handleSendDm} className="p-3 border-t border-[#2a323d] flex gap-2">
                          <input type="text" value={dmInput} onChange={e=>setDmInput(e.target.value)} placeholder="Escribe un mensaje privado, Sí señor..." className="flex-1 bg-[#1d242e] border border-[#2a323d] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7c5cff] text-white" />
                          <button type="submit" className="p-2 bg-[#7c5cff] hover:bg-[#6b47ff] text-white rounded-xl"><Send size={18}/></button>
                       </form>
                    </>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#8b97a8]">
                       <MessageCircle size={48} className="mb-4 opacity-50" />
                       <p>Selecciona un usuario a la izquierda para iniciar tu chat directo.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-[#161b23] p-6 rounded-2xl border border-[#2a323d]">
             <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#2a323d] pb-3">Mi Perfil</h2>
             <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Nombre Completo</label>
                     <input type="text" value={profileFullName} onChange={e=>setProfileFullName(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#7c5cff] text-white" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Titular (Headline)</label>
                     <input type="text" value={profileHeadline} onChange={e=>setProfileHeadline(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#7c5cff] text-white" />
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Biografía</label>
                     <textarea value={profileBio} onChange={e=>setProfileBio(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#7c5cff] text-white h-20 resize-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Ubicación</label>
                     <input type="text" value={profileLocation} onChange={e=>setProfileLocation(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#7c5cff] text-white" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Sitio Web</label>
                     <input type="text" value={profileWebsite} onChange={e=>setProfileWebsite(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#7c5cff] text-white" />
                   </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[#2a323d]">
                   <button type="submit" className="px-5 py-2.5 bg-[#7c5cff] hover:bg-[#6b47ff] text-white font-bold rounded-xl transition-all">Guardar Cambios</button>
                </div>
             </form>
          </div>
        )}

        {activeTab === 'master_panel' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-[#161b23] border border-[#ffb020]/40 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-[#ffb020] flex items-center gap-2">🛡️ Panel Maestro Extendido</h2>
              <p className="text-xs text-[#8b97a8] mt-1">Supervisión, edición de credenciales (correo/password), puntajes y moderación de posts por usuario.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl">
                <span className="text-xs text-[#8b97a8] block">Total Miembros</span>
                <span className="text-2xl font-extrabold text-white">{users.length}</span>
              </div>
              <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl">
                <span className="text-xs text-[#8b97a8] block">Usuarios Online</span>
                <span className="text-2xl font-extrabold text-[#10b981]">{onlineUsersCount}</span>
              </div>
              <div className="bg-[#161b23] border border-[#2a323d] p-4 rounded-xl">
                <span className="text-xs text-[#8b97a8] block">Total Publicaciones</span>
                <span className="text-2xl font-extrabold text-[#7c5cff]">{posts.length}</span>
              </div>
            </div>

            <div className="bg-[#161b23] border border-[#2a323d] rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-sm text-white border-b border-[#2a323d] pb-2">Gestión de Cuentas ({users.length})</h3>
              
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="bg-[#1d242e] p-4 rounded-xl border border-[#2a323d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white relative" style={{ backgroundColor: u.avatar_color }}>
                        {u.username[0]}
                        {u.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#161b23] rounded-full" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          @{u.username}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : u.status === 'suspended' ? 'bg-[#ffb020]/20 text-[#ffb020]' : 'bg-[#ff5470]/20 text-[#ff5470]'}`}>
                            {u.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b97a8]">{u.email} · Rol: <span className="text-[#00d4b1] font-semibold">{u.chat_role}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => openAdminDetailModal(u)} className="px-3 py-1.5 bg-[#7c5cff]/20 text-[#7c5cff] border border-[#7c5cff]/40 rounded-lg font-bold hover:bg-[#7c5cff]/30">
                        <Edit3 size={14} className="inline mr-1"/> Detalles / Posts
                      </button>

                      {u.id !== currentUser.id && (
                        <>
                          {u.status === 'active' ? (
                            <button onClick={() => handleAdminUserAction(u.id, 'suspended')} className="px-3 py-1.5 bg-[#ffb020]/20 text-[#ffb020] border border-[#ffb020]/40 rounded-lg font-semibold hover:bg-[#ffb020]/30">Suspender</button>
                          ) : (
                            <button onClick={() => handleAdminUserAction(u.id, 'active')} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 rounded-lg font-semibold hover:bg-[#10b981]/30">Reactivar</button>
                          )}
                          <select
                            value={u.chat_role}
                            onChange={(e) => handleAdminUserAction(u.id, null, e.target.value)}
                            className="bg-[#161b23] border border-[#2a323d] rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="nuevo">Nuevo</option>
                            <option value="miembro">Miembro</option>
                            <option value="veterano">Veterano</option>
                            <option value="moderador">Moderador</option>
                            <option value="master">Master</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {adminModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b23] border border-[#ffb020]/50 text-[#e9eef5] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button type="button" onClick={() => setAdminModalUser(null)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20} /></button>
            <div className="flex items-center gap-3 border-b border-[#2a323d] pb-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: adminModalUser.avatar_color }}>
                {adminModalUser.username[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">@{adminModalUser.username}</h3>
                <span className="text-xs text-[#8b97a8]">Gestión Avanzada de Cuenta</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <form onSubmit={handleSaveAdminDetail} className="space-y-4 bg-[#1d242e] border border-[#2a323d] p-4 rounded-xl">
                <h4 className="font-bold text-sm text-[#00d4b1] mb-2 flex items-center gap-1"><ShieldAlert size={16}/> Credenciales y Puntos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Correo Electrónico</label>
                    <input type="text" value={adminEditEmail} onChange={(e) => setAdminEditEmail(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#ffb020] text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Nueva Contraseña</label>
                    <input type="text" value={adminEditPassword} onChange={(e) => setAdminEditPassword(e.target.value)} placeholder="Dejar igual si no cambia" className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#ffb020] text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Otorgar Puntos</label>
                    <input type="number" value={adminEditPoints} onChange={(e) => setAdminEditPoints(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#ffb020] text-white" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-[#ffb020] text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-[#e09b19]">Guardar Cambios</button>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2"><MessageSquare size={16} className="text-[#7c5cff]" /> Publicaciones de este usuario</h4>
                {posts.filter(p => p.author_id === adminModalUser.id).length === 0 ? (
                  <p className="text-xs text-[#8b97a8] bg-[#1d242e] p-4 rounded-xl text-center border border-[#2a323d]">El usuario no tiene publicaciones.</p>
                ) : (
                  <div className="space-y-3">
                    {posts.filter(p => p.author_id === adminModalUser.id).map(p => (
                      <div key={p.id} className="bg-[#1d242e] border border-[#2a323d] p-3 rounded-xl flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-[#8b97a8]">{p.created_at}</span>
                          <button onClick={() => handleAdminDeletePost(p.id)} className="text-[#ff5470] hover:bg-[#ff5470]/20 p-1 rounded-lg flex items-center gap-1 text-[10px] font-bold"><Trash2 size={12}/> Eliminar</button>
                        </div>
                        <p className="text-xs text-white line-clamp-3">{p.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#161b23] border border-[#2a323d] w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
              <button onClick={()=>setShowCartModal(false)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart className="text-[#00d4b1]"/> Carrito de Compras</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                 {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-[#1d242e] border border-[#2a323d] p-3 rounded-xl">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-white">{item.title}</span>
                         <span className="text-xs text-[#00d4b1]">${item.price.toFixed(2)} x {item.qty}</span>
                       </div>
                       <button onClick={()=>updateCart(cart.filter(c => c.id !== item.id))} className="text-[#ff5470] p-1.5 hover:bg-[#ff5470]/20 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                 ))}
                 {cart.length === 0 && <p className="text-sm text-[#8b97a8] text-center p-4 bg-[#1d242e] rounded-xl border border-[#2a323d]">Tu carrito está vacío.</p>}
              </div>
              <div className="border-t border-[#2a323d] pt-4 flex justify-between items-center mb-4">
                 <span className="font-bold text-white">Total a Pagar:</span>
                 <span className="text-2xl font-bold text-[#00d4b1]">${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</span>
              </div>
              <button onClick={handleSecureCheckout} className="w-full bg-gradient-to-r from-[#00d4b1] to-[#10b981] py-3 rounded-xl text-slate-950 font-bold shadow-lg hover:brightness-110 disabled:opacity-50" disabled={cart.length === 0}>
                Proceder al Pago Seguro (Contactar Vendedor)
              </button>
           </div>
        </div>
      )}

      {showSellModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#161b23] border border-[#2a323d] w-full max-w-lg rounded-2xl p-6 relative my-8 shadow-2xl">
              <button onClick={() => setShowSellModal(false)} className="absolute top-4 right-4 text-[#8b97a8] hover:text-white"><X size={20} /></button>
              <h2 className="text-xl font-bold text-white mb-6 border-b border-[#2a323d] pb-3">Publicar Nuevo Producto</h2>
              <form onSubmit={executePublishProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Título del Producto/Servicio *</label>
                  <input type="text" required value={newProdTitle} onChange={(e) => setNewProdTitle(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#00d4b1] text-white" placeholder="Ej: Script automatizador web" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Categoría *</label>
                    <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#00d4b1] text-white">
                      {MARKETPLACE_CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Precio (USD) *</label>
                    <input type="number" step="0.01" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#00d4b1] text-white" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8b97a8] mb-1">Descripción *</label>
                  <textarea required value={newProdDescription} onChange={(e) => setNewProdDescription(e.target.value)} className="w-full bg-[#1d242e] border border-[#2a323d] rounded-xl p-3 text-sm focus:outline-none focus:border-[#00d4b1] text-white h-24 resize-none" placeholder="Detalles de lo que ofreces..."></textarea>
                </div>
                
                <div className="border border-[#2a323d] rounded-xl p-3 bg-[#1d242e]">
                  <label className="block text-xs font-semibold text-[#8b97a8] mb-2">Imagen del Producto</label>
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setProdImageType('url')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${prodImageType === 'url' ? 'bg-[#00d4b1] text-slate-950' : 'bg-[#161b23] text-[#8b97a8]'}`}>Usar URL</button>
                    <button type="button" onClick={() => setProdImageType('upload')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${prodImageType === 'upload' ? 'bg-[#00d4b1] text-slate-950' : 'bg-[#161b23] text-[#8b97a8]'}`}>Subir Archivo</button>
                  </div>
                  
                  {prodImageType === 'url' ? (
                     <input type="url" value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} className="w-full bg-[#161b23] border border-[#2a323d] rounded-xl p-2 text-xs focus:outline-none text-white" placeholder="https://ejemplo.com/imagen.jpg" />
                  ) : (
                     <div className="flex items-center gap-2">
                       <input type="file" accept="image/*" ref={prodFileInputRef} className="hidden" onChange={handleProductImageUpload} />
                       <button type="button" onClick={() => prodFileInputRef.current.click()} className="px-4 py-2 bg-[#161b23] border border-[#2a323d] rounded-xl text-xs text-[#00d4b1] font-bold">Seleccionar Imagen Local</button>
                       {prodImagePreview && <img src={prodImagePreview} className="w-10 h-10 object-cover rounded-lg" />}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#00d4b1] to-[#10b981] hover:brightness-110 text-slate-950 font-extrabold rounded-xl shadow-lg mt-4">
                  Publicar en Marketplace
                </button>
              </form>
            </div>
         </div>
      )}

    </div>
  );
}
