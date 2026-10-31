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
  const fileInputRef=useRef<HTMLInputElement>(null)
  const prodFileRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark') },[theme])

  useEffect(()=>{
    if(!isSupabaseConfigured){
      const savedSession=localStorage.getItem('elraizer_session')
      if(savedSession){
        setSession(JSON.parse(savedSession))
        setProfile(JSON.parse(localStorage.getItem('elraizer_profile')||'null'))
        setPosts(JSON.parse(localStorage.getItem('elraizer_posts')||'[]'))
        setProducts(JSON.parse(localStorage.getItem('elraizer_products')||'[]'))
        setCart(JSON.parse(localStorage.getItem('elraizer_cart')||'[]'))
      }
      return
    }
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const {data:listener}=supabase.auth.onAuthStateChange(async (_event, currentSession)=>{
      setSession(currentSession)
      if(currentSession?.user){
        const {data:existing}=await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single()
        if(!existing){
          const isMaster=currentSession.user.email?.toLowerCase()==='ext3@elraizer.com'
          const username=isMaster?MASTER_USER:(currentSession.user.email?.split('@')[0]||'Usuario')
          const {data:newProf}=await supabase.from('profiles').insert({
            id:currentSession.user.id, username, avatar_color:isMaster?'#ffb020':'#7c5cff',
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
          id, username:isMaster?MASTER_USER:obUsername, avatar_color:isMaster?'#ffb020':obColor,
          role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo',
          bio:isMaster?'Fundador':obBio, points:isMaster?999:0,
          created_at:new Date().toISOString(), email
        }
        localStorage.setItem('elraizer_session', JSON.stringify({user:{id,email}}))
        localStorage.setItem('elraizer_profile', JSON.stringify(prof))
        setSession({user:{id,email}}); setProfile(prof); setOnboarding(false)
      }else{
        if(email.toLowerCase()==='ext3@elraizer.com' && pass==='Elraizer5374e*'){
          const prof:Profile={
            id:'master_ext3', username:'EXT3', avatar_color:'#ffb020',
            role:'admin', chat_role:'master', bio:'Fundador',
            points:999, created_at:new Date().toISOString(), email
          }
          localStorage.setItem('elraizer_session', JSON.stringify({user:{id:prof.id,email}}))
          localStorage.setItem('elraizer_profile', JSON.stringify(prof))
          setSession({user:{id:prof.id,email}}); setProfile(prof); return
        }
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
    setSession(null); setProfile(null)
  }

  const handlePublish=async()=>{
    if(!newPost.trim()&&attachments.length===0) return
    const post:Post={
      id:'p_'+Date.now(), author_id:profile?.id||'', text:newPost,
      tags:newPost.match(/#\w+/g)||[], media:attachments,
      created_at:new Date().toISOString(), author:profile||undefined
    }
    if(!isSupabaseConfigured){
      const all=[post,...posts]; setPosts(all); localStorage.setItem('elraizer_posts', JSON.stringify(all))
    }else{
      const {data,error}=await supabase.from('posts').insert({
        author_id:profile?.id, text:newPost, tags:post.tags, media:attachments
      }).select().single()
      if(error) alert(error.message); else setPosts([{...data, author:profile} as any, ...posts])
    }
    setNewPost(''); setAttachments([])
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
      const all=[prod,...products]; setProducts(all); localStorage.setItem('elraizer_products', JSON.stringify(all))
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

  const daysLeft=(exp:string)=>Math.max(0, Math.ceil((new Date(exp).getTime()-Date.now())/(1000*60*60*24)))
  const filteredPosts=posts.filter(p=>!search||p.text.toLowerCase().includes(search.toLowerCase()))
  const filteredProducts=products.filter(p=>!search||p.title.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase()))

  if(!session){
    return (
      <div className="min-h-screen flex bg-[#0e1116] text-[#e9eef5]">
        <div className="flex-1 hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#161b23] to-[#0e1116] border-r border-[#2a323d]">
          <h1 className="text-4xl font-black mb-4">◈ Elraizer Spa Global</h1>
          <p className="text-[#8b97a8] mb-8">Comunidad premium y Marketplace global</p>
          <ul className="space-y-3 text-sm"><li>Chat moderado</li><li>Marketplace 30 dias</li><li>Rangos y puntos</li><li>Panel maestro stealth</li></ul>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px] bg-[#161b23] border border-[#2a323d] rounded-[20px] p-8">
            <h2 className="text-2xl font-bold mb-2">Elraizer Community</h2>
            <p className="text-sm text-[#8b97a8] mb-6">Acceso sin Google</p>
            <div className="flex gap-2 mb-6">
              <button onClick={()=>setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode==='login'?'bg-[#7c5cff] text-white':'bg-[#1d242e] text-[#8b97a8]'}`}>Login</button>
              <button onClick={()=>setAuthMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode==='register'?'bg-[#7c5cff] text-white':'bg-[#1d242e] text-[#8b97a8]'}`}>Registro</button>
            </div>
            {!onboarding ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full mb-3 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contrasena" className="w-full mb-4 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none" />
                <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">Entrar</button>
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
            <button onClick={handleLogo} className="font-black text-lg">◈ Elraizer Spa Global</button>
            {profile?.chat_role==='master' && <span className="opacity-30 hover:opacity-100 cursor-pointer text-[#ffb020]" onClick={()=>setShowMaster(true)}>👑</span>}
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
          <button onClick={()=>setTab('inicio')} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab==='inicio'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>Inicio</button>
          <button onClick={()=>setTab('tienda')} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab==='tienda'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>Tienda</button>
          <button onClick={()=>setTab('perfil')} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab==='perfil'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>Perfil</button>
          <button onClick={()=>setTab('carrito')} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab==='carrito'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>Carrito {cart.length}</button>
        </div>
      </div>
      <main className="max-w-[1080px] mx-auto p-4">
        {tab==='inicio' && (
          <div className="space-y-4">
            <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:profile?.avatar_color}}>{profile?.username?.[0]}</div>
                <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Que piensas?" className="flex-1 min-h-[60px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none" />
              </div>
              <div className="mt-3 flex justify-between">
                <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d] text-xs">Media</button>
                <input ref={fileInputRef} type="file" multiple hidden onChange={e=>{ const files=Array.from((e.target as any).files||[]); files.forEach((f:any)=>{ const url=URL.createObjectURL(f); setAttachments(a=>[...a,{name:f.name, url}]) }) }} />
                <button onClick={handlePublish} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Publicar</button>
              </div>
            </div>
            {filteredPosts.map(p=>(
              <div key={p.id} className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:p.author?.avatar_color||'#7c5cff'}}>{p.author?.username?.[0]}</div>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center"><span className="font-bold text-sm">{p.author?.username}</span><span className="text-[11px] text-[#8b97a8]">{new Date(p.created_at).toLocaleTimeString()}</span></div>
                    <p className="mt-2 text-sm">{p.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='tienda' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Tienda {filteredProducts.length}</h1>
              <button onClick={()=>setProdModal(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white text-sm font-bold">Publicar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p=>{
                const left=daysLeft(p.expires_at)
                return (
                  <div key={p.id} className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden">
                    <div className="relative h-48 bg-[#0e1116]">
                      {p.images?.[0]?<img src={p.images[0].url} className="w-full h-full object-cover" alt="" />:<div className="w-full h-full flex items-center justify-center text-3xl">Tienda</div>}
                      {left<=5 && <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-[#ffb020] text-black text-[10px] font-bold">Por vencer {left}d</span>}
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#0e1116]/80 text-[10px]">{p.category}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{p.title}</h3>
                      <p className="text-[#00d4b1] font-black">{p.price} COP</p>
                      <p className="text-[11px] text-[#8b97a8]">Expira en {left} dias</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>{ setCart(prev=>{ const ex=prev.find(c=>c.product.id===p.id); const upd=ex?prev.map(c=>c.product.id===p.id?{...c, qty:c.qty+1}:c):[...prev,{product:p, qty:1}]; localStorage.setItem('elraizer_cart', JSON.stringify(upd)); return upd } )}} className="flex-1 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs">Agregar</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {tab==='perfil' && profile && (
          <div className="p-6 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white" style={{background:profile.avatar_color}}>{profile.username[0]}</div>
              <div><h2 className="text-xl font-bold">{profile.username}</h2><p className="text-sm text-[#8b97a8]">{profile.bio||'Miembro'}</p><p className="text-xs mt-2">{profile.points} puntos</p></div>
            </div>
          </div>
        )}
        {tab==='carrito' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Carrito {cart.length}</h1>
            {cart.map(c=><div key={c.product.id} className="p-3 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between"><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#8b97a8]">x{c.qty} {c.product.price}</p></div><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="text-xs px-3 py-1 rounded-lg bg-[#1d242e] border border-[#2a323d]">Quitar</button></div>)}
          </div>
        )}
      </main>
      {prodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Publicar producto</h2><button onClick={()=>setProdModal(false)} className="w-8 h-8 rounded-full bg-[#1d242e]">X</button></div>
            <div className="space-y-3">
              <input value={prodForm.title} onChange={e=>setProdForm({...prodForm, title:e.target.value})} placeholder="Titulo" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <div className="flex gap-2"><input value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} type="number" placeholder="Precio COP" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="px-3 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <textarea value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Descripcion" className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <input value={prodForm.location} onChange={e=>setProdForm({...prodForm, location:e.target.value})} placeholder="Ubicacion" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <button onClick={handlePublishProduct} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold">Publicar</button>
            </div>
          </div>
        </div>
      )}
      {showMaster && profile?.chat_role==='master' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6"><div className="flex justify-between mb-4"><h2 className="text-xl font-black">Panel Maestro</h2><button onClick={()=>setShowMaster(false)} className="w-8 h-8 rounded-full bg-[#1d242e]">X</button></div><p className="text-xs text-[#8b97a8]">Control total EXT3</p></div>
        </div>
      )}
    </div>
  )
}
