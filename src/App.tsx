
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
  suspended?: boolean
  banned_from_chat?: boolean
}

type Post = {
  id: string
  author_id: string
  text: string
  tags: string[]
  media: any[]
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

const MASTER_USER = 'EXT3'
const CATEGORIES = ['Diseño','Desarrollo','Electrónica','Ropa','Servicios','Hogar','Otros']
const COLORS = ['#7c5cff','#00d4b1','#ffb020','#ff5470','#22c55e','#3b82f6','#ec4899','#f59e0b']

export default function App(){
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const [session,setSession]=useState<any>(null)
  const [profile,setProfile]=useState<Profile|null>(null)
  const [tab,setTab]=useState('inicio')
  const [posts,setPosts]=useState<Post[]>([])
  const [products,setProducts]=useState<Product[]>([])
  const [cart,setCart]=useState<CartItem[]>([])
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
  const [masterTab,setMasterTab]=useState('usuarios')
  const fileInputRef=useRef<HTMLInputElement>(null)
  const prodFileRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark') },[theme])

  useEffect(()=>{
    if(!isSupabaseConfigured){
      const s=localStorage.getItem('elraizer_session')
      if(s){
        setSession(JSON.parse(s))
        setProfile(JSON.parse(localStorage.getItem('elraizer_profile')||'null'))
        setPosts(JSON.parse(localStorage.getItem('elraizer_posts')||'[]'))
        setProducts(JSON.parse(localStorage.getItem('elraizer_products')||'[]'))
        setCart(JSON.parse(localStorage.getItem('elraizer_cart')||'[]'))
      }
      return
    }
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const {data:listener}=supabase.auth.onAuthStateChange(async(_,sess)=>{
      setSession(sess)
      if(sess?.user){
        const {data:existing}=await supabase.from('profiles').select('*').eq('id', sess.user.id).single()
        if(!existing){
          const isMaster=sess.user.email?.toLowerCase()==='ext3@elraizer.com'
          const username=isMaster?MASTER_USER:(sess.user.email?.split('@')[0]||'Usuario')
          const {data:newProf}=await supabase.from('profiles').insert({
            id:sess.user.id,
            username,
            avatar_color:isMaster?'#ffb020':'#7c5cff',
            role:isMaster?'admin':'user',
            chat_role:isMaster?'master':'nuevo',
            bio:isMaster?'Fundador':'',
            points:isMaster?999:0
          }).select().single()
          if(newProf) setProfile(newProf as any)
        }else setProfile(existing as any)
      }
    })
    return ()=>listener.subscription.unsubscribe()
  },[])

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
    if(!isSupabaseConfigured||!session) return
    const load=async()=>{
      const {data:pd}=await supabase.from('posts').select('*, profiles:author_id(*)').order('created_at',{ascending:false}).limit(50)
      if(pd) setPosts(pd.map((p:any)=>({...p, author:p.profiles})))
      const {data:pr}=await supabase.from('products').select('*, profiles:seller_id(*)').gt('expires_at', new Date().toISOString()).order('created_at',{ascending:false})
      if(pr) setProducts(pr.map((p:any)=>({...p, seller:p.profiles})))
    }
    load()
  },[session])

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'&&profile?.chat_role==='master') setShowMaster(true) }
    window.addEventListener('keydown',h)
    return ()=>window.removeEventListener('keydown',h)
  },[profile])

  const handleLogo=()=>{
    const c=logoClicks+1
    setLogoClicks(c)
    if(c>=5&&profile?.chat_role==='master'){ setShowMaster(true); setLogoClicks(0) }
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
          id,
          username:isMaster?MASTER_USER:obUsername,
          avatar_color:isMaster?'#ffb020':obColor,
          role:isMaster?'admin':'user',
          chat_role:isMaster?'master':'nuevo',
          bio:isMaster?'Fundador':obBio,
          points:isMaster?999:0,
          created_at:new Date().toISOString(),
          email
        }
        localStorage.setItem('elraizer_session', JSON.stringify({user:{id,email}}))
        localStorage.setItem('elraizer_profile', JSON.stringify(prof))
        setSession({user:{id,email}})
        setProfile(prof)
        setOnboarding(false)
      }else{
        const saved=JSON.parse(localStorage.getItem('elraizer_profile')||'null')
        if(saved){ setSession({user:{id:saved.id,email}}); setProfile(saved) }else alert('Registrate primero')
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
          id:data.user.id,
          username:isMaster?MASTER_USER:obUsername,
          avatar_color:isMaster?'#ffb020':obColor,
          bio:obBio,
          role:isMaster?'admin':'user',
          chat_role:isMaster?'master':'nuevo',
          points:isMaster?999:0
        })
        setOnboarding(false)
        alert('Cuenta creada')
      }
    }else{
      const {error}=await supabase.auth.signInWithPassword({email, password:pass})
      if(error) alert(error.message)
    }
  }

  const handleLogout=async()=>{
    if(isSupabaseConfigured) await supabase.auth.signOut()
    else localStorage.clear()
    setSession(null); setProfile(null)
  }

  const handlePublish=async()=>{
    if(!newPost.trim()&&attachments.length===0) return
    const post:Post={
      id:'p_'+Date.now(),
      author_id:profile?.id||'',
      text:newPost,
      tags:newPost.match(/#\w+/g)||[],
      media:attachments,
      created_at:new Date().toISOString(),
      author:profile||undefined
    }
    if(!isSupabaseConfigured){
      const all=[post,...posts]
      setPosts(all)
      localStorage.setItem('elraizer_posts', JSON.stringify(all))
    }else{
      const {data,error}=await supabase.from('posts').insert({
        author_id:profile?.id,
        text:newPost,
        tags:post.tags,
        media:attachments
      }).select().single()
      if(error) alert(error.message)
      else setPosts([{...data, author:profile} as any, ...posts])
    }
    setNewPost(''); setAttachments([])
  }

  const handleProdFiles=(e:any)=>{
    const files=Array.from(e.target.files||[]).slice(0,5) as any[]
    const imgs=files.map((f:any)=>({name:f.name, url:URL.createObjectURL(f)}))
    setProdForm({...prodForm, images:[...prodForm.images, ...imgs].slice(0,5)})
  }

  const handlePublishProduct=async()=>{
    if(!prodForm.title.trim()||!prodForm.price) return alert('Titulo y precio requeridos')
    const now=new Date()
    const expires=new Date(now.getTime()+30*24*60*60*1000)
    const prod:Product={
      id:'prod_'+Date.now(),
      seller_id:profile?.id||'',
      title:prodForm.title,
      price:parseFloat(prodForm.price),
      category:prodForm.category,
      description:prodForm.description,
      images:prodForm.images,
      location:prodForm.location,
      created_at:now.toISOString(),
      expires_at:expires.toISOString(),
      seller:profile||undefined
    }
    if(!isSupabaseConfigured){
      const all=[prod,...products]
      setProducts(all)
      localStorage.setItem('elraizer_products', JSON.stringify(all))
    }else{
      const {data,error}=await supabase.from('products').insert({
        seller_id:profile?.id,
        title:prodForm.title,
        price:prod.price,
        category:prodForm.category,
        description:prodForm.description,
        images:prodForm.images,
        location:prodForm.location,
        expires_at:expires.toISOString()
      }).select().single()
      if(error) alert(error.message)
      else setProducts([{...data, seller:profile} as any, ...products])
    }
    setProdModal(false)
    setProdForm({title:'',price:'',category:'Otros',description:'',location:'',images:[]})
  }

  const handleAddToCart=(p:Product)=>{
    setCart(prev=>{
      const ex=prev.find(c=>c.product.id===p.id)
      const upd=ex?prev.map(c=>c.product.id===p.id?{...c, qty:c.qty+1}:c):[...prev,{product:p, qty:1}]
      localStorage.setItem('elraizer_cart', JSON.stringify(upd))
      return upd
    })
  }

  const handleCheckout=async()=>{
    if(cart.length===0) return
    for(const item of cart){
      const msg=`🛒 Nueva solicitud: ${profile?.username} quiere comprar ${item.product.title} por $${item.product.price} x${item.qty}. Email: ${session?.user?.email||email}`
      if(!isSupabaseConfigured){
        const key='elraizer_notifications_'+item.product.seller_id
        const notifs=JSON.parse(localStorage.getItem(key)||'[]')
        notifs.unshift({id:'n_'+Date.now(), text:msg, icon:'🛒', read:false, created_at:new Date().toISOString()})
        localStorage.setItem(key, JSON.stringify(notifs))
      }else{
        await supabase.from('notifications').insert({user_id:item.product.seller_id, text:msg, icon:'🛒'})
        await supabase.from('orders').insert({buyer_id:profile?.id, seller_id:item.product.seller_id, items:item.product, total:item.product.price*item.qty, buyer_email:session?.user?.email})
      }
    }
    setCart([]); localStorage.setItem('elraizer_cart','[]')
    alert('Solicitud enviada al vendedor')
  }

  const handleRenew=(p:Product)=>{
    const newExp=new Date(Date.now()+30*24*60*60*1000).toISOString()
    if(!isSupabaseConfigured){
      const upd=products.map(x=>x.id===p.id?{...x, expires_at:newExp}:x)
      setProducts(upd); localStorage.setItem('elraizer_products', JSON.stringify(upd))
    }else{
      supabase.from('products').update({expires_at:newExp}).eq('id',p.id).then(()=>setProducts(products.map(x=>x.id===p.id?{...x, expires_at:newExp}:x)))
    }
  }

  const daysLeft=(exp:string)=>Math.max(0, Math.ceil((new Date(exp).getTime()-Date.now())/(1000*60*60*24)))
  const filteredPosts=posts.filter(p=>!search||p.text.toLowerCase().includes(search.toLowerCase()))
  const filteredProducts=products.filter(p=>!search||p.title.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase()))

  if(!session){
    return (
      <div className="min-h-screen flex bg-[#0e1116] text-[#e9eef5]">
        <div className="flex-1 hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#161b23] to-[#0e1116] border-r border-[#2a323d]">
          <h1 className="text-4xl font-black mb-4">◈ ELR · Elraizer</h1>
          <p className="text-[#8b97a8] mb-8">Comunidad y Marketplace</p>
          <ul className="space-y-3 text-sm">
            <li>💬 Chat moderado</li>
            <li>🛍️ Marketplace 30 días</li>
            <li>⭐ Rangos y puntos</li>
            <li>🛡️ Panel maestro stealth</li>
          </ul>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px] bg-[#161b23] border border-[#2a323d] rounded-[20px] p-8">
            <h2 className="text-2xl font-bold mb-2">Elraizer Community</h2>
            <p className="text-sm text-[#8b97a8] mb-6">Acceso con email</p>
            <div className="flex gap-2 mb-6">
              <button onClick={()=>setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode==='login'?'bg-[#7c5cff] text-white':'bg-[#1d242e] text-[#8b97a8]'}`}>Login</button>
              <button onClick={()=>setAuthMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode==='register'?'bg-[#7c5cff] text-white':'bg-[#1d242e] text-[#8b97a8]'}`}>Registro</button>
            </div>
            {!onboarding ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full mb-3 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full mb-4 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
                <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">{authMode==='login'?'Entrar':'Continuar'}</button>
              </>
            ):(
              <div className="space-y-4">
                <h3 className="font-bold">Perfil</h3>
                <input value={obUsername} onChange={e=>setObUsername(e.target.value)} placeholder="Username min 3" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <div className="flex gap-2 flex-wrap">{COLORS.map(c=><button key={c} onClick={()=>setObColor(c)} className="w-8 h-8 rounded-full border-2" style={{background:c, borderColor:obColor===c?'white':'transparent'}} />)}</div>
                <input value={obBio} onChange={e=>setObBio(e.target.value)} placeholder="Bio opcional" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">Crear cuenta</button>
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
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b bg-[#161b23]/80" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1080px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLogo} className="font-black text-lg">◈ Elraizer</button>
            {profile?.chat_role==='master' && <span className="opacity-30 hover:opacity-100 cursor-pointer" onClick={()=>setShowMaster(true)}>👑</span>}
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d]">🌓</button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:profile?.avatar_color}}>{profile?.username?.[0]}</div>
            <button onClick={handleLogout} className="text-xs ml-2 px-3 py-1 rounded-lg bg-[#1d242e] border border-[#2a323d]">Salir</button>
          </div>
        </div>
      </header>

      <div className="sticky top-14 z-20 backdrop-blur border-b bg-[#161b23]/80" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1080px] mx-auto px-2 flex gap-1">
          {[{id:'inicio',label:'🏠 Inicio'},{id:'tienda',label:'🛍️ Tienda'},{id:'perfil',label:'👤 Perfil'},{id:'carrito',label:`🛒 Carrito (${cart.length})`}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab===t.id?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <main className="max-w-[1080px] mx-auto p-4">
        {tab==='inicio' && (
          <div className="space-y-4">
            <div className="p-4 rounded-[14px] bg-[#161b23] border border-[#2a323d]">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:profile?.avatar_color}}>{profile?.username?.[0]}</div>
                <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="¿Qué piensas?" className="flex-1 min-h-[60px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none" />
              </div>
              {attachments.length>0 && <div className="mt-3 flex gap-2 flex-wrap">{attachments.map((a,i)=><div key={i} className="relative"><img src={a.url} className="w-20 h-20 object-cover rounded-lg" /><button onClick={()=>setAttachments(attachments.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs">✕</button></div>)}</div>}
              <div className="mt-3 flex justify-between">
                <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] text-xs">🖼️</button>
                <input ref={fileInputRef} type="file" multiple hidden onChange={e=>{ const files=Array.from((e.target as any).files||[]); files.forEach((f:any)=>{ const url=URL.createObjectURL(f); setAttachments(a=>[...a,{name:f.name, url}]) }) }} />
                <button onClick={handlePublish} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Publicar</button>
              </div>
            </div>
            {filteredPosts.map(p=>(
              <div key={p.id} className="p-4 rounded-[14px] bg-[#161b23] border border-[#2a323d]">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:p.author?.avatar_color||'#7c5cff'}}>{p.author?.username?.[0]}</div>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center"><span className="font-bold text-sm">{p.author?.username}</span><span className="text-[11px] text-[#8b97a8]">{new Date(p.created_at).toLocaleTimeString()}</span></div>
                    <p className="mt-2 text-sm">{p.text}</p>
                    {p.media?.length>0 && <div className="mt-3 grid grid-cols-2 gap-2">{p.media.map((m:any,i:number)=><img key={i} src={m.url} className="rounded-xl max-h-60 object-cover" />)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='tienda' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Tienda · {filteredProducts.length}</h1>
              <button onClick={()=>setProdModal(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white text-sm font-bold">＋ Publicar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p=>{
                const left=daysLeft(p.expires_at)
                return (
                  <div key={p.id} className="rounded-[14px] bg-[#161b23] border border-[#2a323d] overflow-hidden">
                    <div className="relative h-48 bg-[#0e1116]">
                      {p.images?.[0]?<img src={p.images[0].url} className="w-full h-full object-cover" />:<div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>}
                      {left<=5 && <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-[#ffb020] text-black text-[10px] font-bold">Por vencer {left}d</span>}
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#0e1116]/80 text-[10px]">{p.category}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{p.title}</h3>
                      <p className="text-[#00d4b1] font-black">${p.price.toLocaleString()} COP</p>
                      <p className="text-[11px] text-[#8b97a8]">Expira en {left} días</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>handleAddToCart(p)} className="flex-1 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs">🛒 Agregar</button>
                        <button onClick={()=>handleRenew(p)} className="px-3 py-2 rounded-xl bg-[#7c5cff] text-white text-xs">🔄</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='perfil' && profile && (
          <div className="p-6 rounded-[14px] bg-[#161b23] border border-[#2a323d]">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white" style={{background:profile.avatar_color}}>{profile.username[0]}</div>
              <div>
                <h2 className="text-xl font-bold">{profile.username}</h2>
                <p className="text-sm text-[#8b97a8]">{profile.bio||'Miembro Elraizer'}</p>
                <p className="text-xs mt-2">⭐ {profile.points} puntos</p>
              </div>
            </div>
          </div>
        )}

        {tab==='carrito' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Carrito {cart.length}</h1>
            {cart.map(c=><div key={c.product.id} className="p-3 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between"><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#8b97a8]">x{c.qty} ${c.product.price}</p></div><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="text-xs px-3 py-1 rounded-lg bg-[#1d242e] border border-[#2a323d]">Quitar</button></div>)}
            {cart.length>0 && <div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><p className="font-bold">Total ${cart.reduce((s,c)=>s+c.product.price*c.qty,0).toLocaleString()}</p><button onClick={handleCheckout} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">Finalizar y contactar vendedores</button></div>}
          </div>
        )}
      </main>

      {prodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Publicar producto</h2><button onClick={()=>setProdModal(false)} className="w-8 h-8 rounded-full bg-[#1d242e]">✕</button></div>
            <div className="space-y-3">
              <input value={prodForm.title} onChange={e=>setProdForm({...prodForm, title:e.target.value})} placeholder="Titulo" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <div className="flex gap-2"><input value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} type="number" placeholder="Precio COP" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="px-3 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <textarea value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Descripcion" className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <input value={prodForm.location} onChange={e=>setProdForm({...prodForm, location:e.target.value})} placeholder="Ubicacion" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <div className="p-3 rounded-xl bg-[#0e1116] border border-dashed border-[#2a323d]"><p className="text-xs text-[#8b97a8] mb-2">Fotos hasta 5</p><div className="flex gap-2 flex-wrap">{prodForm.images.map((img:any,i:number)=><div key={i} className="relative"><img src={img.url} className="w-16 h-16 object-cover rounded-lg" /><button onClick={()=>setProdForm({...prodForm, images:prodForm.images.filter((_:any,j:number)=>j!==i)})} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px]">✕</button></div>)}</div><button onClick={()=>prodFileRef.current?.click()} className="mt-2 px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] text-xs">Añadir fotos</button><input ref={prodFileRef} type="file" multiple accept="image/*" hidden onChange={handleProdFiles} /></div>
              <button onClick={handlePublishProduct} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">Publicar 🚀</button>
            </div>
          </div>
        </div>
      )}

      {showMaster && profile?.chat_role==='master' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-auto rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-black">Panel Maestro</h2><button onClick={()=>setShowMaster(false)} className="w-8 h-8 rounded-full bg-[#1d242e]">✕</button></div>
            <div className="flex gap-2 mb-4">
              {[{id:'usuarios',label:'Usuarios'},{id:'contenido',label:'Contenido'},{id:'productos',label:'Vencidos'}].map(t=><button key={t.id} onClick={()=>setMasterTab(t.id)} className={`px-3 py-1.5 rounded-full text-xs border ${masterTab===t.id?'bg-[#7c5cff] text-white border-[#7c5cff]':'bg-[#1d242e] border-[#2a323d] text-[#8b97a8]'}`}>{t.label}</button>)}
            </div>
            {masterTab==='usuarios' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#ffb020]/10 border border-[#ffb020]/30 text-xs">
                  <p className="font-bold text-[#ffb020]">Credenciales Maestro solo tu ves</p>
                  <p>Email: Ext3@elraizer.com</p>
                  <p>Pass: Elraizer5374e*</p>
                </div>
                <p className="text-xs text-[#8b97a8]">Control total: dar puntos, banear, suspender, eliminar, editar email/pass (en prod con admin API)</p>
              </div>
            )}
            {masterTab==='contenido' && <p className="text-xs text-[#8b97a8]">Eliminar posts, productos, comentarios con notificacion</p>}
            {masterTab==='productos' && <div className="space-y-2">{products.filter(p=>daysLeft(p.expires_at)<=5).map(p=><div key={p.id} className="p-2 rounded-lg bg-[#0e1116] border border-[#2a323d] flex justify-between text-xs"><span>{p.title} {daysLeft(p.expires_at)}d</span><button onClick={()=>handleRenew(p)} className="px-2 py-1 rounded bg-[#7c5cff] text-white">Renovar</button></div>)}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
