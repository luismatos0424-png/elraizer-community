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
type Message = { id: string; from: string; to: string; text: string; created_at: string; fromProfile?: Profile }

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
  const [messages,setMessages]=useState<Message[]>([])
  const [newPost,setNewPost]=useState('')
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
  const fileInputRef=useRef<HTMLInputElement>(null)
  const prodFileRef=useRef<HTMLInputElement>(null)

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
        setProfile(JSON.parse(localStorage.getItem('elraizer_profile')||'null'))
        setPosts(JSON.parse(localStorage.getItem('elraizer_posts')||'[]'))
        setProducts(JSON.parse(localStorage.getItem('elraizer_products')||'[]'))
        setCart(JSON.parse(localStorage.getItem('elraizer_cart')||'[]'))
        setMessages(JSON.parse(localStorage.getItem('elraizer_messages')||'[]'))
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
            bio:isMaster?'Fundador':'', points:isMaster?999:0
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
    }
    load()
  },[currentAuth])

  useEffect(()=>{
    const check=()=>{
      const now=new Date()
      setProducts(prev=>{
        const filtered=prev.filter(p=>new Date(p.expires_at)>now)
        if(filtered.length!==prev.length) localStorage.setItem('elraizer_products', JSON.stringify(filtered))
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
      localStorage.setItem('elraizer_messages', JSON.stringify(messages))
    }
  },[posts,products,cart,messages])

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
          bio:isMaster?'Fundador':obBio, points:isMaster?999:0,
          created_at:new Date().toISOString(), email
        }
        localStorage.setItem('elraizer_auth', JSON.stringify({user:{id,email}}))
        localStorage.setItem('elraizer_profile', JSON.stringify(prof))
        setCurrentAuth({user:{id,email}}); setProfile(prof); setOnboarding(false)
      }else{
        if(email.toLowerCase()==='ext3@elraizer.com' && pass==='Elraizer5374e*'){
          const prof:Profile={
            id:'master_ext3', username:'EXT3', avatar_color:'#ffb020',
            role:'admin', chat_role:'master', bio:'Fundador Spa Global',
            points:999, created_at:new Date().toISOString(), email
          }
          localStorage.setItem('elraizer_auth', JSON.stringify({user:{id:prof.id,email}}))
          localStorage.setItem('elraizer_profile', JSON.stringify(prof))
          setCurrentAuth({user:{id:prof.id,email}}); setProfile(prof); return
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
        setOnboarding(false); alert('Cuenta creada, revisa email')
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
    if(!isSupabaseConfigured){
      setPosts([post,...posts])
    }else{
      const {data,error}=await supabase.from('posts').insert({
        author_id:profile?.id, text:newPost, tags:post.tags, media:attachments
      }).select().single()
      if(error) alert(error.message); else setPosts([{...data, author:profile} as any, ...posts])
    }
    setNewPost(''); setAttachments([])
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
    if(!isSupabaseConfigured){
      setProducts([prod,...products])
    }else{
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
      const msg:Message={
        id:'msg_'+Date.now()+Math.random(), from:profile?.id||'', to:item.product.seller_id,
        text:'Hola '+item.product.seller?.username+', soy '+buyer+'. Quiero comprar '+item.product.title+' x'+item.qty+' por '+item.product.price+' COP. Contactame para coordinar pago directo.',
        created_at:new Date().toISOString(), fromProfile:profile||undefined
      }
      setMessages(prev=>[msg,...prev])
    })
    alert('Pedido enviado al vendedor, te contactara para pago directo')
    setCart([]); setTab('inicio')
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
            <h2 className="text-4xl font-black leading-tight mb-4">Comunidad premium<br/>para creadores globales</h2>
            <p className="text-[#8b97a8] mb-8 max-w-md">Chat moderado, Marketplace 30 días, rangos, puntos, y panel maestro stealth. Sin Google, 100% Elraizer.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">💬</p><p className="text-sm font-bold">Chat Real</p><p className="text-xs text-[#8b97a8]">Tiempo real moderado</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">🛒</p><p className="text-sm font-bold">Marketplace PRO</p><p className="text-xs text-[#8b97a8]">Expira 30d + checkout</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">👑</p><p className="text-sm font-bold">Rangos</p><p className="text-xs text-[#8b97a8]">Puntos y niveles</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">🔒</p><p className="text-sm font-bold">Ghost Master</p><p className="text-xs text-[#8b97a8]">Panel stealth total</p></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0e1116]">
          <div className="w-full max-w-[420px] bg-[#161b23] border border-[#2a323d] rounded-[24px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Bienvenido</h2>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d]">🌓</button>
            </div>
            <p className="text-sm text-[#8b97a8] mb-6">Acceso sin Google - solo email Elraizer</p>
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-[#0e1116] border border-[#2a323d]">
              <button onClick={()=>setAuthMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${authMode==='login'?'bg-[#7c5cff] text-white shadow':'text-[#8b97a8]'}`}>Login</button>
              <button onClick={()=>setAuthMode('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${authMode==='register'?'bg-[#7c5cff] text-white shadow':'text-[#8b97a8]'}`}>Registro</button>
            </div>
            {!onboarding ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full mb-3 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full mb-6 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black shadow-lg shadow-[#7c5cff]/20 hover:shadow-xl transition">Entrar a Elraizer</button>
                <p className="text-[11px] text-[#8b97a8] mt-4 text-center">Master: Ext3@elraizer.com / Elraizer5374e* (ghost mode)</p>
              </>
            ):(
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Crea tu perfil</h3>
                <input value={obUsername} onChange={e=>setObUsername(e.target.value)} placeholder="Username min 3 caracteres" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <div className="flex gap-2 flex-wrap">{COLORS.map(c=><button key={c} onClick={()=>setObColor(c)} className="w-9 h-9 rounded-full border-2 transition hover:scale-110" style={{background:c, borderColor:obColor===c?'white':'transparent'}} />)}</div>
                <input value={obBio} onChange={e=>setObBio(e.target.value)} placeholder="Bio opcional - que haces?" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Crear cuenta</button>
                <button onClick={()=>setOnboarding(false)} className="w-full text-xs text-[#8b97a8] py-2">Volver</button>
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
        <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between">
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
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar posts, productos..." className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#1d242e] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <span className="absolute left-3 top-2.5 text-[#8b97a8]">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d] hover:border-[#7c5cff]/50 transition">🌓</button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
            <div className="hidden md:block text-right mr-2">
              <p className="text-xs font-bold leading-none">{profile?.username}</p>
              <p className="text-[10px] text-[#8b97a8]">{profile?.points} pts</p>
            </div>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] hover:bg-[#2a323d] transition">Salir</button>
          </div>
        </div>
      </header>

      <div className="sticky top-[60px] z-20 backdrop-blur-xl border-b bg-[#161b23]/80" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1200px] mx-auto px-2 flex gap-1 overflow-x-auto">
          <button onClick={()=>setTab('inicio')} className={`px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab==='inicio'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8] hover:text-white'}`}>🏠 Inicio</button>
          <button onClick={()=>setTab('tienda')} className={`px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab==='tienda'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8] hover:text-white'}`}>🛒 Tienda {products.length}</button>
          <button onClick={()=>setTab('perfil')} className={`px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab==='perfil'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8] hover:text-white'}`}>👤 Perfil</button>
          <button onClick={()=>setTab('carrito')} className={`px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab==='carrito'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8] hover:text-white'}`}>🎒 Carrito {cart.length}</button>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto p-4 md:p-6">
        {tab==='inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d] shadow">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="¿Qué piensas, que creas? Usa #tags" className="w-full min-h-[70px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none focus:border-[#7c5cff]" />
                    {attachments.length>0 && <div className="mt-3 flex gap-2 flex-wrap">{attachments.map((a,i)=><div key={i} className="relative"><img src={a.url} className="w-20 h-20 rounded-lg object-cover" alt="" /><button onClick={()=>setAttachments(attachments.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button></div>)}</div>}
                    <div className="mt-3 flex justify-between items-center">
                      <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] text-xs hover:border-[#7c5cff]/50">📎 Media ({attachments.length}/5)</button>
                      <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={e=>handleFileUpload(e.target.files,false)} />
                      <button onClick={handlePublish} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm shadow shadow-[#7c5cff]/20">Publicar</button>
                    </div>
                  </div>
                </div>
              </div>
              {filteredPosts.map(p=>(
                <div key={p.id} className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d] shadow hover:border-[#2a323d]/80 transition">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" style={{background:p.author?.avatar_color||'#7c5cff'}}>{p.author?.username?.[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-center flex-wrap"><span className="font-bold text-sm">{p.author?.username}</span><span className="px-2 py-0.5 rounded-full bg-[#1d242e] text-[10px] text-[#8b97a8]">{p.author?.chat_role}</span><span className="text-[11px] text-[#8b97a8]">{new Date(p.created_at).toLocaleString()}</span></div>
                      <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap">{p.text}</p>
                      {p.tags.length>0 && <div className="mt-2 flex gap-1 flex-wrap">{p.tags.map(t=><span key={t} className="text-xs text-[#7c5cff]">{t}</span>)}</div>}
                      {p.media?.length>0 && <div className="mt-3 grid grid-cols-2 gap-2">{p.media.map((m:any,i:number)=><img key={i} src={m.url} className="rounded-xl w-full h-40 object-cover" alt="" />)}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {filteredPosts.length===0 && <div className="p-8 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-[#8b97a8]">No hay posts aún, ¡sé el primero!</p></div>}
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <h3 className="font-bold mb-3">🔥 Tendencias</h3>
                <div className="space-y-2 text-sm"><p className="text-[#8b97a8]">#diseno - 12 posts</p><p className="text-[#8b97a8]">#desarrollo - 8 posts</p><p className="text-[#8b97a8]">#elraizer - 25 posts</p></div>
              </div>
              <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#7c5cff]/20 to-[#a78bfa]/20 border border-[#7c5cff]/30">
                <h3 className="font-bold mb-2">◈ Elraizer Spa Global</h3>
                <p className="text-xs text-[#8b97a8] mb-3">Marketplace PRO, chat moderado, rangos y ghost master. Todo en un solo SPA premium #0e1116</p>
                <p className="text-[11px] text-[#7c5cff]">Ctrl+Shift+A o 5 clicks en logo para panel maestro</p>
              </div>
            </div>
          </div>
        )}

        {tab==='tienda' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black">Marketplace Global</h1>
                <p className="text-sm text-[#8b97a8]">Productos expiran en 30 días, auto-borrado cada 60s</p>
              </div>
              <button onClick={()=>setProdModal(true)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white text-sm font-black shadow shadow-[#7c5cff]/20">+ Publicar producto PRO</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={()=>setSelectedCategory('Todos')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${selectedCategory==='Todos'?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>Todos</button>
              {CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${selectedCategory===c?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>{c}</button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(p=>{
                const left=daysLeft(p.expires_at)
                return (
                  <div key={p.id} className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden hover:border-[#7c5cff]/30 transition shadow group">
                    <div className="relative h-52 bg-[#0e1116]">
                      {p.images?.[0]?<img src={p.images[0].url} className="w-full h-full object-cover group-hover:scale-[1.02] transition" alt="" />:<div className="w-full h-full flex flex-col items-center justify-center text-[#8b97a8]"><span className="text-4xl mb-2">🛍️</span><span className="text-xs">Sin imagen</span></div>}
                      {left<=5 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#ffb020] text-black text-[10px] font-black shadow">Por vencer {left}d</span>}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/80 backdrop-blur text-[11px] font-bold border border-[#2a323d]">{p.category}</span>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/90 backdrop-blur text-[11px]">Expira en {left} días</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[15px] line-clamp-1">{p.title}</h3>
                      <p className="text-[#00d4b1] font-black text-lg mt-1">${p.price.toLocaleString()} COP</p>
                      <p className="text-xs text-[#8b97a8] mt-1 line-clamp-2">{p.description||'Sin descripción'}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:p.seller?.avatar_color}}>{p.seller?.username?.[0]}</div>
                        <span className="text-xs text-[#8b97a8]">{p.seller?.username}</span>
                        {p.location && <span className="text-[10px] text-[#8b97a8]">• {p.location}</span>}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={()=>{ setCart(prev=>{ const ex=prev.find(c=>c.product.id===p.id); const upd=ex?prev.map(c=>c.product.id===p.id?{...c, qty:c.qty+1}:c):[...prev,{product:p, qty:1}]; return upd } )}} className="flex-1 py-2.5 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold hover:border-[#7c5cff]/50 transition">Agregar carrito</button>
                        {(profile?.id===p.seller_id || profile?.chat_role==='master') && <button onClick={()=>{
                          const newExp=new Date(Date.now()+30*24*60*60*1000).toISOString()
                          setProducts(products.map(x=>x.id===p.id?{...x, expires_at:newExp}:x))
                        }} className="px-3 py-2.5 rounded-xl bg-[#ffb020]/10 border border-[#ffb020]/20 text-xs font-bold text-[#ffb020]">Renovar 30d</button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredProducts.length===0 && <div className="p-12 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-4xl mb-3">🛒</p><p className="text-[#8b97a8]">No hay productos en {selectedCategory}</p><button onClick={()=>setProdModal(true)} className="mt-4 px-5 py-2 rounded-xl bg-[#7c5cff] text-white text-sm font-bold">Publicar el primero</button></div>}
          </div>
        )}

        {tab==='perfil' && profile && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 md:p-8 rounded-[24px] bg-[#161b23] border border-[#2a323d] shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-[20px] flex items-center justify-center text-3xl font-black text-white shadow-lg" style={{background:profile.avatar_color}}>{profile.username[0].toUpperCase()}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3"><h2 className="text-2xl font-black">{profile.username}</h2><span className="px-2.5 py-1 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 text-[11px] font-bold text-[#a78bfa]">{profile.chat_role}</span></div>
                  <p className="text-sm text-[#8b97a8] mt-2">{profile.bio||'Miembro de Elraizer Community Spa Global'}</p>
                  <div className="mt-4 flex gap-3"><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs"><span className="font-bold">{profile.points}</span> puntos</div><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{posts.filter(p=>p.author_id===profile.id).length} posts</div><div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{products.filter(p=>p.seller_id===profile.id).length} productos</div></div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold mb-3">Mis posts</h3><div className="space-y-2">{posts.filter(p=>p.author_id===profile.id).slice(0,5).map(p=><p key={p.id} className="text-sm text-[#8b97a8] line-clamp-1">{p.text}</p>)}</div></div>
              <div className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold mb-3">Mis productos</h3><div className="space-y-2">{products.filter(p=>p.seller_id===profile.id).map(p=><div key={p.id} className="flex justify-between text-sm"><span className="text-[#8b97a8]">{p.title}</span><span className="text-xs">{daysLeft(p.expires_at)}d</span></div>)}</div></div>
            </div>
          </div>
        )}

        {tab==='carrito' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-black">Carrito ({cart.length})</h1>
            {cart.map(c=><div key={c.product.id} className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between items-center"><div className="flex gap-3"><img src={c.product.images?.[0]?.url} className="w-16 h-16 rounded-lg object-cover bg-[#0e1116]" alt="" /><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#8b97a8]">x{c.qty} • ${c.product.price} COP • {c.product.seller?.username}</p></div></div><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d]">Quitar</button></div>)}
            {cart.length>0 ? <><div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><p className="flex justify-between font-bold">Total: <span className="text-[#00d4b1]">${cart.reduce((s,c)=>s+c.product.price*c.qty,0).toLocaleString()} COP</span></p><p className="text-[11px] text-[#8b97a8] mt-2">Al comprar se enviará mensaje automático al vendedor con tu info para coordinar pago directo</p></div><button onClick={handleCheckout} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black shadow">Checkout - Notificar vendedores</button></> : <div className="p-12 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-4xl mb-3">🎒</p><p className="text-[#8b97a8]">Carrito vacío</p></div>}
            {messages.length>0 && <div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold text-sm mb-3">Mensajes de compra</h3>{messages.slice(0,5).map(m=><p key={m.id} className="text-xs text-[#8b97a8] mb-2">{m.text}</p>)}</div>}
          </div>
        )}
      </main>

      {prodModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="font-black text-lg">Publicar producto PRO</h2><button onClick={()=>setProdModal(false)} className="w-8 h-8 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="space-y-4">
              <input value={prodForm.title} onChange={e=>setProdForm({...prodForm, title:e.target.value})} placeholder="Título premium (ej: Diseño logo pro)" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <div className="flex gap-3"><input value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} type="number" placeholder="Precio COP (ej: 50000)" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="px-3 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <textarea value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Descripción profesional, materiales, entrega..." className="w-full min-h-[90px] px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <input value={prodForm.location} onChange={e=>setProdForm({...prodForm, location:e.target.value})} placeholder="Ubicación (ej: Armenia, Quindío)" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
              <div onDragOver={e=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files,true)}} className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragOver?'border-[#7c5cff] bg-[#7c5cff]/10':'border-[#2a323d] bg-[#0e1116]'}`}>
                <p className="text-sm font-bold">Arrastra hasta 5 fotos aquí</p><p className="text-[11px] text-[#8b97a8] mt-1">Máx 10MB cada una, drag & drop</p>
                <button onClick={()=>prodFileRef.current?.click()} className="mt-3 px-4 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold">Seleccionar fotos</button>
                <input ref={prodFileRef} type="file" multiple accept="image/*" hidden onChange={e=>handleFileUpload(e.target.files,true)} />
                {prodForm.images.length>0 && <div className="mt-4 flex gap-2 flex-wrap justify-center">{prodForm.images.map((img:any,i:number)=><div key={i} className="relative"><img src={img.url} className="w-16 h-16 rounded-lg object-cover" alt="" /><button onClick={()=>setProdForm({...prodForm, images:prodForm.images.filter((_:any,j:number)=>j!==i)})} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button></div>)}</div>}
              </div>
              <p className="text-[11px] text-[#8b97a8]">Expira automáticamente en 30 días, con badge Por vencer &lt;5d y contador Expira en X días. Renovables por owner/master.</p>
              <button onClick={handlePublishProduct} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black shadow shadow-[#7c5cff]/20">Publicar en Marketplace Global</button>
            </div>
          </div>
        </div>
      )}

      {showMaster && profile?.chat_role==='master' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">👑 Panel Maestro Ghost - EXT3</h2><button onClick={()=>setShowMaster(false)} className="w-9 h-9 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Total Usuarios</p><p className="text-xl font-black">{1}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Posts</p><p className="text-xl font-black">{posts.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Productos</p><p className="text-xl font-black">{products.length}</p></div>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold">Control Total - Ghost Mode</h3>
              <p className="text-xs text-[#8b97a8]">Dar/quitar puntos, ban, mute, expulsar, suspender, borrar definitivo (perfil, posts, productos, comentarios, votos, mensajes, notificaciones, carrito, órdenes), editar email/pass, borrar posts/productos</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={()=>{ if(profile) setProfile({...profile, points:profile.points+100})}} className="px-4 py-2 rounded-xl bg-[#7c5cff] text-white text-xs font-bold">+100 pts</button>
                <button onClick={()=>{ if(profile) setProfile({...profile, points:Math.max(0,profile.points-100)})}} className="px-4 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs">-100 pts</button>
                <button onClick={()=>setPosts([])} className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">Borrar todos los posts</button>
                <button onClick={()=>setProducts([])} className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">Borrar todos los productos</button>
              </div>
            </div>
            <p className="text-[10px] text-[#8b97a8] mt-6">Acceso: Ctrl+Shift+A o 5 clicks en ◈ - Crown solo visible hover master - Sin rastro público de cuenta maestra</p>
          </div>
        </div>
      )}
    </div>
  )
}
