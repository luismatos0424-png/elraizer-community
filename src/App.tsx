import { useEffect, useState, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'

type Profile = {
  id: string
  username: string
  bio?: string
  avatar_color: string
  role: 'user' | 'admin'
  chat_role: 'nuevo' | 'moderador' | 'maestro' | 'master'
  points: number
  email?: string
  created_at: string
  banned?: boolean
  muted?: boolean
}

type Post = {
  id: string
  author_id: string
  text: string
  tags: string[]
  media: any[]
  likes: string[]
  created_at: string
  author?: Profile
}

type Product = {
  id: string
  seller_id: string
  title: string
  price: number
  category: string
  description: string
  images: any[]
  location?: string
  created_at: string
  expires_at: string
  seller?: Profile
}

type CartItem = { product: Product; qty: number }
type ChatMsg = { id: string; user_id: string; text: string; created_at: string; user?: Profile }
type DirectMsg = { id: string; from: string; to: string; text: string; created_at: string; fromUser?: Profile; toUser?: Profile }
type Comment = { id: string; post_id: string; user_id: string; text: string; created_at: string }

const MASTER_USER = 'EXT3'
const CATEGORIES = ['Diseño','Desarrollo','Electrónica','Ropa','Servicios','Hogar','Otros']
const COLORS = ['#7c5cff','#00d4b1','#ffb020','#ff5470','#22c55e','#3b82f6','#ec4899','#f59e0b']

export default function App(){
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const [currentAuth,setCurrentAuth]=useState<any>(null)
  const [profile,setProfile]=useState<Profile|null>(null)
  const [tab,setTab]=useState('inicio')
  const [posts,setPosts]=useState<Post[]>([])
  const [products,setProducts]=useState<Product[]>([])
  const [cart,setCart]=useState<CartItem[]>([])
  const [chatMsgs,setChatMsgs]=useState<ChatMsg[]>([])
  const [directMsgs,setDirectMsgs]=useState<DirectMsg[]>([])
  const [comments,setComments]=useState<Comment[]>([])
  const [profiles,setProfiles]=useState<Profile[]>([])
  const [newPost,setNewPost]=useState('')
  const [newChat,setNewChat]=useState('')
  const [newDirect,setNewDirect]=useState('')
  const [selectedChatUser,setSelectedChatUser]=useState<Profile|null>(null)
  const [search,setSearch]=useState('')
  const [showMaster,setShowMaster]=useState(false)
  const [logoClicks,setLogoClicks]=useState(0)
  const [authMode,setAuthMode]=useState<'login'|'register'>('login')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [onboarding,setOnboarding]=useState(false)
  const [obUsername,setObUsername]=useState('')
  const [obColor,setObColor]=useState('#7c5cff')
  const [obBio,setObBio]=useState('')
  const [attachments,setAttachments]=useState<any[]>([])
  const [prodModal,setProdModal]=useState(false)
  const [prodForm,setProdForm]=useState({title:'',price:'',category:'Otros',description:'',location:'',images:[] as any[]})
  const [dragOver,setDragOver]=useState(false)
  const [selectedCategory,setSelectedCategory]=useState('Todos')
  const [editUserModal,setEditUserModal]=useState<Profile|null>(null)
  const [editEmail,setEditEmail]=useState('')
  const [editPass,setEditPass]=useState('')
  const fileInputRef=useRef<HTMLInputElement>(null)
  const prodFileRef=useRef<HTMLInputElement>(null)
  const chatEndRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark') },[theme])

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='a' && profile?.chat_role==='master') setShowMaster(true) }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[profile])

  useEffect(()=>{
    if(!isSupabaseConfigured){
      const savedAuth=localStorage.getItem('elraizer_auth')
      if(savedAuth){
        setCurrentAuth(JSON.parse(savedAuth))
        const savedProf=JSON.parse(localStorage.getItem('elraizer_profile')||'null')
        setProfile(savedProf)
        setPosts(JSON.parse(localStorage.getItem('elraizer_posts')||'[]'))
        setProducts(JSON.parse(localStorage.getItem('elraizer_products')||'[]'))
        setCart(JSON.parse(localStorage.getItem('elraizer_cart')||'[]'))
        setChatMsgs(JSON.parse(localStorage.getItem('elraizer_chat')||'[]'))
        setDirectMsgs(JSON.parse(localStorage.getItem('elraizer_direct')||'[]'))
        setProfiles(savedProf?[savedProf]:[])
      }
      return
    }
    supabase.auth.getSession().then(({data})=>setCurrentAuth(data.session))
    const {data:listener}=supabase.auth.onAuthStateChange(async (_event, newAuth)=>{
      setCurrentAuth(newAuth)
      if(newAuth?.user){
        const {data:existing}=await supabase.from('profiles').select('*').eq('id', newAuth.user.id).single()
        if(!existing){
          const isMaster=newAuth.user.email?.toLowerCase()==='ext3@elraizer.com'
          const username=isMaster?MASTER_USER:(newAuth.user.email?.split('@')[0]||'Usuario')
          const {data:newProf}=await supabase.from('profiles').insert({
            id:newAuth.user.id, username, avatar_color:isMaster?'#ffb020':'#7c5cff',
            role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo',
            bio:isMaster?'Fundador Spa Global':'', points:isMaster?999:0
          }).select().single()
          if(newProf) setProfile(newProf as any)
        }else setProfile(existing as any)
      }
    })
    return ()=>listener.subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!isSupabaseConfigured || !currentAuth) return
    const load=async()=>{
      const {data:postsData}=await supabase.from('posts').select('*, profiles:author_id(*)').order('created_at',{ascending:false}).limit(100)
      if(postsData) setPosts(postsData.map((p:any)=>({...p, author:p.profiles})) as any)
      const {data:prodData}=await supabase.from('products').select('*, profiles:seller_id(*)').gt('expires_at', new Date().toISOString()).order('created_at',{ascending:false})
      if(prodData) setProducts(prodData.map((p:any)=>({...p, seller:p.profiles})) as any)
      const {data:chatData}=await supabase.from('chat_messages').select('*, profiles:user_id(*)').order('created_at',{ascending:true}).limit(200)
      if(chatData) setChatMsgs(chatData.map((c:any)=>({...c, user:c.profiles})) as any)
      const {data:profData}=await supabase.from('profiles').select('*').order('points',{ascending:false})
      if(profData) setProfiles(profData as any)
    }
    load()
  },[currentAuth])

  useEffect(()=>{
    const check=()=>{
      const now=new Date()
      setProducts(prev=>{
        const filtered=prev.filter(p=>new Date(p.expires_at)>now)
        if(filtered.length!==prev.length && !isSupabaseConfigured) localStorage.setItem('elraizer_products', JSON.stringify(filtered))
        return filtered
      })
    }
    check()
    const id=setInterval(check,60000)
    return ()=>clearInterval(id)
  },[])

  useEffect(()=>{
    if(!isSupabaseConfigured){
      localStorage.setItem('elraizer_posts', JSON.stringify(posts))
      localStorage.setItem('elraizer_products', JSON.stringify(products))
      localStorage.setItem('elraizer_cart', JSON.stringify(cart))
      localStorage.setItem('elraizer_chat', JSON.stringify(chatMsgs))
      localStorage.setItem('elraizer_direct', JSON.stringify(directMsgs))
    }
  },[posts,products,cart,chatMsgs,directMsgs])

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}) },[chatMsgs,directMsgs])

  const handleLogo=()=>{
    const c=logoClicks+1
    setLogoClicks(c)
    if(c>=5 && profile?.chat_role==='master'){ setShowMaster(true); setLogoClicks(0) }
    setTimeout(()=>setLogoClicks(0),2000)
  }

  const handleAuth=async()=>{
    if(!isSupabaseConfigured){
      if(authMode==='register'){
        if(!onboarding){ setOnboarding(true); return }
        if(obUsername.length<3){ alert('Username min 3'); return }
        const id='local_'+Date.now()
        const isMaster=email.toLowerCase()==='ext3@elraizer.com'
        const prof:Profile={
          id, username:isMaster?MASTER_USER:obUsername, avatar_color:isMaster?'#ffb020':obColor,
          role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo',
          bio:isMaster?'Fundador Spa Global':obBio, points:isMaster?999:0,
          created_at:new Date().toISOString(), email
        }
        localStorage.setItem('elraizer_auth', JSON.stringify({user:{id,email}}))
        localStorage.setItem('elraizer_profile', JSON.stringify(prof))
        setCurrentAuth({user:{id,email}}); setProfile(prof); setProfiles([prof]); setOnboarding(false)
      }else{
        if(email.toLowerCase()==='ext3@elraizer.com' && pass==='Elraizer5374e*'){
          const prof:Profile={
            id:'master_ext3', username:'EXT3', avatar_color:'#ffb020',
            role:'admin', chat_role:'master', bio:'Fundador Spa Global - Ghost',
            points:999, created_at:new Date().toISOString(), email
          }
          localStorage.setItem('elraizer_auth', JSON.stringify({user:{id:prof.id,email}}))
          localStorage.setItem('elraizer_profile', JSON.stringify(prof))
          setCurrentAuth({user:{id:prof.id,email}}); setProfile(prof); setProfiles([prof]); return
        }
        const saved=JSON.parse(localStorage.getItem('elraizer_profile')||'null')
        if(saved){ setCurrentAuth({user:{id:saved.id,email}}); setProfile(saved) }else alert('Registrate primero')
      }
      return
    }
    if(authMode==='register'){
      if(!onboarding){ setOnboarding(true); return }
      const {data,error}=await supabase.auth.signUp({email, password:pass})
      if(error){ alert(error.message); return }
      if(data.user){
        const isMaster=email.toLowerCase()==='ext3@elraizer.com'
        await supabase.from('profiles').insert({
          id:data.user.id, username:isMaster?MASTER_USER:obUsername,
          avatar_color:isMaster?'#ffb020':obColor, bio:obBio,
          role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo', points:isMaster?999:0
        })
        setOnboarding(false); alert('Cuenta creada')
      }
    }else{
      const {error}=await supabase.auth.signInWithPassword({email, password:pass})
      if(error) alert(error.message)
    }
  }

  const handleLogout=async()=>{
    if(isSupabaseConfigured) await supabase.auth.signOut()
    else localStorage.clear()
    setCurrentAuth(null); setProfile(null)
  }

  const handlePublish=async()=>{
    if(!newPost.trim()&&attachments.length===0) return
    const post:Post={
      id:'p_'+Date.now(), author_id:profile?.id||'', text:newPost,
      tags:newPost.match(/#\w+/g)||[], media:attachments, likes:[],
      created_at:new Date().toISOString(), author:profile||undefined
    }
    if(!isSupabaseConfigured) setPosts([post,...posts])
    else{
      const {data,error}=await supabase.from('posts').insert({author_id:profile?.id, text:newPost, tags:post.tags, media:attachments}).select().single()
      if(error) alert(error.message); else setPosts([{...data, author:profile} as any, ...posts])
    }
    setNewPost(''); setAttachments([])
  }

  const handleChatSend=async()=>{
    if(!newChat.trim()) return
    if(profile?.banned){ alert('Baneado'); return }
    if(profile?.muted){ alert('Muteado'); return }
    const msg:ChatMsg={id:'c_'+Date.now(), user_id:profile?.id||'', text:newChat, created_at:new Date().toISOString(), user:profile||undefined}
    if(!isSupabaseConfigured) setChatMsgs([...chatMsgs, msg])
    else{
      const {data,error}=await supabase.from('chat_messages').insert({user_id:profile?.id, text:newChat}).select().single()
      if(error) alert(error.message); else setChatMsgs([...chatMsgs, {...data, user:profile} as any])
    }
    setNewChat('')
    if(profile && !isSupabaseConfigured){ const upd={...profile, points:profile.points+1}; setProfile(upd); localStorage.setItem('elraizer_profile', JSON.stringify(upd)) }
  }

  const handleDirectSend=async()=>{
    if(!newDirect.trim()||!selectedChatUser) return
    const msg:DirectMsg={id:'d_'+Date.now(), from:profile?.id||'', to:selectedChatUser.id, text:newDirect, created_at:new Date().toISOString(), fromUser:profile||undefined, toUser:selectedChatUser}
    setDirectMsgs([...directMsgs, msg]); setNewDirect('')
  }

  const handleFileUpload=(files: FileList | null, isProduct=false)=>{
    if(!files) return
    const arr=Array.from(files)
    if(arr.length>5){ alert('Max 5 fotos'); return }
    arr.forEach((f:any)=>{
      if(f.size>10*1024*1024){ alert(f.name+' supera 10MB'); return }
      const url=URL.createObjectURL(f)
      if(isProduct) setProdForm(prev=>({...prev, images:[...prev.images,{name:f.name, url, size:f.size}]}))
      else setAttachments(a=>[...a,{name:f.name, url, size:f.size}])
    })
  }

  const handlePublishProduct=async()=>{
    if(!prodForm.title.trim()||!prodForm.price) return alert('Titulo y precio requeridos')
    const now=new Date(); const expires=new Date(now.getTime()+30*24*60*60*1000)
    const prod:Product={
      id:'prod_'+Date.now(), seller_id:profile?.id||'', title:prodForm.title,
      price:parseFloat(prodForm.price), category:prodForm.category,
      description:prodForm.description, images:prodForm.images,
      location:prodForm.location, created_at:now.toISOString(),
      expires_at:expires.toISOString(), seller:profile||undefined
    }
    if(!isSupabaseConfigured) setProducts([prod,...products])
    else{
      const {data,error}=await supabase.from('products').insert({
        seller_id:profile?.id, title:prodForm.title, price:prod.price,
        category:prodForm.category, description:prodForm.description,
        images:prodForm.images, location:prodForm.location, expires_at:expires.toISOString()
      }).select().single()
      if(error) alert(error.message); else setProducts([{...data, seller:profile} as any, ...products])
    }
    setProdModal(false); setProdForm({title:'',price:'',category:'Otros',description:'',location:'',images:[]})
  }

  const handleCheckout=()=>{
    if(cart.length===0) return
    const buyer=profile?.username||'Comprador'
    cart.forEach(item=>{
      const msg:DirectMsg={
        id:'d_'+Date.now()+Math.random(), from:profile?.id||'', to:item.product.seller_id,
        text:'Hola '+item.product.seller?.username+', soy '+buyer+' ('+profile?.email+'). Quiero comprar '+item.product.title+' x'+item.qty+' por '+item.product.price+' COP. Contactame para coordinar pago directo. Ubicacion: '+item.product.location,
        created_at:new Date().toISOString(), fromUser:profile||undefined, toUser:item.product.seller
      }
      setDirectMsgs(prev=>[msg,...prev])
    })
    alert('Pedido enviado al vendedor - revisa Mensajes para coordinar pago directo')
    setCart([]); setTab('mensajes')
  }

  const daysLeft=(exp:string)=>Math.max(0, Math.ceil((new Date(exp).getTime()-Date.now())/(1000*60*60*24)))
  const filteredPosts=posts.filter(p=>!search||p.text.toLowerCase().includes(search.toLowerCase()))
  const filteredProducts=products.filter(p=>{
    const matchSearch=!search||p.title.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat=selectedCategory==='Todos'||p.category===selectedCategory
    return matchSearch && matchCat
  })

  if(!currentAuth){
    return (
      <div className="min-h-screen flex bg-[#0e1116] text-[#e9eef5]">
        <div className="flex-1 hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-[#161b23] via-[#1a1f2e] to-[#0e1116] border-r border-[#2a323d] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c5cff]/10 to-[#a78bfa]/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] flex items-center justify-center font-black text-xl">◈</div>
              <div><h1 className="text-3xl font-black">Elraizer</h1><p className="text-sm text-[#8b97a8]">Spa Global Community</p></div>
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">Comunidad premium<br/>global completa</h2>
            <p className="text-[#8b97a8] mb-8 max-w-md">Chat global, mensajería directa, feed, marketplace 30d, rangos, puntos, panel maestro ghost total.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">💬</p><p className="text-sm font-bold">Chat Global</p><p className="text-xs text-[#8b97a8]">Tiempo real + moderado</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">✉️</p><p className="text-sm font-bold">Mensajería</p><p className="text-xs text-[#8b97a8]">Directa + checkout auto</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">🛒</p><p className="text-sm font-bold">Marketplace PRO</p><p className="text-xs text-[#8b97a8]">30d + Por vencer + Renovar</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">👑</p><p className="text-sm font-bold">Panel Master Ghost</p><p className="text-xs text-[#8b97a8]">Control total invisible</p></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0e1116]">
          <div className="w-full max-w-[420px] bg-[#161b23] border border-[#2a323d] rounded-[24px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Bienvenido</h2>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d]">🌓</button>
            </div>
            <p className="text-sm text-[#8b97a8] mb-6">Acceso sin Google - ELRAIZER SPA GLOBAL</p>
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-[#0e1116] border border-[#2a323d]">
              <button onClick={()=>setAuthMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${authMode==='login'?'bg-[#7c5cff] text-white':'text-[#8b97a8]'}`}>Login</button>
              <button onClick={()=>setAuthMode('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${authMode==='register'?'bg-[#7c5cff] text-white':'text-[#8b97a8]'}`}>Registro</button>
            </div>
            {!onboarding ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full mb-3 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full mb-6 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black shadow-lg">Entrar a Elraizer Global</button>
                <p className="text-[11px] text-[#8b97a8] mt-4 text-center">Master ghost: Ext3@elraizer.com / Elraizer5374e* - sin rastro público</p>
              </>
            ):(
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Crea tu perfil global</h3>
                <input value={obUsername} onChange={e=>setObUsername(e.target.value)} placeholder="Username min 3" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <div className="flex gap-2 flex-wrap">{COLORS.map(c=><button key={c} onClick={()=>setObColor(c)} className="w-9 h-9 rounded-full border-2" style={{background:c, borderColor:obColor===c?'white':'transparent'}} />)}</div>
                <input value={obBio} onChange={e=>setObBio(e.target.value)} placeholder="Bio" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Crear cuenta global</button>
                <button onClick={()=>setOnboarding(false)} className="w-full text-xs text-[#8b97a8]">Volver</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e1116] text-[#e9eef5]">
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b bg-[#161b23]/90" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1300px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLogo} className="flex items-center gap-2.5 font-black text-[18px]">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] flex items-center justify-center">◈</span>
              <span className="hidden md:inline">Elraizer Spa Global</span>
              <span className="md:hidden">Elraizer</span>
            </button>
            {profile?.chat_role==='master' && <span className="opacity-0 hover:opacity-100 transition cursor-pointer text-[#ffb020] text-lg ml-1" onClick={()=>setShowMaster(true)}>👑</span>}
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar posts, productos, usuarios..." className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#1d242e] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <span className="absolute left-3 top-2.5 text-[#8b97a8]">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d]">🌓</button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
            <div className="hidden md:block text-right mr-2">
              <p className="text-xs font-bold leading-none">{profile?.username}</p>
              <p className="text-[10px] text-[#8b97a8]">{profile?.points} pts • {profile?.chat_role}</p>
            </div>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d]">Salir</button>
          </div>
        </div>
      </header>

      <div className="sticky top-[60px] z-20 backdrop-blur-xl border-b bg-[#161b23]/80" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1300px] mx-auto px-2 flex gap-1 overflow-x-auto">
          <button onClick={()=>setTab('inicio')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='inicio'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🏠 Inicio</button>
          <button onClick={()=>setTab('chat')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='chat'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>💬 Chat Global {chatMsgs.length}</button>
          <button onClick={()=>setTab('tienda')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='tienda'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🛒 Tienda {products.length}</button>
          <button onClick={()=>setTab('mensajes')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='mensajes'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>✉️ Mensajes {directMsgs.length}</button>
          <button onClick={()=>setTab('perfil')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='perfil'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>👤 Perfil</button>
          <button onClick={()=>setTab('carrito')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='carrito'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🎒 Carrito {cart.length}</button>
        </div>
      </div>

      <main className="max-w-[1300px] mx-auto p-4 md:p-6">
        {tab==='inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="¿Qué piensas? Usa #tags" className="w-full min-h-[70px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none focus:border-[#7c5cff]" />
                    {attachments.length>0 && <div className="mt-3 flex gap-2 flex-wrap">{attachments.map((a,i)=><div key={i} className="relative"><img src={a.url} className="w-20 h-20 rounded-lg object-cover" alt="" /><button onClick={()=>setAttachments(attachments.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button></div>)}</div>}
                    <div className="mt-3 flex justify-between">
                      <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] text-xs">📎 Media {attachments.length}/5</button>
                      <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={e=>handleFileUpload(e.target.files,false)} />
                      <button onClick={handlePublish} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Publicar +1 pt</button>
                    </div>
                  </div>
                </div>
              </div>
              {filteredPosts.map(p=>(
                <div key={p.id} className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{background:p.author?.avatar_color||'#7c5cff'}}>{p.author?.username?.[0]?.toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="flex gap-2 items-center"><span className="font-bold text-sm">{p.author?.username}</span><span className="px-2 py-0.5 rounded-full bg-[#1d242e] text-[10px]">{p.author?.chat_role} • {p.author?.points} pts</span><span className="text-[11px] text-[#8b97a8]">{new Date(p.created_at).toLocaleString()}</span></div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{p.text}</p>
                      {p.tags.length>0 && <div className="mt-2 flex gap-1">{p.tags.map(t=><span key={t} className="text-xs text-[#7c5cff]">{t}</span>)}</div>}
                      {p.media?.length>0 && <div className="mt-3 grid grid-cols-2 gap-2">{p.media.map((m:any,i:number)=><img key={i} src={m.url} className="rounded-xl w-full h-40 object-cover" alt="" />)}</div>}
                      {(profile?.chat_role==='master' || profile?.id===p.author_id) && <button onClick={()=>setPosts(posts.filter(x=>x.id!==p.id))} className="mt-3 text-[11px] px-2 py-1 rounded bg-red-500/20 text-red-400">Borrar post</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold mb-3">🏆 Top puntos</h3>{profiles.slice(0,5).map(pr=><div key={pr.id} className="flex justify-between text-sm py-1"><span>{pr.username}</span><span className="text-[#ffb020]">{pr.points} pts</span></div>)}</div>
              <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#7c5cff]/20 to-[#a78bfa]/20 border border-[#7c5cff]/30"><h3 className="font-bold">◈ Spa Global</h3><p className="text-xs text-[#8b97a8] mt-2">Chat global + Mensajería + Marketplace 30d + Panel master ghost. Ctrl+Shift+A o 5 clicks logo.</p></div>
            </div>
          </div>
        )}

        {tab==='chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden flex flex-col h-[70vh]">
              <div className="p-4 border-b border-[#2a323d] flex justify-between"><h2 className="font-black">💬 Chat Global - Comunidad Elraizer</h2><span className="text-xs text-[#8b97a8]">{chatMsgs.length} mensajes • Moderado</span></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMsgs.map(m=>(
                  <div key={m.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:m.user?.avatar_color||'#7c5cff'}}>{m.user?.username?.[0]?.toUpperCase()}</div>
                    <div className="flex-1"><div className="flex gap-2 items-center"><span className="text-sm font-bold">{m.user?.username}</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1d242e]">{m.user?.chat_role}</span><span className="text-[10px] text-[#8b97a8]">{new Date(m.created_at).toLocaleTimeString()}</span></div><p className="text-sm mt-1">{m.text}</p></div>
                    {profile?.chat_role==='master' && <button onClick={()=>setChatMsgs(chatMsgs.filter(x=>x.id!==m.id))} className="text-xs text-red-400">x</button>}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-[#2a323d] flex gap-2">
                <input value={newChat} onChange={e=>setNewChat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleChatSend()} placeholder="Escribe en el chat global... (modera, gana puntos)" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <button onClick={handleChatSend} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Enviar</button>
              </div>
            </div>
          </div>
        )}

        {tab==='tienda' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div><h1 className="text-2xl font-black">Marketplace Global PRO</h1><p className="text-sm text-[#8b97a8]">Expira 30 días, auto-borrado 60s, Por vencer &lt;5d, Expira en X días, Renovar 30d, checkout con mensaje auto al vendedor</p></div>
              <button onClick={()=>setProdModal(true)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white text-sm font-black">+ Publicar PRO</button>
            </div>
            <div className="flex gap-2 overflow-x-auto"><button onClick={()=>setSelectedCategory('Todos')} className={`px-4 py-2 rounded-full text-xs font-bold ${selectedCategory==='Todos'?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>Todos</button>{CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-xs font-bold ${selectedCategory===c?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>{c}</button>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(p=>{
                const left=daysLeft(p.expires_at)
                return (
                  <div key={p.id} className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden group hover:border-[#7c5cff]/30 transition">
                    <div className="relative h-52 bg-[#0e1116]">{p.images?.[0]?<img src={p.images[0].url} className="w-full h-full object-cover group-hover:scale-[1.02] transition" alt="" />:<div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>}{left<=5 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#ffb020] text-black text-[10px] font-black">Por vencer {left}d</span>}<span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/80 text-[11px] border border-[#2a323d]">{p.category}</span><span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/90 text-[11px]">Expira en {left} días</span></div>
                    <div className="p-4"><h3 className="font-bold text-[15px]">{p.title}</h3><p className="text-[#00d4b1] font-black text-lg">${p.price.toLocaleString()} COP</p><p className="text-xs text-[#8b97a8] line-clamp-2">{p.description}</p><div className="flex items-center gap-2 mt-3"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:p.seller?.avatar_color}}>{p.seller?.username?.[0]}</div><span className="text-xs text-[#8b97a8]">{p.seller?.username}</span>{p.location && <span className="text-[10px] text-[#8b97a8]">• {p.location}</span>}</div><div className="mt-4 flex gap-2"><button onClick={()=>setCart(prev=>{ const ex=prev.find(c=>c.product.id===p.id); return ex?prev.map(c=>c.product.id===p.id?{...c, qty:c.qty+1}:c):[...prev,{product:p, qty:1}] })} className="flex-1 py-2.5 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold">Agregar</button>{(profile?.id===p.seller_id || profile?.chat_role==='master') && <button onClick={()=>{ const newExp=new Date(Date.now()+30*24*60*60*1000).toISOString(); setProducts(products.map(x=>x.id===p.id?{...x, expires_at:newExp}:x)) }} className="px-3 py-2.5 rounded-xl bg-[#ffb020]/10 border border-[#ffb020]/20 text-xs font-bold text-[#ffb020]">Renovar 30d</button>}</div></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='mensajes' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[70vh]">
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] p-3 overflow-y-auto">
              <h3 className="font-bold mb-3">Conversaciones</h3>
              {profiles.filter(pr=>pr.id!==profile?.id).map(pr=>(
                <button key={pr.id} onClick={()=>setSelectedChatUser(pr)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${selectedChatUser?.id===pr.id?'bg-[#7c5cff]/20 border border-[#7c5cff]/30':'hover:bg-[#1d242e]'}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>
                  <div className="flex-1"><p className="text-sm font-bold">{pr.username}</p><p className="text-[11px] text-[#8b97a8]">{directMsgs.filter(m=>(m.from===pr.id&&m.to===profile?.id)||(m.from===profile?.id&&m.to===pr.id)).length} msgs</p></div>
                </button>
              ))}
              {profiles.length<=1 && <p className="text-xs text-[#8b97a8] p-3">No hay otros usuarios aún. Los mensajes de checkout aparecerán aquí automáticamente.</p>}
            </div>
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] flex flex-col overflow-hidden">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-[#2a323d] flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:selectedChatUser.avatar_color}}>{selectedChatUser.username[0].toUpperCase()}</div><div><p className="font-bold text-sm">{selectedChatUser.username}</p><p className="text-xs text-[#8b97a8]">{selectedChatUser.chat_role} • {selectedChatUser.points} pts</p></div></div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {directMsgs.filter(m=>(m.from===profile?.id&&m.to===selectedChatUser.id)||(m.from===selectedChatUser.id&&m.to===profile?.id)).map(m=>(
                      <div key={m.id} className={`flex ${m.from===profile?.id?'justify-end':''}`}><div className={`max-w-[75%] p-3 rounded-xl text-sm ${m.from===profile?.id?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d]'}`}><p>{m.text}</p><p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p></div></div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 border-t border-[#2a323d] flex gap-2"><input value={newDirect} onChange={e=>setNewDirect(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleDirectSend()} placeholder={`Mensaje a ${selectedChatUser.username}...`} className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><button onClick={handleDirectSend} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Enviar</button></div>
                </>
              ) : <div className="flex-1 flex items-center justify-center text-[#8b97a8] text-sm">Selecciona un usuario para chatear - checkout envía mensaje auto</div>}
            </div>
          </div>
        )}

        {tab==='perfil' && profile && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 md:p-8 rounded-[24px] bg-[#161b23] border border-[#2a323d]">
              <div className="flex gap-6"><div className="w-24 h-24 rounded-[20px] flex items-center justify-center text-3xl font-black text-white" style={{background:profile.avatar_color}}>{profile.username[0].toUpperCase()}</div><div className="flex-1"><div className="flex items-center gap-3"><h2 className="text-2xl font-black">{profile.username}</h2><span className="px-2.5 py-1 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 text-[11px] font-bold text-[#a78bfa]">{profile.chat_role}</span></div><p className="text-sm text-[#8b97a8] mt-2">{profile.bio||'Miembro Spa Global'}</p><div className="mt-4 flex gap-2"><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs"><b>{profile.points}</b> puntos</div><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{posts.filter(p=>p.author_id===profile.id).length} posts</div><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{products.filter(p=>p.seller_id===profile.id).length} productos</div></div></div></div>
            </div>
          </div>
        )}

        {tab==='carrito' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-black">Carrito ({cart.length})</h1>
            {cart.map(c=><div key={c.product.id} className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between"><div className="flex gap-3"><img src={c.product.images?.[0]?.url} className="w-16 h-16 rounded-lg object-cover bg-[#0e1116]" alt="" /><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#8b97a8]">x{c.qty} • ${c.product.price} COP • {c.product.seller?.username}</p></div></div><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d]">Quitar</button></div>)}
            {cart.length>0 ? <><div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><p className="flex justify-between font-bold">Total: <span className="text-[#00d4b1]">${cart.reduce((s,c)=>s+c.product.price*c.qty,0).toLocaleString()} COP</span></p><p className="text-[11px] text-[#8b97a8] mt-2">Checkout envía mensaje automático al vendedor con tu info para pago directo</p></div><button onClick={handleCheckout} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Checkout - Notificar vendedores (mensajería)</button></> : <div className="p-12 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-4xl mb-3">🎒</p><p className="text-[#8b97a8]">Carrito vacío</p></div>}
          </div>
        )}
      </main>

      {prodModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="font-black text-lg">Publicar producto PRO</h2><button onClick={()=>setProdModal(false)} className="w-8 h-8 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="space-y-4">
              <input value={prodForm.title} onChange={e=>setProdForm({...prodForm, title:e.target.value})} placeholder="Título" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <div className="flex gap-3"><input value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} type="number" placeholder="Precio COP" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="px-3 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <textarea value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Descripción" className="w-full min-h-[90px] px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <input value={prodForm.location} onChange={e=>setProdForm({...prodForm, location:e.target.value})} placeholder="Ubicación" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <div onDragOver={e=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files,true)}} className={`border-2 border-dashed rounded-xl p-6 text-center ${dragOver?'border-[#7c5cff] bg-[#7c5cff]/10':'border-[#2a323d] bg-[#0e1116]'}`}>
                <p className="text-sm font-bold">Arrastra hasta 5 fotos</p><p className="text-[11px] text-[#8b97a8] mt-1">Máx 10MB c/u</p>
                <button onClick={()=>prodFileRef.current?.click()} className="mt-3 px-4 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold">Seleccionar</button>
                <input ref={prodFileRef} type="file" multiple accept="image/*" hidden onChange={e=>handleFileUpload(e.target.files,true)} />
                {prodForm.images.length>0 && <div className="mt-4 flex gap-2 flex-wrap justify-center">{prodForm.images.map((img:any,i:number)=><div key={i} className="relative"><img src={img.url} className="w-16 h-16 rounded-lg object-cover" alt="" /><button onClick={()=>setProdForm({...prodForm, images:prodForm.images.filter((_:any,j:number)=>j!==i)})} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button></div>)}</div>}
              </div>
              <button onClick={handlePublishProduct} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Publicar - 30 días</button>
            </div>
          </div>
        </div>
      )}

      {showMaster && profile?.chat_role==='master' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">👑 Panel Maestro Ghost - EXT3 - Control Total</h2><button onClick={()=>setShowMaster(false)} className="w-9 h-9 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Usuarios</p><p className="text-xl font-black">{profiles.length||1}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Posts</p><p className="text-xl font-black">{posts.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Productos</p><p className="text-xl font-black">{products.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Chat msgs</p><p className="text-xl font-black">{chatMsgs.length}</p></div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">👥 Usuarios - Control Total (dar/quitar puntos, ban, mute, expulsar, suspender, borrar definitivo perfil/posts/productos/comentarios/votos/mensajes/notificaciones/carrito/ordenes, editar email/pass)</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {[profile, ...profiles.filter(p=>p.id!==profile.id)].filter(Boolean).map((u:any)=>(
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0e1116] border border-[#2a323d]">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{background:u.avatar_color}}>{u.username[0].toUpperCase()}</div><div><p className="text-sm font-bold">{u.username} {u.banned&&'(BANEADO)'} {u.muted&&'(MUTEADO)'}</p><p className="text-[11px] text-[#8b97a8]">{u.chat_role} • {u.points} pts • {u.email||'local'}</p></div></div>
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={()=>{ const upd=profiles.map(p=>p.id===u.id?{...p, points:p.points+100}:p); setProfiles(upd); if(u.id===profile?.id) setProfile({...u, points:u.points+100}) }} className="px-2 py-1 rounded bg-[#7c5cff] text-white text-[10px]">+100</button>
                        <button onClick={()=>{ const upd=profiles.map(p=>p.id===u.id?{...p, points:Math.max(0,p.points-100)}:p); setProfiles(upd); if(u.id===profile?.id) setProfile({...u, points:Math.max(0,u.points-100)}) }} className="px-2 py-1 rounded bg-[#1d242e] border border-[#2a323d] text-[10px]">-100</button>
                        <button onClick={()=>{ const upd=profiles.map(p=>p.id===u.id?{...p, banned:!p.banned}:p); setProfiles(upd) }} className="px-2 py-1 rounded bg-[#ffb020]/20 text-[#ffb020] text-[10px]">{u.banned?'Unban':'Ban'}</button>
                        <button onClick={()=>{ const upd=profiles.map(p=>p.id===u.id?{...p, muted:!p.muted}:p); setProfiles(upd) }} className="px-2 py-1 rounded bg-[#00d4b1]/20 text-[#00d4b1] text-[10px]">{u.muted?'Unmute':'Mute'}</button>
                        <button onClick={()=>setEditUserModal(u)} className="px-2 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-[10px]">Editar email/pass</button>
                        <button onClick={()=>{ if(confirm('Borrar definitivo '+u.username+'? Borra perfil, posts, productos, comentarios, votos, mensajes, notificaciones, carrito, ordenes')){ setProfiles(profiles.filter(p=>p.id!==u.id)); setPosts(posts.filter(p=>p.author_id!==u.id)); setProducts(products.filter(p=>p.seller_id!==u.id)); setChatMsgs(chatMsgs.filter(c=>c.user_id!==u.id)); setDirectMsgs(directMsgs.filter(d=>d.from!==u.id&&d.to!==u.id)) } }} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px]">Borrar definitivo</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><h4 className="font-bold text-sm mb-2">Posts - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{posts.map(p=><div key={p.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span className="line-clamp-1">{p.text}</span><button onClick={()=>setPosts(posts.filter(x=>x.id!==p.id))} className="text-red-400 ml-2">x</button></div>)}</div></div>
                <div><h4 className="font-bold text-sm mb-2">Productos - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{products.map(p=><div key={p.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span>{p.title}</span><button onClick={()=>setProducts(products.filter(x=>x.id!==p.id))} className="text-red-400 ml-2">x</button></div>)}</div></div>
                <div><h4 className="font-bold text-sm mb-2">Chat global - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{chatMsgs.map(c=><div key={c.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span className="line-clamp-1">{c.text}</span><button onClick={()=>setChatMsgs(chatMsgs.filter(x=>x.id!==c.id))} className="text-red-400 ml-2">x</button></div>)}</div></div>
              </div>
              <div className="flex gap-2 flex-wrap"><button onClick={()=>{ setPosts([]); setProducts([]); setChatMsgs([]); setDirectMsgs([]); setCart([]) }} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold">Borrar todo (posts, productos, chat, mensajes, carrito)</button><button onClick={()=>{ if(profile) setProfile({...profile, points:profile.points+1000}) }} className="px-4 py-2 rounded-xl bg-[#7c5cff] text-white text-xs font-bold">+1000 pts master</button></div>
            </div>
            <p className="text-[10px] text-[#8b97a8] mt-6">Ghost mode: sin rastro público cuenta maestra EXT3. Crown 👑 solo visible hover master. Acceso Ctrl+Shift+A o 5 clicks en ◈. Master: Ext3@elraizer.com / Elraizer5374e*</p>
          </div>
        </div>
      )}

      {editUserModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Editar {editUserModal.username} - email/pass</h3><button onClick={()=>setEditUserModal(null)} className="w-8 h-8 rounded-full bg-[#1d242e]">✕</button></div>
            <div className="space-y-3"><input value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Nuevo email" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><input value={editPass} onChange={e=>setEditPass(e.target.value)} type="password" placeholder="Nueva contraseña" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><button onClick={()=>{ const upd=profiles.map(p=>p.id===editUserModal.id?{...p, email:editEmail||p.email}:p); setProfiles(upd); setEditUserModal(null); setEditEmail(''); setEditPass(''); alert('Editado') }} className="w-full py-3 rounded-xl bg-[#7c5cff] text-white font-bold">Guardar email/pass</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
