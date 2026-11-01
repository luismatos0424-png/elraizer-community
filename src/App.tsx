import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

const MASTER_USER = 'EXT3'
const CATEGORIES = ['Belleza','Tecnologia','Ropa','Hogar','Deporte','Otros']
const EMOJIS = ['😀','😂','😍','🥺','😎','🤔','👍','👏','🔥','❤️','💯','🎉','🙏','😅','🤣','😭','🥰','😱','🤩','👌','💪','✨','🚀','💬','⚠️','✅','❌','👑','🛡️']
const COLORS = ['#7c5cff','#00d4b1','#ffb020','#ff5470','#22c55e','#3b82f6','#ec4899','#f59e0b']
const RANKS = [{name:'Novato', min:0, max:99, color:'#8b97a8'},{name:'Colaborador', min:100, max:499, color:'#00d4b1'},{name:'Veterano', min:500, max:999, color:'#3b82f6'},{name:'Maestro', min:1000, max:999999, color:'#ffb020'}]
const getRank = (pts:number) => RANKS.find(r=>pts>=r.min && pts<=r.max) || RANKS[0]
const CHAT_ROLES = ['nuevo','colaborador','veterano','antiguo','moderador','maestro','master'] as const

type Profile = { id:string, username:string, avatar_color:string, avatar_url?:string, role:string, chat_role:string, points:number, bio?:string, email?:string, banned?:boolean, muted?:boolean, created_at:string, last_seen?:string }
type Post = { id:string, author_id:string, text:string, tags:string[], media:any[], likes:string[], created_at:string, author?:Profile }
type Product = { id:string, seller_id:string, title:string, price:number, category:string, description?:string, images:any[], location?:string, created_at:string, expires_at:string, seller?:Profile }

export default function App(){
  const [authUser,setAuthUser]=useState<any>(null)
  const [profile,setProfile]=useState<Profile|null>(null)
  const [profiles,setProfiles]=useState<Profile[]>([])
  const [posts,setPosts]=useState<Post[]>([])
  const [products,setProducts]=useState<Product[]>([])
  const [chatMsgs,setChatMsgs]=useState<any[]>([])
  const [directMsgs,setDirectMsgs]=useState<any[]>([])
  const [onlineProfiles,setOnlineProfiles]=useState<Profile[]>([])
  const [onlineUsers,setOnlineUsers]=useState<Record<string,boolean>>({})
  const [tab,setTab]=useState('inicio')
  const [newPost,setNewPost]=useState('')
  const [attachments,setAttachments]=useState<any[]>([])
  const [newChat,setNewChat]=useState('')
  const [newDirect,setNewDirect]=useState('')
  const [selectedChatUser,setSelectedChatUser]=useState<Profile|null>(null)
  const [selectedCategory,setSelectedCategory]=useState('Todos')
  const [prodModal,setProdModal]=useState(false)
  const [prodForm,setProdForm]=useState({title:'', price:'', category:'Belleza', description:'', location:'', images:[] as any[]})
  const [cart,setCart]=useState<{product:Product, qty:number}[]>([])
  const [showMaster,setShowMaster]=useState(false)
  const [logoClicks,setLogoClicks]=useState(0)
  const [theme,setTheme]=useState('dark')
  const [obUsername,setObUsername]=useState('')
  const [obColor,setObColor]=useState(COLORS[0])
  const [obBio,setObBio]=useState('')
  const [showEmojiPicker,setShowEmojiPicker]=useState(false)
  const [editEmail,setEditEmail]=useState('')
  const fileInputRef=useRef<HTMLInputElement>(null)
  const prodFileRef=useRef<HTMLInputElement>(null)
  const avatarFileRef=useRef<HTMLInputElement>(null)
  const chatEndRef=useRef<HTMLDivElement>(null)

  const daysLeft = (exp:string) => Math.max(0, Math.ceil((new Date(exp).getTime()-Date.now())/86400000))

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ if(data.session) setAuthUser(data.session.user) })
    const {data:listener} = supabase.auth.onAuthStateChange(async(_,session)=>{
      if(session?.user){
        setAuthUser(session.user)
        const {data:existing}=await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if(existing){
          let profToSet = existing as any
          if(session.user.email?.toLowerCase()==='ext3@elraizer.com' && profToSet.chat_role!=='master'){
            const {data:upgraded}=await supabase.from('profiles').update({role:'admin', chat_role:'master', points:999, username:'EXT3', avatar_color:'#ffb020'}).eq('id', session.user.id).select().single()
            if(upgraded) profToSet = upgraded as any
          }
          setProfile(profToSet)
          await supabase.from('profiles').update({last_seen:new Date().toISOString()}).eq('id', session.user.id)
        } else {
          const email=session.user.email||''
          const isMaster=email.toLowerCase()==='ext3@elraizer.com'
          const username=isMaster?MASTER_USER:email.split('@')[0]||'User'+Math.floor(Math.random()*1000)
          const {data:newProf}=await supabase.from('profiles').upsert({id:session.user.id, username, avatar_color:isMaster?'#ffb020':'#7c5cff', role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo', bio:isMaster?'Fundador':'', points:isMaster?999:0, email}, {onConflict:'id'}).select().single()
          if(newProf) setProfile(newProf as any)
        }
      } else { setAuthUser(null); setProfile(null) }
    })
    return ()=>listener.subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!profile) return
    const loadAll=async()=>{
      const [{data:profs},{data:postsData},{data:prods},{data:chats},{data:dms}] = await Promise.all([
        supabase.from('profiles').select('*').order('points',{ascending:false}),
        supabase.from('posts').select('*, author:profiles!posts_author_id_fkey(*)').order('created_at',{ascending:false}).limit(50),
        supabase.from('products').select('*, seller:profiles!products_seller_id_fkey(*)').order('created_at',{ascending:false}),
        supabase.from('chat_messages').select('*, user:profiles!chat_messages_user_id_fkey(*)').order('created_at',{ascending:true}).limit(100),
        supabase.from('direct_messages').select('*').or(`from_id.eq.${profile.id},to_id.eq.${profile.id}`).order('created_at',{ascending:true}).limit(100)
      ])
      if(profs) setProfiles(profs as any)
      if(postsData) setPosts(postsData as any)
      if(prods) setProducts(prods as any)
      if(chats) setChatMsgs(chats as any)
      if(dms) setDirectMsgs(dms as any)
    }
    loadAll()
    const ch1=supabase.channel('realtime-all').on('postgres_changes',{event:'*', schema:'public', table:'profiles'},(p)=>{ if(p.eventType==='INSERT') setProfiles(prev=>[p.new as any, ...prev]); if(p.eventType==='UPDATE') setProfiles(prev=>prev.map(x=>x.id===p.new.id?{...x, ...p.new as any}:x)); if(p.eventType==='DELETE') setProfiles(prev=>prev.filter(x=>x.id!==p.old.id)) }).on('postgres_changes',{event:'INSERT', schema:'public', table:'posts'},(p)=>{ supabase.from('profiles').select('*').eq('id', p.new.author_id).single().then(({data})=>{ setPosts(prev=>[{...(p.new as any), author:data} as any, ...prev]) }) }).on('postgres_changes',{event:'INSERT', schema:'public', table:'chat_messages'},(p)=>{ supabase.from('profiles').select('*').eq('id', p.new.user_id).single().then(({data})=>{ setChatMsgs(prev=>[...prev, {...p.new as any, user:data}]); setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),100) }) }).on('postgres_changes',{event:'INSERT', schema:'public', table:'direct_messages'},(p)=>{ setDirectMsgs(prev=>[...prev, p.new as any]) }).subscribe()
    const presence=supabase.channel('online-presence').on('presence',{event:'sync'},()=>{ const state=presence.presenceState(); const users=Object.values(state).flat() as any[]; setOnlineProfiles(users.map((u:any)=>u.profile).filter(Boolean) as any); const map:Record<string,boolean>={}; users.forEach((u:any)=>{ if(u.profile?.id) map[u.profile.id]=true }); setOnlineUsers(map) }).subscribe(async()=>{ await presence.track({profile}) })
    return ()=>{ supabase.removeChannel(ch1); supabase.removeChannel(presence) }
  },[profile])

  const handleAuth=async(isLogin:boolean)=>{
    const email=editEmail.trim()
    const pass=(document.getElementById('pass') as HTMLInputElement)?.value
    if(!email||!pass){ alert('Email y contraseña'); return }
    if(isLogin){
      const {error}=await supabase.auth.signInWithPassword({email, password:pass})
      if(error) alert(error.message)
    } else {
      if(!obUsername.trim()){ alert('Username'); return }
      const {data,error}=await supabase.auth.signUp({email, password:pass})
      if(error){ alert(error.message); return }
      if(data.user){
        const isMaster=email.toLowerCase()==='ext3@elraizer.com'
        await supabase.from('profiles').upsert({id:data.user.id, username:isMaster?MASTER_USER:obUsername, avatar_color:isMaster?'#ffb020':obColor, bio:obBio, role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo', points:isMaster?999:0, email}, {onConflict:'id'})
        alert('Cuenta creada, ya puedes entrar')
      }
    }
  }

  const handleLogout=async()=>{ await supabase.auth.signOut(); setProfile(null); setAuthUser(null) }

  const handlePublish=async()=>{
    if(!newPost.trim()&&attachments.length===0) return
    if(profile?.banned){ alert('Baneado'); return }
    const today = new Date().toISOString().split('T')[0]
    const {data:todayPosts}=await supabase.from('posts').select('id').eq('author_id', profile?.id).gte('created_at', today+'T00:00:00')
    const {data:todayChats}=await supabase.from('chat_messages').select('id').eq('user_id', profile?.id).gte('created_at', today+'T00:00:00')
    const dailyCount=(todayPosts?.length||0)+(todayChats?.length||0)
    if(dailyCount>=10 && profile?.chat_role!=='master'){ alert('⚠️ Límite 10 pts/día alcanzado. Vuelve mañana.'); }
    const {data,error}=await supabase.from('posts').insert({author_id:profile?.id, text:newPost, tags:newPost.match(/#\w+/g)||[], media:attachments, likes:[]}).select().single()
    if(error) alert(error.message)
    else{
      const {data:authorData}=await supabase.from('profiles').select('*').eq('id', profile?.id).single()
      setPosts([{...data, author:authorData} as any, ...posts])
      if(dailyCount<10 || profile?.chat_role==='master'){
        await supabase.from('profiles').update({points:(profile?.points||0)+1}).eq('id', profile?.id)
        setProfile(prev=>prev?{...prev, points:prev.points+1}:null)
      }
    }
    setNewPost(''); setAttachments([])
  }

  const handleChatSend=async()=>{
    if(!newChat.trim()) return
    if(profile?.banned){ alert('Baneado'); return }
    if(profile?.muted){ alert('🔇 Muteado por moderador'); return }
    const today=new Date().toISOString().split('T')[0]
    const {data:todayPosts}=await supabase.from('posts').select('id').eq('author_id', profile?.id).gte('created_at', today+'T00:00:00')
    const {data:todayChats}=await supabase.from('chat_messages').select('id').eq('user_id', profile?.id).gte('created_at', today+'T00:00:00')
    const dailyCount=(todayPosts?.length||0)+(todayChats?.length||0)
    if(dailyCount>=10 && profile?.chat_role!=='master' && profile?.chat_role!=='moderador'){ alert('⚠️ Límite 10 pts/día. Rango: '+getRank(profile?.points||0).name) }
    const {error}=await supabase.from('chat_messages').insert({user_id:profile?.id, text:newChat})
    if(error) alert(error.message)
    else{
      if(dailyCount<10 || profile?.chat_role==='master' || profile?.chat_role==='moderador'){
        await supabase.from('profiles').update({points:(profile?.points||0)+1, last_seen:new Date().toISOString()}).eq('id', profile?.id)
        setProfile(prev=>prev?{...prev, points:prev.points+1}:null)
      }
    }
    setNewChat('')
  }

  const handleDirectSend=async()=>{
    if(!newDirect.trim()||!selectedChatUser) return
    const {error}=await supabase.from('direct_messages').insert({from_id:profile?.id, to_id:selectedChatUser.id, text:newDirect})
    if(!error) setNewDirect('')
  }

  const handleFileUpload=async(files:FileList|null,isProduct=false)=>{
    if(!files) return
    const arr=Array.from(files).slice(0,5)
    const uploaded:any[]=[]
    for(const f of arr){
      if(f.size>10*1024*1024){ alert('Max 10MB'); continue }
      const url=URL.createObjectURL(f)
      uploaded.push({url, name:f.name, type:f.type})
    }
    if(isProduct) setProdForm({...prodForm, images:[...prodForm.images, ...uploaded]})
    else setAttachments([...attachments, ...uploaded])
  }

  const handlePublishProduct=async()=>{
    if(!prodForm.title||!prodForm.price){ alert('Título y precio'); return }
    const {data,error}=await supabase.from('products').insert({seller_id:profile?.id, title:prodForm.title, price:Number(prodForm.price), category:prodForm.category, description:prodForm.description, location:prodForm.location, images:prodForm.images}).select().single()
    if(error) alert(error.message)
    else{
      const {data:sellerData}=await supabase.from('profiles').select('*').eq('id', profile?.id).single()
      setProducts([{...data, seller:sellerData} as any, ...products])
      setProdModal(false)
      setProdForm({title:'', price:'', category:'Belleza', description:'', location:'', images:[]})
    }
  }

  const handleCheckout=async()=>{
    if(cart.length===0) return alert('Carrito vacío')
    let sent=0
    for(const item of cart){
      const text=`Hola ${item.product.seller?.username||'vendedor'}, soy ${profile?.username} (${profile?.email}). Quiero comprar ${item.product.title} x${item.qty} por ${item.product.price} COP. Total: ${item.product.price*item.qty} COP. Ubicación: ${item.product.location||'No especificada'}.`
      try{ const {error}=await supabase.from('direct_messages').insert({from_id:profile?.id, to_id:item.product.seller_id, text}); if(!error) sent++ }catch(e){ console.error(e) }
    }
    alert(`✅ Pedido enviado (${sent}/${cart.length}) - Revisa Mensajes`)
    setCart([]); setTab('mensajes')
  }

  const filteredProducts=selectedCategory==='Todos'?products:products.filter(p=>p.category===selectedCategory)
  const filteredPosts=posts
  const onlineCount=onlineProfiles.length||Object.keys(onlineUsers).length

  if(!authUser){
    return (
      <div className="min-h-screen bg-[#0e1116] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-[24px] bg-[#161b23] border border-[#2a323d]">
          <div className="text-center mb-6"><h1 className="text-3xl font-black">◈ Elraizer</h1><p className="text-sm text-[#8b97a8] mt-2">Comunidad Spa</p></div>
          <div className="space-y-4">
            <input value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
            <input id="pass" type="password" placeholder="Contraseña" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
            <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d] space-y-3">
              <p className="text-xs font-bold text-[#8b97a8]">Solo registro:</p>
              <input value={obUsername} onChange={e=>setObUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 rounded-lg bg-[#161b23] border border-[#2a323d] text-xs" />
              <div className="flex gap-2">{COLORS.map(c=><button key={c} onClick={()=>setObColor(c)} className={`w-6 h-6 rounded-full border-2 ${obColor===c?'border-white':'border-transparent'}`} style={{background:c}} />)}</div>
              <input value={obBio} onChange={e=>setObBio(e.target.value)} placeholder="Bio corta" className="w-full px-3 py-2 rounded-lg bg-[#161b23] border border-[#2a323d] text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3"><button onClick={()=>handleAuth(true)} className="py-3 rounded-xl bg-[#1d242e] border border-[#2a323d] font-bold text-sm">Entrar</button><button onClick={()=>handleAuth(false)} className="py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] font-bold text-sm">Crear cuenta</button></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme==='dark'?'bg-[#0e1116] text-white':'bg-[#f5f5f7] text-black'}`}>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#161b23]/90 border-b border-[#2a323d]">
        <div className="max-w-[1300px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>{ setLogoClicks(c=>c+1); if(logoClicks+1>=5 && profile?.chat_role==='master') setShowMaster(true); setTimeout(()=>setLogoClicks(0),3000) }} className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] flex items-center justify-center font-black">◈</button>
            <span className="font-black text-lg">Elraizer</span>
            {profile?.chat_role==='master' && <><span className="cursor-pointer text-[#ffb020] text-lg ml-1 animate-pulse" onClick={()=>setShowMaster(true)} title="Panel Maestro">👑</span><button onClick={()=>setShowMaster(true)} className="hidden md:flex ml-2 px-3 py-1 rounded-full bg-[#ffb020]/20 border border-[#ffb020]/30 text-[11px] font-black text-[#ffb020]">👑 Panel Maestro</button></>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:profile?.avatar_color}}>{(profile as any)?.avatar_url ? <img src={(profile as any).avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : profile?.username[0].toUpperCase()}</div>
            <span className="text-sm font-bold hidden md:block">{profile?.username}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1d242e] border border-[#2a323d]">{getRank(profile?.points||0).name}</span>
          </div>
        </div>
        <div className="max-w-[1300px] mx-auto px-4 flex gap-1 overflow-x-auto border-t border-[#2a323d]/50">
          <button onClick={()=>setTab('inicio')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='inicio'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🏠 Inicio</button>
          <button onClick={()=>setTab('chat')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='chat'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>💬 Chat</button>
          <button onClick={()=>setTab('tienda')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='tienda'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🛍️ Tienda</button>
          <button onClick={()=>setTab('mensajes')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='mensajes'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>✉️ Mensajes {directMsgs.length>0&&`(${directMsgs.length})`}</button>
          <button onClick={()=>setTab('perfil')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='perfil'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>👤 Perfil</button>
          <button onClick={()=>setTab('carrito')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='carrito'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🎒 Carrito {cart.length>0&&`(${cart.length})`}</button>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto p-4 md:p-6">
        {tab==='inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="¿Qué creas? #tags" className="w-full min-h-[70px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none focus:border-[#7c5cff]" />
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
                      {(profile?.chat_role==='master' || profile?.id===p.author_id) && <button onClick={async()=>{ await supabase.from('posts').delete().eq('id', p.id); setPosts(posts.filter(x=>x.id!==p.id)) }} className="mt-3 text-[11px] px-2 py-1 rounded bg-red-500/20 text-red-400">Borrar</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <h3 className="font-bold mb-3">Conectados ahora ({onlineProfiles.length})</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {profiles.slice(0,10).map(pr=>{
                    const isOnline=onlineProfiles.some(o=>o.id===pr.id) || onlineUsers[pr.id]
                    return <div key={pr.id} className="flex items-center gap-2 text-sm"><div className="relative"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23]" />}</div><div className="flex-1"><p className="font-bold text-xs">{pr.username} {isOnline&&'🟢'}</p><p className="text-[10px] text-[#8b97a8]">{pr.chat_role} • {pr.points} pts</p></div></div>
                  })}
                </div>
              </div>
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold mb-3">🏆 Top</h3>{profiles.slice(0,5).map(pr=><div key={pr.id} className="flex justify-between text-sm py-1"><span>{pr.username}</span><span className="text-[#ffb020]">{pr.points} pts</span></div>)}</div>
            </div>
          </div>
        )}

        {tab==='chat' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden flex flex-col h-[75vh]">
              <div className="p-4 border-b border-[#2a323d] flex justify-between items-center"><h2 className="font-black">💬 Chat Realtime</h2><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00d4b1] animate-pulse" /><span className="text-xs text-[#8b97a8]">{onlineCount} conectados • {chatMsgs.length} msgs</span></div></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMsgs.map(m=>{
                  const isOwn=m.user_id===profile?.id
                  const isMod=profile?.chat_role==='moderador' || profile?.chat_role==='master' || profile?.role==='admin'
                  const canModerate=isMod && m.user_id!==profile?.id
                  return (
                    <div key={m.id} className={`flex gap-3 group ${isOwn?'flex-row-reverse':''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:m.user?.avatar_color||'#7c5cff'}}>{m.user?.username?.[0]?.toUpperCase()}</div>
                      <div className={`flex-1 flex flex-col ${isOwn?'items-end':''}`}>
                        <div className={`flex gap-2 items-center flex-wrap ${isOwn?'flex-row-reverse':''}`}>
                          <span className="text-sm font-bold">{m.user?.username}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${m.user?.chat_role==='moderador'?'bg-[#00d4b1]/20 border-[#00d4b1]/30 text-[#00d4b1]':m.user?.chat_role==='master'?'bg-[#ffb020]/20 border-[#ffb020]/30 text-[#ffb020]':'bg-[#1d242e] border-[#2a323d] text-[#8b97a8]'}`}>{m.user?.chat_role==='moderador'?'🛡️ moderador':m.user?.chat_role==='master'?'👑 master':m.user?.chat_role} • {getRank(m.user?.points||0).name}</span>
                          <span className="text-[10px] text-[#8b97a8]">{new Date(m.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className={`mt-1 max-w-[75%] p-3 rounded-2xl text-sm break-words ${isOwn?'bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white rounded-br-sm':'bg-[#1d242e] border border-[#2a323d] rounded-bl-sm'}`}><p>{m.text}</p></div>
                        {canModerate && <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition"><button onClick={async()=>{ if(confirm('Borrar mensaje de '+m.user?.username+'?')){ await supabase.from('chat_messages').delete().eq('id', m.id); setChatMsgs(chatMsgs.filter(x=>x.id!==m.id)) } }} className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 text-[10px]">🗑️</button><button onClick={async()=>{ if(confirm('Mutear a '+m.user?.username+'?')){ await supabase.from('profiles').update({muted:true}).eq('id', m.user_id) } }} className="w-6 h-6 rounded-full bg-[#ffb020]/20 border border-[#ffb020]/30 text-[10px]">🔇</button><button onClick={async()=>{ if(confirm('Banear a '+m.user?.username+'?')){ await supabase.from('profiles').update({banned:true}).eq('id', m.user_id) } }} className="w-6 h-6 rounded-full bg-[#ff5470]/20 border border-[#ff5470]/30 text-[10px]">🚫</button></div>}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>
              {showEmojiPicker && <div className="p-3 border-t border-[#2a323d] bg-[#0e1116] flex gap-2 flex-wrap max-h-[120px] overflow-y-auto">{EMOJIS.map(em=><button key={em} onClick={()=>{setNewChat(prev=>prev+em); setShowEmojiPicker(false)}} className="w-9 h-9 rounded-lg bg-[#1d242e] border border-[#2a323d] hover:bg-[#7c5cff]/20 text-lg">{em}</button>)}<button onClick={()=>setShowEmojiPicker(false)} className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 text-xs">✕</button></div>}
              <div className="p-4 border-t border-[#2a323d] flex gap-2 items-center"><button onClick={()=>setShowEmojiPicker(!showEmojiPicker)} className="w-11 h-11 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xl hover:bg-[#7c5cff]/20">😀</button><input value={newChat} onChange={e=>setNewChat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleChatSend()} placeholder="Mensaje con emojis, moderado, max 10/día" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><button onClick={handleChatSend} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Enviar</button></div>
              {(profile?.chat_role==='moderador' || profile?.chat_role==='master') && <div className="px-4 pb-3 text-[11px] text-[#00d4b1] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00d4b1] animate-pulse" />🛡️ Eres moderador - puedes borrar, mutear y banear</div>}
            </div>
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] p-4 h-[75vh] overflow-y-auto">
              <h3 className="font-bold mb-3">Conectados ({onlineProfiles.length})</h3>
              <div className="space-y-2">
                {profiles.map(pr=>{
                  const isOnline=onlineProfiles.some(o=>o.id===pr.id) || !!onlineUsers[pr.id]
                  return (
                    <div key={pr.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#1d242e]">
                      <div className="relative"><div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23] animate-pulse" />}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{pr.username} {isOnline&&'🟢'}</p><p className="text-[11px] text-[#8b97a8]">{pr.chat_role} • {pr.points} pts</p></div>
                      <button onClick={()=>{ setSelectedChatUser(pr); setTab('mensajes') }} className="text-[10px] px-2 py-1 rounded-full bg-[#7c5cff]/20 text-[#a78bfa]">Mensaje</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {tab==='tienda' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div><h1 className="text-2xl font-black">Marketplace PRO</h1><p className="text-sm text-[#8b97a8]">Expira 30d, Por vencer, Renovar, Checkout</p></div>
              <button onClick={()=>setProdModal(true)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white text-sm font-black">+ Publicar PRO</button>
            </div>
            <div className="flex gap-2 overflow-x-auto"><button onClick={()=>setSelectedCategory('Todos')} className={`px-4 py-2 rounded-full text-xs font-bold ${selectedCategory==='Todos'?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>Todos</button>{CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-xs font-bold ${selectedCategory===c?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>{c}</button>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(p=>{
                const left=daysLeft(p.expires_at)
                return (
                  <div key={p.id} className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden group hover:border-[#7c5cff]/30 transition">
                    <div className="relative h-52 bg-[#0e1116]">{p.images?.[0]?<img src={p.images[0].url} className="w-full h-full object-cover group-hover:scale-[1.02] transition" alt="" />:<div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>}{left<=5 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#ffb020] text-black text-[10px] font-black">Por vencer {left}d</span>}<span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/80 text-[11px] border border-[#2a323d]">{p.category}</span><span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#0e1116]/90 text-[11px]">Expira en {left} días</span></div>
                    <div className="p-4"><h3 className="font-bold text-[15px]">{p.title}</h3><p className="text-[#00d4b1] font-black text-lg">${p.price.toLocaleString()} COP</p><p className="text-xs text-[#8b97a8] line-clamp-2">{p.description}</p><div className="flex items-center gap-2 mt-3"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:p.seller?.avatar_color}}>{p.seller?.username?.[0]}</div><span className="text-xs text-[#8b97a8]">{p.seller?.username}</span>{p.location && <span className="text-[10px] text-[#8b97a8]">• {p.location}</span>}</div><div className="mt-4 flex gap-2"><button onClick={()=>setCart(prev=>{ const ex=prev.find(c=>c.product.id===p.id); return ex?prev.map(c=>c.product.id===p.id?{...c, qty:c.qty+1}:c):[...prev,{product:p, qty:1}] })} className="flex-1 py-2.5 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold">Agregar</button>{(profile?.id===p.seller_id || profile?.chat_role==='master') && <button onClick={async()=>{ const newExp=new Date(Date.now()+30*24*60*60*1000).toISOString(); await supabase.from('products').update({expires_at:newExp}).eq('id', p.id); setProducts(products.map(x=>x.id===p.id?{...x, expires_at:newExp}:x)) }} className="px-3 py-2.5 rounded-xl bg-[#ffb020]/10 border border-[#ffb020]/20 text-xs font-bold text-[#ffb020]">Renovar 30d</button>}</div></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='mensajes' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[75vh]">
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] p-3 overflow-y-auto">
              <h3 className="font-bold mb-3">✉️ Mensajes ({directMsgs.length})</h3>
              <div className="space-y-1">
                {profiles.filter(pr=>pr.id!==profile?.id).map(pr=>{
                  const msgs=directMsgs.filter(m=>(m.from_id===pr.id&&m.to_id===profile?.id)||(m.from_id===profile?.id&&m.to_id===pr.id))
                  const last=msgs[msgs.length-1]
                  const isOnline=onlineProfiles.some(o=>o.id===pr.id) || !!onlineUsers[pr.id]
                  return (
                    <button key={pr.id} onClick={()=>setSelectedChatUser(pr)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${selectedChatUser?.id===pr.id?'bg-[#7c5cff]/20 border border-[#7c5cff]/30':'hover:bg-[#1d242e] border border-transparent'}`}>
                      <div className="relative"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23]" />}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{pr.username} {isOnline&&'🟢'}</p><p className="text-[11px] text-[#8b97a8] truncate">{last?.text||'Sin mensajes'}</p></div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] flex flex-col overflow-hidden">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-[#2a323d] flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{background:selectedChatUser.avatar_color}}>{selectedChatUser.username[0].toUpperCase()}</div><div><p className="font-bold text-sm">{selectedChatUser.username}</p><p className="text-[11px] text-[#8b97a8]">{selectedChatUser.chat_role} • {selectedChatUser.points} pts</p></div></div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {directMsgs.filter(m=>(m.from_id===profile?.id&&m.to_id===selectedChatUser.id)||(m.from_id===selectedChatUser.id&&m.to_id===profile?.id)).map(m=>{
                      const isOwn=m.from_id===profile?.id
                      return <div key={m.id} className={`flex ${isOwn?'justify-end':'justify-start'}`}><div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isOwn?'bg-[#7c5cff] text-white rounded-br-sm':'bg-[#1d242e] border border-[#2a323d] rounded-bl-sm'}`}><p>{m.text}</p><p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p></div></div>
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 border-t border-[#2a323d] flex gap-2"><input value={newDirect} onChange={e=>setNewDirect(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleDirectSend()} placeholder="Mensaje privado" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><button onClick={handleDirectSend} className="px-6 py-3 rounded-xl bg-[#7c5cff] text-white font-bold text-sm">Enviar</button></div>
                </>
              ) : <div className="flex-1 flex flex-col items-center justify-center text-[#8b97a8] text-sm p-8"><p className="text-4xl mb-3">✉️</p><p>Mensajería Realtime</p><p className="text-[11px] mt-2">Selecciona un usuario para chatear privado</p></div>}
            </div>
          </div>
        )}

        {tab==='perfil' && profile && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="p-6 md:p-8 rounded-[24px] bg-[#161b23] border border-[#2a323d]">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[24px] flex items-center justify-center text-3xl font-black text-white overflow-hidden border-2 border-[#2a323d]" style={{background:profile.avatar_color}}>
                    {(profile as any).avatar_url ? <img src={(profile as any).avatar_url} className="w-full h-full object-cover" alt="" /> : profile.username[0].toUpperCase()}
                  </div>
                  <button onClick={()=>avatarFileRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#7c5cff] border-2 border-[#161b23] flex items-center justify-center text-sm hover:bg-[#a78bfa]">📷</button>
                  <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ if(f.size>5*1024*1024){ alert('Max 5MB'); return } const url=URL.createObjectURL(f); setProfile({...profile, avatar_url:url} as any); await supabase.from('profiles').update({avatar_url:url}).eq('id', profile.id) } }} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black">{profile.username}</h2>
                    <span className="px-3 py-1 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 text-[11px] font-bold text-[#a78bfa]">{profile.chat_role}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{color:getRank(profile.points).color, background:getRank(profile.points).color+'15', borderColor:getRank(profile.points).color+'30'}}>{getRank(profile.points).name}</span>
                  </div>
                  <p className="text-sm text-[#8b97a8] mt-3">{profile.bio||'Miembro de la comunidad'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[#8b97a8] text-[10px]">Email</p><p className="font-bold truncate">{profile.email}</p></div>
                    <div className="p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[#8b97a8] text-[10px]">Puntos</p><p className="font-bold">{profile.points} pts</p></div>
                    <div className="p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[#8b97a8] text-[10px]">Miembro desde</p><p className="font-bold">{new Date(profile.created_at).toLocaleDateString()}</p></div>
                    <div className="p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[#8b97a8] text-[10px]">Rol</p><p className="font-bold">{profile.chat_role}</p></div>
                  </div>
                  <div className="mt-3 text-[11px] text-[#8b97a8] p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]">💡 Límite: 10 pts/día • Novato 0-99, Colaborador 100-499, Veterano 500-999, Maestro 1000+</div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs"><b>{profile.points}</b> pts</div>
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{posts.filter(p=>p.author_id===profile.id).length} posts</div>
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{products.filter(p=>p.seller_id===profile.id).length} productos</div>
                    <button onClick={()=>{ const newBio=prompt('Nueva bio', profile.bio||''); if(newBio!==null){ supabase.from('profiles').update({bio:newBio}).eq('id', profile.id); setProfile({...profile, bio:newBio} as any) } }} className="px-3 py-1.5 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 text-xs font-bold text-[#a78bfa]">✏️ Editar bio</button>
                  </div>
                  {profile?.chat_role==='master' && <div className="mt-4 flex gap-2"><button onClick={()=>setShowMaster(true)} className="px-5 py-2.5 rounded-xl bg-[#ffb020] text-black font-black text-sm">👑 Panel Maestro</button><span className="text-[11px] text-[#8b97a8] py-2.5">Ctrl+Shift+A o 5 clicks en ◈</span></div>}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <h3 className="font-bold mb-3">📝 Mis posts</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {posts.filter(p=>p.author_id===profile.id).slice(0,5).map(p=><div key={p.id} className="p-3 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs line-clamp-2">{p.text}</p><p className="text-[10px] text-[#8b97a8] mt-1">{new Date(p.created_at).toLocaleDateString()}</p></div>)}
                  {posts.filter(p=>p.author_id===profile.id).length===0 && <p className="text-xs text-[#8b97a8]">Sin posts</p>}
                </div>
              </div>
              <div className="p-5 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <h3 className="font-bold mb-3">⚙️ Config</h3>
                <div className="space-y-2">
                  <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-full p-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-xs flex justify-between"><span>Tema</span><span>{theme==='dark'?'🌙':'☀️'}</span></button>
                  <button onClick={handleLogout} className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold">Cerrar sesión</button>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-[#0e1116] border border-[#2a323d]">
                  <p className="text-[11px] font-bold mb-1">Progreso</p>
                  <div className="w-full h-2 rounded-full bg-[#1d242e] overflow-hidden"><div className="h-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa]" style={{width:`${Math.min(100, (profile.points % 100))}%`}} /></div>
                  <p className="text-[10px] text-[#8b97a8] mt-1">{profile.points} pts • Siguiente: {RANKS.find(r=>r.min>profile.points)?.name||'Maestro'} ({RANKS.find(r=>r.min>profile.points)?.min||1000} pts)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==='carrito' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-black">Carrito ({cart.length})</h1>
            {cart.map(c=><div key={c.product.id} className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between"><div className="flex gap-3"><img src={c.product.images?.[0]?.url} className="w-16 h-16 rounded-lg object-cover" alt="" /><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#00d4b1]">${c.product.price.toLocaleString()} COP x{c.qty}</p></div></div><div className="flex gap-2"><button onClick={()=>setCart(cart.map(x=>x.product.id===c.product.id?{...x, qty:Math.max(1, x.qty-1)}:x))} className="w-8 h-8 rounded-full bg-[#1d242e] border border-[#2a323d]">-</button><span className="py-1 px-2 text-sm">{c.qty}</span><button onClick={()=>setCart(cart.map(x=>x.product.id===c.product.id?{...x, qty:x.qty+1}:x))} className="w-8 h-8 rounded-full bg-[#1d242e] border border-[#2a323d]">+</button><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400">x</button></div></div>)}
            {cart.length>0 ? <><div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><p className="flex justify-between font-bold text-lg">Total: <span className="text-[#00d4b1]">${cart.reduce((s,c)=>s+c.product.price*c.qty,0).toLocaleString()} COP</span></p><p className="text-[11px] text-[#8b97a8] mt-2">Checkout envía mensaje automático al vendedor para pago directo</p></div><button onClick={handleCheckout} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4b1] to-[#7c5cff] text-white font-black text-lg">🛒 Checkout - Notificar vendedores</button></> : <div className="p-12 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-4xl mb-3">🎒</p><p className="text-[#8b97a8]">Carrito vacío - Agrega productos de Tienda</p><button onClick={()=>setTab('tienda')} className="mt-4 px-5 py-2.5 rounded-xl bg-[#7c5cff] text-white font-bold text-sm">Ir a Tienda</button></div>}
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
              <div onDragOver={e=>{e.preventDefault()}} onDrop={e=>{e.preventDefault(); handleFileUpload(e.dataTransfer.files,true)}} className="border-2 border-dashed rounded-xl p-6 text-center border-[#2a323d] bg-[#0e1116]">
                <p className="text-sm font-bold">Arrastra hasta 5 fotos</p><p className="text-[11px] text-[#8b97a8] mt-1">Máx 10MB c/u</p>
                <button onClick={()=>prodFileRef.current?.click()} className="mt-3 px-4 py-2 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xs font-bold">Seleccionar fotos</button>
                <input ref={prodFileRef} type="file" multiple accept="image/*" hidden onChange={e=>handleFileUpload(e.target.files,true)} />
                {prodForm.images.length>0 && <div className="mt-4 flex gap-2 flex-wrap justify-center">{prodForm.images.map((img:any,i:number)=><div key={i} className="relative"><img src={img.url} className="w-16 h-16 rounded-lg object-cover" alt="" /><button onClick={()=>setProdForm({...prodForm, images:prodForm.images.filter((_:any,j:number)=>j!==i)})} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button></div>)}</div>}
              </div>
              <button onClick={handlePublishProduct} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Publicar 30 días</button>
            </div>
          </div>
        </div>
      )}

      {showMaster && profile?.chat_role==='master' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black">👑 Panel Maestro Ghost - Control Total</h2><button onClick={()=>setShowMaster(false)} className="w-9 h-9 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[11px] text-[#8b97a8]">Usuarios</p><p className="text-2xl font-black">{profiles.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[11px] text-[#8b97a8]">Productos</p><p className="text-2xl font-black">{products.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[11px] text-[#8b97a8]">Posts</p><p className="text-2xl font-black">{posts.length}</p></div>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {profiles.map(u=>(
                <div key={u.id} className="p-3 rounded-xl bg-[#0e1116] border border-[#2a323d] flex flex-col gap-2">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:u.avatar_color}}>{u.username[0].toUpperCase()}</div><div><p className="text-sm font-bold">{u.username} <span className="text-[10px] text-[#8b97a8]">{u.email}</span></p><p className="text-[11px] text-[#8b97a8]">{u.chat_role} • {u.points} pts • {getRank(u.points).name}</p></div></div><span className="px-2 py-1 rounded bg-[#1d242e] border border-[#2a323d] text-[10px] font-bold" style={{color:getRank(u.points).color}}>{getRank(u.points).name}</span></div>
                  <div className="flex gap-1 flex-wrap items-center">
                    <span className="text-[10px] text-[#8b97a8] py-1">Rango:</span>
                    {CHAT_ROLES.map(role=><button key={role} onClick={async()=>{ await supabase.from('profiles').update({chat_role:role}).eq('id', u.id) }} className={`px-2 py-1 rounded text-[10px] font-bold ${u.chat_role===role?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>{role}</button>)}
                    <button onClick={async()=>{ await supabase.from('profiles').update({points:u.points+100}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#7c5cff] text-white text-[10px]">+100</button>
                    <button onClick={async()=>{ await supabase.from('profiles').update({banned:!u.banned}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#ffb020]/20 text-[#ffb020] text-[10px]">{u.banned?'Unban':'Ban'}</button>
                    <button onClick={async()=>{ await supabase.from('profiles').update({muted:!u.muted}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#2a323d] text-white text-[10px]">{u.muted?'Unmute':'Mute'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
