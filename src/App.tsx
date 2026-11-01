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
  avatar_url?: string
  created_at: string
  banned?: boolean
  muted?: boolean
  last_seen?: string
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
type DirectMsg = { id: string; from_id: string; to_id: string; text: string; created_at: string; fromUser?: Profile; toUser?: Profile }

const MASTER_USER = 'EXT3'
const CATEGORIES = ['Diseño','Desarrollo','Electrónica','Ropa','Servicios','Hogar','Otros']
const EMOJIS = ['😀','😂','😍','🥺','😎','🤔','👍','👏','🔥','❤️','💯','🎉','🙏','😅','🤣','😭','🥰','😱','🤩','👌','💪','✨','🚀','💬','⚠️','✅','❌','👑','🛡️']
const COLORS = ['#7c5cff','#00d4b1','#ffb020','#ff5470','#22c55e','#3b82f6','#ec4899','#f59e0b']
const RANKS = [{name:'Novato', min:0, max:99, color:'#8b97a8'},{name:'Colaborador', min:100, max:499, color:'#00d4b1'},{name:'Veterano', min:500, max:999, color:'#3b82f6'},{name:'Maestro', min:1000, max:999999, color:'#ffb020'}]
const getRank = (pts:number) => RANKS.find(r=>pts>=r.min && pts<=r.max) || RANKS[0]
const CHAT_ROLES = ['nuevo','colaborador','veterano','antiguo','moderador','maestro','master'] as const


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
  const [profiles,setProfiles]=useState<Profile[]>([])
  const [onlineUsers,setOnlineUsers]=useState<Record<string, any>>({})
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
  const [showEmojiPicker,setShowEmojiPicker]=useState(false)
  const [loading,setLoading]=useState(true)
  const fileInputRef=useRef<HTMLInputElement>(null)
  const avatarFileRef=useRef<HTMLInputElement>(null)
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
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({data})=>{
      setCurrentAuth(data.session)
      if(!data.session) setLoading(false)
    })
    const {data:listener}=supabase.auth.onAuthStateChange(async (_event, newAuth)=>{
      setCurrentAuth(newAuth)
      if(newAuth?.user){
        const {data:existing}=await supabase.from('profiles').select('*').eq('id', newAuth.user.id).single()
        if(!existing){
          const isMaster=newAuth.user.email?.toLowerCase()==='ext3@elraizer.com'
          const username=isMaster?MASTER_USER:(newAuth.user.email?.split('@')[0]||'Usuario')
          const {data:newProf, error}=await supabase.from('profiles').upsert({
            id:newAuth.user.id, username, avatar_color:isMaster?'#ffb020':'#7c5cff',
            role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo',
            bio:isMaster?'Fundador Spa':'', points:isMaster?999:0, email:newAuth.user.email
          }, {onConflict:'id'}).select().single()
          if(error) console.error('Error creando perfil', error)
          if(newProf) setProfile(newProf as any)
        }else{
          let profToSet = existing as any
          if(newAuth.user.email?.toLowerCase()==='ext3@elraizer.com' && profToSet.chat_role!=='master'){
            const {data:upgraded}=await supabase.from('profiles').update({role:'admin', chat_role:'master', points:999, username:'EXT3', avatar_color:'#ffb020'}).eq('id', newAuth.user.id).select().single()
            if(upgraded) profToSet = upgraded as any
          }
          setProfile(profToSet)
          await supabase.from('profiles').update({last_seen:new Date().toISOString()}).eq('id', newAuth.user.id)
        }
        setLoading(false)
      }else{
        setLoading(false)
      }
    })
    return ()=>listener.subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!isSupabaseConfigured || !currentAuth?.user) return

    const loadAll=async()=>{
      const {data:profData}=await supabase.from('profiles').select('*').order('last_seen',{ascending:false}).limit(100)
      if(profData) setProfiles(profData as any)

      const {data:postsData}=await supabase.from('posts').select('*, profiles:author_id(*)').order('created_at',{ascending:false}).limit(100)
      if(postsData) setPosts(postsData.map((p:any)=>({...p, author:p.profiles})) as any)

      const now=new Date().toISOString()
      const {data:prodData}=await supabase.from('products').select('*, profiles:seller_id(*)').gt('expires_at', now).order('created_at',{ascending:false}).limit(100)
      if(prodData) setProducts(prodData.map((p:any)=>({...p, seller:p.profiles})) as any)

      const {data:chatData}=await supabase.from('chat_messages').select('*, profiles:user_id(*)').order('created_at',{ascending:true}).limit(200)
      if(chatData) setChatMsgs(chatData.map((c:any)=>({...c, user:c.profiles})) as any)

      const {data:directData}=await supabase.from('direct_messages').select('*, fromProfile:from_id(*), toProfile:to_id(*)').or(`from_id.eq.${currentAuth.user.id},to_id.eq.${currentAuth.user.id}`).order('created_at',{ascending:true}).limit(200)
      if(directData) setDirectMsgs(directData.map((d:any)=>({...d, fromUser:d.fromProfile, toUser:d.toProfile})) as any)
    }
    loadAll()

    const channelPosts=supabase.channel('posts-global').on('postgres_changes',{event:'*', schema:'public', table:'posts'}, async (payload)=>{
      if(payload.eventType==='INSERT'){
        const {data}=await supabase.from('profiles').select('*').eq('id', payload.new.author_id).single()
        setPosts(prev=>[{...(payload.new as any), author:data} as any, ...prev])
      }
      if(payload.eventType==='DELETE') setPosts(prev=>prev.filter(p=>p.id!==payload.old.id))
    }).subscribe()

    const channelProducts=supabase.channel('products-global').on('postgres_changes',{event:'*', schema:'public', table:'products'}, async (payload)=>{
      if(payload.eventType==='INSERT'){
        const {data}=await supabase.from('profiles').select('*').eq('id', payload.new.seller_id).single()
        setProducts(prev=>[{...(payload.new as any), seller:data} as any, ...prev])
      }
      if(payload.eventType==='DELETE') setProducts(prev=>prev.filter(p=>p.id!==payload.old.id))
      if(payload.eventType==='UPDATE'){
        setProducts(prev=>prev.map(p=>p.id===payload.new.id?{...p, ...(payload.new as any)}:p))
      }
    }).subscribe()

    const channelChat=supabase.channel('chat-global').on('postgres_changes',{event:'INSERT', schema:'public', table:'chat_messages'}, async (payload)=>{
      const {data}=await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single()
      setChatMsgs(prev=>[...prev, {...(payload.new as any), user:data} as any])
    }).on('postgres_changes',{event:'DELETE', schema:'public', table:'chat_messages'}, (payload)=>{
      setChatMsgs(prev=>prev.filter(c=>c.id!==payload.old.id))
    }).subscribe()

    const channelDirect=supabase.channel('direct-global').on('postgres_changes',{event:'INSERT', schema:'public', table:'direct_messages'}, async (payload)=>{
      if(payload.new.from_id===currentAuth.user.id || payload.new.to_id===currentAuth.user.id){
        const {data:fromProf}=await supabase.from('profiles').select('*').eq('id', payload.new.from_id).single()
        const {data:toProf}=await supabase.from('profiles').select('*').eq('id', payload.new.to_id).single()
        setDirectMsgs(prev=>[...prev, {...(payload.new as any), fromUser:fromProf, toUser:toProf} as any])
      }
    }).subscribe()

    const channelProfiles=supabase.channel('profiles-global').on('postgres_changes',{event:'*', schema:'public', table:'profiles'}, (payload)=>{
      if(payload.eventType==='INSERT') setProfiles(prev=>[payload.new as any, ...prev.filter(p=>p.id!==payload.new.id)])
      if(payload.eventType==='UPDATE') setProfiles(prev=>prev.map(p=>p.id===payload.new.id?{...(payload.new as any)}:p))
      if(payload.eventType==='DELETE') setProfiles(prev=>prev.filter(p=>p.id!==payload.old.id))
    }).subscribe()

    const presenceChannel=supabase.channel('online-users', {config:{presence:{key:currentAuth.user.id}}})
    presenceChannel.on('presence', {event:'sync'}, ()=>{
      const state=presenceChannel.presenceState()
      setOnlineUsers(state)
    }).on('presence', {event:'join'}, ({key, newPresences})=>{
      console.log('User joined', key, newPresences)
    }).on('presence', {event:'leave'}, ({key})=>{
      console.log('User left', key)
    }).subscribe(async (status)=>{
      if(status==='SUBSCRIBED'){
        await presenceChannel.track({user_id:currentAuth.user.id, username:profile?.username, online_at:new Date().toISOString()})
      }
    })

    const intervalExpiry=setInterval(async ()=>{
      const now=new Date().toISOString()
      const {data:expired}=await supabase.from('products').select('id').lt('expires_at', now)
      if(expired && expired.length>0){
        const ids=expired.map((p:any)=>p.id)
        await supabase.from('products').delete().in('id', ids)
      }
    },60000)

    return ()=>{
      supabase.removeChannel(channelPosts)
      supabase.removeChannel(channelProducts)
      supabase.removeChannel(channelChat)
      supabase.removeChannel(channelDirect)
      supabase.removeChannel(channelProfiles)
      supabase.removeChannel(presenceChannel)
      clearInterval(intervalExpiry)
    }
  },[currentAuth, profile?.username])

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}) },[chatMsgs,directMsgs])

  const handleLogo=()=>{
    const c=logoClicks+1
    setLogoClicks(c)
    if(c>=5 && profile?.chat_role==='master'){ setShowMaster(true); setLogoClicks(0) }
    setTimeout(()=>setLogoClicks(0),3000)
  }

  const handleAuth=async()=>{
    if(!isSupabaseConfigured){
      alert('Configura Supabase en Vercel: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY - esta web es, necesita Supabase')
      return
    }
    if(authMode==='register'){
      if(!onboarding){ setOnboarding(true); return }
      if(obUsername.length<3){ alert('Username min 3'); return }
      const {data,error}=await supabase.auth.signUp({email, password:pass})
      if(error){ alert(error.message); return }
      if(data.user){
        const isMaster=email.toLowerCase()==='ext3@elraizer.com'
        const {error:profError}=await supabase.from('profiles').upsert({
          id:data.user.id, username:isMaster?MASTER_USER:obUsername,
          avatar_color:isMaster?'#ffb020':obColor, bio:obBio,
          role:isMaster?'admin':'user', chat_role:isMaster?'master':'nuevo', points:isMaster?999:0, email
        }, {onConflict:'id'})
        if(profError) alert(profError.message)
        else{ setOnboarding(false); alert('Cuenta creada, revisa email para confirmar') }
      }
    }else{
      const {data,error}=await supabase.auth.signInWithPassword({email, password:pass})
      if(error){
        if(email.toLowerCase()==='ext3@elraizer.com' && pass==='Elraizer5374e*'){
          const {data:signUp}=await supabase.auth.signUp({email, password:pass})
          if(signUp.user){
            await supabase.from('profiles').upsert({id:signUp.user.id, username:MASTER_USER, avatar_color:'#ffb020', role:'admin', chat_role:'master', bio:'Fundador Spa Ghost', points:999, email}, {onConflict:'id'})
            alert('Cuenta maestra creada, ahora haz login')
          }
        }else alert(error.message)
      }else{
        setCurrentAuth(data.session)
      }
    }
  }

  const handleLogout=async()=>{
    await supabase.auth.signOut()
    setCurrentAuth(null); setProfile(null)
  }

  const handlePublish=async()=>{
    if(!newPost.trim()&&attachments.length===0) return
    if(profile?.banned){ alert('Baneado'); return }
    const today = new Date().toISOString().split('T')[0]
    const {data:todayPosts} = await supabase.from('posts').select('id').eq('author_id', profile?.id).gte('created_at', today+'T00:00:00')
    const {data:todayChats} = await supabase.from('chat_messages').select('id').eq('user_id', profile?.id).gte('created_at', today+'T00:00:00')
    const dailyCount = (todayPosts?.length||0)+(todayChats?.length||0)
    if(dailyCount>=10 && profile?.chat_role!=='master'){ alert('⚠️ Límite diario 10 pts alcanzado. Vuelve mañana. Moderadores y master sin límite.'); }
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
    if(profile?.muted){ alert('🔇 Muteado por moderador - no puedes escribir hasta que te desmuteen'); return }
    const today = new Date().toISOString().split('T')[0]
    const {data:todayPosts} = await supabase.from('posts').select('id').eq('author_id', profile?.id).gte('created_at', today+'T00:00:00')
    const {data:todayChats} = await supabase.from('chat_messages').select('id').eq('user_id', profile?.id).gte('created_at', today+'T00:00:00')
    const dailyCount = (todayPosts?.length||0)+(todayChats?.length||0)
    if(dailyCount>=10 && profile?.chat_role!=='master' && profile?.chat_role!=='moderador'){ alert('⚠️ Límite diario 10 pts alcanzado. Rango: '+getRank(profile?.points||0).name+' ('+profile?.points+' pts). Vuelve mañana.'); }
    const {error}=await supabase.from('chat_messages').insert({user_id:profile?.id, text:newChat})
    if(error) alert(error.message)
    else{
      if(dailyCount<10 || profile?.chat_role==='master' || profile?.chat_role==='moderador'){
        await supabase.from('profiles').update({points:(profile?.points||0)+1, last_seen:new Date().toISOString()}).eq('id', profile?.id)
        setProfile(prev=>prev?{...prev, points:prev.points+1}:null)
      } else {
        await supabase.from('profiles').update({last_seen:new Date().toISOString()}).eq('id', profile?.id)
      }
    }
    setNewChat('')
  }

  const handleDirectSend=async()=>{
    if(!newDirect.trim()||!selectedChatUser) return
    const {error}=await supabase.from('direct_messages').insert({from_id:profile?.id, to_id:selectedChatUser.id, text:newDirect})
    if(error) alert('Error enviando mensaje: '+error.message+' - asegúrate que existe tabla direct_messages con from_id, to_id, text')
    else setNewDirect('')
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
    const {data,error}=await supabase.from('products').insert({
      seller_id:profile?.id, title:prodForm.title, price:parseFloat(prodForm.price),
      category:prodForm.category, description:prodForm.description,
      images:prodForm.images, location:prodForm.location, expires_at:expires.toISOString()
    }).select().single()
    if(error) alert(error.message)
    else{
      const {data:sellerData}=await supabase.from('profiles').select('*').eq('id', profile?.id).single()
      setProducts([{...data, seller:sellerData} as any, ...products])
      setProdModal(false); setProdForm({title:'',price:'',category:'Otros',description:'',location:'',images:[]})
    }
  }

  const handleCheckout=async()=>{
    if(cart.length===0) return alert('Carrito vacío')
    let sent=0
    for(const item of cart){
      const sellerName=item.product.seller?.username||'vendedor'
      const text=`Hola ${sellerName}, soy ${profile?.username} (${profile?.email}). Quiero comprar ${item.product.title} x${item.qty} por ${item.product.price} COP. Total: ${item.product.price*item.qty} COP. Contactame para coordinar pago directo. Ubicación: ${item.product.location||'No especificada'}. Mi ID: ${profile?.id}`
      try{
        const {error}=await supabase.from('direct_messages').insert({from_id:profile?.id, to_id:item.product.seller_id, text})
        if(!error) sent++
      }catch(e){ console.error(e) }
    }
    alert(`✅ Pedido enviado (${sent}/${cart.length}) - Revisa Mensajes, el vendedor te contactará para pago directo.`)
    setCart([]); setTab('mensajes')
  }

  const daysLeft=(exp:string)=>Math.max(0, Math.ceil((new Date(exp).getTime()-Date.now())/(1000*60*60*24)))
  const filteredPosts=posts.filter(p=>!search||p.text.toLowerCase().includes(search.toLowerCase()))
  const filteredProducts=products.filter(p=>{
    const matchSearch=!search||p.title.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat=selectedCategory==='Todos'||p.category===selectedCategory
    return matchSearch && matchCat
  })
  const onlineCount=Object.keys(onlineUsers).length
  const onlineProfiles=profiles.filter(p=>{
    if(!p.last_seen) return false
    const diff=Date.now()-new Date(p.last_seen).getTime()
    return diff < 5*60*1000
  })

  if(loading) return <div className="min-h-screen bg-[#0e1116] flex items-center justify-center text-white">Cargando Elraizer...</div>

  if(!currentAuth){
    return (
      <div className="min-h-screen flex bg-[#0e1116] text-[#e9eef5]">
        <div className="flex-1 hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-[#161b23] via-[#1a1f2e] to-[#0e1116] border-r border-[#2a323d] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c5cff]/10 to-[#a78bfa]/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] flex items-center justify-center font-black text-xl">◈</div>
              <div><h1 className="text-3xl font-black">Elraizer</h1><p className="text-sm text-[#8b97a8]">Spa - World Connected</p></div>
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">Comunidad<br/>100% Supabase Realtime</h2>
            <p className="text-[#8b97a8] mb-8 max-w-md">Chat con usuarios conectados en tiempo real, mensajería directa mundial, feed, marketplace 30d, panel maestro ghost. Nada local, todo Supabase.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">💬</p><p className="text-sm font-bold">Chat</p><p className="text-xs text-[#8b97a8]">Realtime + usuarios conectados</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">✉️</p><p className="text-sm font-bold">Mensajería</p><p className="text-xs text-[#8b97a8]">Directa Supabase + checkout auto</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">🛒</p><p className="text-sm font-bold">Marketplace PRO</p><p className="text-xs text-[#8b97a8]">30d + Por vencer</p></div>
              <div className="p-4 rounded-xl bg-[#1d242e] border border-[#2a323d]"><p className="text-2xl mb-1">👑</p><p className="text-sm font-bold">Panel Ghost</p><p className="text-xs text-[#8b97a8]">Control total mundial</p></div>
            </div>
            {!isSupabaseConfigured && <div className="mt-8 p-4 rounded-xl bg-red-500/20 border border-red-500/30"><p className="text-sm font-bold text-red-400">⚠️ Supabase no configurado</p><p className="text-xs text-[#8b97a8] mt-1">Configura en Vercel: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Crea tablas: profiles, posts, products, chat_messages, direct_messages</p></div>}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0e1116]">
          <div className="w-full max-w-[420px] bg-[#161b23] border border-[#2a323d] rounded-[24px] p-8 shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Elraizer</h2>
            <p className="text-sm text-[#8b97a8] mb-6">Acceso mundial - sin Google - solo Supabase</p>
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-[#0e1116] border border-[#2a323d]">
              <button onClick={()=>setAuthMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${authMode==='login'?'bg-[#7c5cff] text-white':'text-[#8b97a8]'}`}>Login</button>
              <button onClick={()=>setAuthMode('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${authMode==='register'?'bg-[#7c5cff] text-white':'text-[#8b97a8]'}`}>Registro</button>
            </div>
            {!onboarding ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full mb-3 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full mb-6 px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black shadow-lg">Entrar</button>
                <p className="text-[11px] text-[#8b97a8] mt-4 text-center">Master ghost mundial: Ext3@elraizer.com / Elraizer5374e* - Requiere Supabase</p>
              </>
            ):(
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Perfil</h3>
                <input value={obUsername} onChange={e=>setObUsername(e.target.value)} placeholder="Username min 3" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <div className="flex gap-2 flex-wrap">{COLORS.map(c=><button key={c} onClick={()=>setObColor(c)} className="w-9 h-9 rounded-full border-2" style={{background:c, borderColor:obColor===c?'white':'transparent'}} />)}</div>
                <input value={obBio} onChange={e=>setObBio(e.target.value)} placeholder="Bio mundial" className="w-full px-4 py-3.5 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
                <button onClick={handleAuth} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Crear cuenta Supabase</button>
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
              <span className="hidden md:inline">Elraizer Spa</span>
              <span className="md:hidden">Elraizer</span>
            </button>
            {profile?.chat_role==='master' && <><span className="cursor-pointer text-[#ffb020] text-lg ml-1 animate-pulse" onClick={()=>setShowMaster(true)} title="Panel Maestro - Click">👑</span><button onClick={()=>setShowMaster(true)} className="hidden md:flex ml-2 px-3 py-1 rounded-full bg-[#ffb020]/20 border border-[#ffb020]/30 text-[11px] font-black text-[#ffb020] hover:bg-[#ffb020]/30">👑 Panel Maestro</button></>}
            <span className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-[#00d4b1]/10 border border-[#00d4b1]/20 text-[10px] font-bold text-[#00d4b1]"><span className="w-2 h-2 rounded-full bg-[#00d4b1] animate-pulse" />{onlineCount||onlineProfiles.length} conectados</span>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#1d242e] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" />
              <span className="absolute left-3 top-2.5 text-[#8b97a8]">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-9 h-9 rounded-xl bg-[#1d242e] border border-[#2a323d]">🌓</button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
            <div className="hidden md:block text-right mr-2">
              <p className="text-xs font-bold leading-none">{profile?.username}</p>
              <p className="text-[10px] text-[#8b97a8]">{profile?.points} pts • {profile?.chat_role} •</p>
            </div>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d]">Salir</button>
          </div>
        </div>
      </header>

      <div className="sticky top-[60px] z-20 backdrop-blur-xl border-b bg-[#161b23]/80" style={{borderColor:'#2a323d'}}>
        <div className="max-w-[1300px] mx-auto px-2 flex gap-1 overflow-x-auto">
          <button onClick={()=>setTab('inicio')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='inicio'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🏠 Inicio</button>
          <button onClick={()=>setTab('chat')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='chat'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>💬 Chat {chatMsgs.length} • {onlineCount||onlineProfiles.length} online</button>
          <button onClick={()=>setTab('tienda')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='tienda'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🛒 Tienda {products.length}</button>
          <button onClick={()=>setTab('mensajes')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='mensajes'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>✉️ Mensajes {directMsgs.length}</button>
          <button onClick={()=>setTab('perfil')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='perfil'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>👤 Perfil</button>
          <button onClick={()=>setTab('carrito')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab==='carrito'?'border-[#7c5cff] text-white':'border-transparent text-[#8b97a8]'}`}>🎒 Carrito {cart.length}</button>
        </div>
      </div>

      <main className="max-w-[1300px] mx-auto p-4 md:p-6">
        {tab==='inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{background:profile?.avatar_color}}>{profile?.username?.[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Post ¿Qué creas? #tags" className="w-full min-h-[70px] bg-[#0e1116] border border-[#2a323d] rounded-xl p-3 text-sm outline-none resize-none focus:border-[#7c5cff]" />
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
                <h3 className="font-bold mb-3"> Conectados ahora ({onlineProfiles.length}) - Realtime</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {profiles.slice(0,10).map(pr=>{
                    const isOnline=onlineProfiles.some(o=>o.id===pr.id) || onlineUsers[pr.id]
                    return <div key={pr.id} className="flex items-center gap-2 text-sm"><div className="relative"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23]" />}</div><div className="flex-1"><p className="font-bold text-xs">{pr.username} {isOnline&&'🟢'}</p><p className="text-[10px] text-[#8b97a8]">{pr.chat_role} • {pr.points} pts</p></div></div>
                  })}
                </div>
                <p className="text-[11px] text-[#8b97a8] mt-3">Usuarios conectados en tiempo real vía Supabase Presence + last_seen</p>
              </div>
              <div className="p-4 rounded-[20px] bg-[#161b23] border border-[#2a323d]"><h3 className="font-bold mb-3">🏆 Top</h3>{profiles.slice(0,5).map(pr=><div key={pr.id} className="flex justify-between text-sm py-1"><span>{pr.username}</span><span className="text-[#ffb020]">{pr.points} pts</span></div>)}</div>
            </div>
          </div>
        )}

        {tab==='chat' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] overflow-hidden flex flex-col h-[75vh]">
              <div className="p-4 border-b border-[#2a323d] flex justify-between items-center"><h2 className="font-black">💬 Chat Realtime - Elraizer World</h2><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00d4b1] animate-pulse" /><span className="text-xs text-[#8b97a8]">{onlineCount||onlineProfiles.length} conectados • {chatMsgs.length} msgs • Supabase Realtime</span></div></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMsgs.map(m=>{
                  const isOwn = m.user_id===profile?.id
                  const isMod = profile?.chat_role==='moderador' || profile?.chat_role==='master' || profile?.role==='admin'
                  const canModerate = isMod && m.user_id!==profile?.id
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
                )})}
                {chatMsgs.length===0 && <div className="text-center py-12"><p className="text-4xl mb-3">💬</p><p className="text-[#8b97a8] text-sm">Chat Supabase Realtime - escribe el primer mensaje mundial</p><p className="text-[11px] text-[#8b97a8] mt-2">Requiere tabla chat_messages con Realtime habilitado</p></div>}
                <div ref={chatEndRef} />
              </div>
              {showEmojiPicker && <div className="p-3 border-t border-[#2a323d] bg-[#0e1116] flex gap-2 flex-wrap max-h-[120px] overflow-y-auto">{EMOJIS.map(em=><button key={em} onClick={()=>{setNewChat(prev=>prev+em); setShowEmojiPicker(false)}} className="w-9 h-9 rounded-lg bg-[#1d242e] border border-[#2a323d] hover:bg-[#7c5cff]/20 text-lg">{em}</button>)}<button onClick={()=>setShowEmojiPicker(false)} className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 text-xs">✕</button></div>}
              <div className="p-4 border-t border-[#2a323d] flex gap-2 items-center"><button onClick={()=>setShowEmojiPicker(!showEmojiPicker)} className="w-11 h-11 rounded-xl bg-[#1d242e] border border-[#2a323d] text-xl hover:bg-[#7c5cff]/20">😀</button><input value={newChat} onChange={e=>setNewChat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleChatSend()} placeholder="Mensaje con emojis, moderado, gana puntos (max 10/día)" className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><button onClick={handleChatSend} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Enviar</button></div>
              {(profile?.chat_role==='moderador' || profile?.chat_role==='master') && <div className="px-4 pb-3 text-[11px] text-[#00d4b1] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00d4b1] animate-pulse" />🛡️ Eres moderador - puedes borrar, mutear y banear para evitar insultos/spam</div>}
            </div>
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] p-4 h-[75vh] overflow-y-auto">
              <h3 className="font-bold mb-3"> Conectados Realtime ({onlineProfiles.length})</h3>
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
              <div className="mt-4 p-3 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[11px] text-[#8b97a8]">Presencia en tiempo real vía Supabase Realtime Presence. Usuarios con last_seen &lt;5min se marcan online.</p></div>
            </div>
          </div>
        )}

        {tab==='tienda' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div><h1 className="text-2xl font-black">Marketplace PRO</h1><p className="text-sm text-[#8b97a8]">Todo Supabase: expira 30d, auto-borrado 60s Realtime, Por vencer &lt;5d, Expira en X días, Renovar, checkout mensaje auto mundial</p></div>
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
              <h3 className="font-bold mb-3">✉️ Mensajeses - Supabase Realtime ({directMsgs.length})</h3>
              <div className="space-y-1">
                {profiles.filter(pr=>pr.id!==profile?.id).map(pr=>{
                  const msgs=directMsgs.filter(m=>(m.from_id===pr.id&&m.to_id===profile?.id)||(m.from_id===profile?.id&&m.to_id===pr.id))
                  const last=msgs[msgs.length-1]
                  const isOnline=onlineProfiles.some(o=>o.id===pr.id) || !!onlineUsers[pr.id]
                  return (
                    <button key={pr.id} onClick={()=>setSelectedChatUser(pr)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${selectedChatUser?.id===pr.id?'bg-[#7c5cff]/20 border border-[#7c5cff]/30':'hover:bg-[#1d242e] border border-transparent'}`}>
                      <div className="relative"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:pr.avatar_color}}>{pr.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23] animate-pulse" />}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{pr.username} {isOnline&&'🟢'}</p><p className="text-[11px] text-[#8b97a8] truncate">{last?.text||'Sin mensajeses'}</p></div>
                      {msgs.length>0 && <span className="text-[10px] bg-[#7c5cff] text-white px-1.5 py-0.5 rounded-full">{msgs.length}</span>}
                    </button>
                  )
                })}
              </div>
              {profiles.length<=1 && <div className="p-4 text-center"><p className="text-3xl mb-2">✉️</p><p className="text-xs text-[#8b97a8]">Mensajería Supabase Realtime</p><p className="text-[11px] text-[#8b97a8] mt-2">Los mensajes de checkout aparecen aquí automáticamente entre usuarios de todo el mundo. Requiere tabla direct_messages con Realtime.</p></div>}
            </div>
            <div className="rounded-[20px] bg-[#161b23] border border-[#2a323d] flex flex-col overflow-hidden">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-[#2a323d] flex items-center gap-3"><div className="relative"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{background:selectedChatUser.avatar_color}}>{selectedChatUser.username[0].toUpperCase()}</div>{(onlineProfiles.some(o=>o.id===selectedChatUser.id) || !!onlineUsers[selectedChatUser.id]) && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#161b23] animate-pulse" />}</div><div><p className="font-bold text-sm">{selectedChatUser.username} {(onlineProfiles.some(o=>o.id===selectedChatUser.id) || !!onlineUsers[selectedChatUser.id])&&'🟢 online'}</p><p className="text-xs text-[#8b97a8]">{selectedChatUser.chat_role} • {selectedChatUser.points} pts • {selectedChatUser.email} •</p></div></div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {directMsgs.filter(m=>(m.from_id===profile?.id&&m.to_id===selectedChatUser.id)||(m.from_id===selectedChatUser.id&&m.to_id===profile?.id)).map(m=>(
                      <div key={m.id} className={`flex ${m.from_id===profile?.id?'justify-end':''}`}><div className={`max-w-[75%] p-3 rounded-xl text-sm ${m.from_id===profile?.id?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d]'}`}><p>{m.text}</p><p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p></div></div>
                    ))}
                    {directMsgs.filter(m=>(m.from_id===profile?.id&&m.to_id===selectedChatUser.id)||(m.from_id===selectedChatUser.id&&m.to_id===profile?.id)).length===0 && <div className="text-center py-12"><p className="text-3xl mb-2">✉️</p><p className="text-sm text-[#8b97a8]">Mensajería con {selectedChatUser.username}</p><p className="text-xs text-[#8b97a8] mt-1">Todo via Supabase Realtime, funciona entre países</p></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 border-t border-[#2a323d] flex gap-2"><input value={newDirect} onChange={e=>setNewDirect(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleDirectSend()} placeholder={`Mensaje a ${selectedChatUser.username}...`} className="flex-1 px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm outline-none focus:border-[#7c5cff]" /><button onClick={handleDirectSend} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-bold text-sm">Enviar</button></div>
                </>
              ) : <div className="flex-1 flex flex-col items-center justify-center text-[#8b97a8] text-sm p-8"><p className="text-4xl mb-3">✉️</p><p>Mensajería Supabase Realtime</p><p className="text-xs mt-2 text-center max-w-md">Selecciona un usuario conectadomente. Los mensajes de checkout de carrito aparecen aquí automáticamente. Funciona entre personas de todo el mundo, nada local.</p></div>}
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
                  <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ if(f.size>5*1024*1024){ alert('Max 5MB'); return } const url=URL.createObjectURL(f); setProfile({...profile, avatar_url:url} as any); await supabase.from('profiles').update({avatar_url:url, avatar_color:profile.avatar_color}).eq('id', profile.id) } }} />
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
                    <div className="p-2.5 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-[#8b97a8] text-[10px]">Rol chat</p><p className="font-bold">{profile.chat_role}</p></div>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs"><b>{profile.points}</b> pts</div>
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{posts.filter(p=>p.author_id===profile.id).length} posts</div>
                    <div className="px-3 py-1.5 rounded-full bg-[#1d242e] border border-[#2a323d] text-xs">{products.filter(p=>p.seller_id===profile.id).length} productos</div>
                    <button onClick={()=>{ const newBio=prompt('Nueva bio', profile.bio||''); if(newBio!==null){ supabase.from('profiles').update({bio:newBio}).eq('id', profile.id); setProfile({...profile, bio:newBio} as any) } }} className="px-3 py-1.5 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 text-xs font-bold text-[#a78bfa]">Editar bio</button>
                  </div>
                  {profile?.chat_role==='master' && <div className="mt-4 flex gap-2"><button onClick={()=>setShowMaster(true)} className="px-5 py-2.5 rounded-xl bg-[#ffb020] text-black font-black text-sm">Panel Maestro Ghost</button></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==='carrito' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-black">Carrito ({cart.length})</h1>
            {cart.map(c=><div key={c.product.id} className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d] flex justify-between"><div className="flex gap-3"><img src={c.product.images?.[0]?.url} className="w-16 h-16 rounded-lg object-cover bg-[#0e1116]" alt="" /><div><p className="font-bold text-sm">{c.product.title}</p><p className="text-xs text-[#8b97a8]">x{c.qty} • ${c.product.price} COP • {c.product.seller?.username}</p></div></div><button onClick={()=>setCart(cart.filter(x=>x.product.id!==c.product.id))} className="text-xs px-3 py-1.5 rounded-lg bg-[#1d242e] border border-[#2a323d]">Quitar</button></div>)}
            {cart.length>0 ? <><div className="p-4 rounded-xl bg-[#161b23] border border-[#2a323d]"><p className="flex justify-between font-bold">Total: <span className="text-[#00d4b1]">${cart.reduce((s,c)=>s+c.product.price*c.qty,0).toLocaleString()} COP</span></p><p className="text-[11px] text-[#8b97a8] mt-2">Checkout envía mensaje automático al vendedor vía Supabase direct_messages para pago directo entre países</p></div><button onClick={handleCheckout} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-black">Checkout - Notificar vendedores mundial</button></> : <div className="p-12 rounded-[20px] bg-[#161b23] border border-[#2a323d] text-center"><p className="text-4xl mb-3">🎒</p><p className="text-[#8b97a8]">Carrito vacío</p></div>}
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
              <input value={prodForm.location} onChange={e=>setProdForm({...prodForm, location:e.target.value})} placeholder="Ubicación (país, ciudad)" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" />
              <div onDragOver={e=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files,true)}} className={`border-2 border-dashed rounded-xl p-6 text-center ${dragOver?'border-[#7c5cff] bg-[#7c5cff]/10':'border-[#2a323d] bg-[#0e1116]'}`}>
                <p className="text-sm font-bold">Arrastra hasta 5 fotos</p><p className="text-[11px] text-[#8b97a8] mt-1">Máx 10MB c/u - Supabase Storage futuro</p>
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
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl rounded-[24px] bg-[#161b23] border border-[#2a323d] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">👑 Panel Maestro Ghost - EXT3 - Control Mundial Total</h2><button onClick={()=>setShowMaster(false)} className="w-9 h-9 rounded-full bg-[#1d242e] border border-[#2a323d]">✕</button></div>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Usuarioses</p><p className="text-xl font-black">{profiles.length}</p><p className="text-[10px] text-[#00d4b1]">{onlineCount||onlineProfiles.length} online</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Postses</p><p className="text-xl font-black">{posts.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Productoses</p><p className="text-xl font-black">{products.length}</p></div>
              <div className="p-4 rounded-xl bg-[#0e1116] border border-[#2a323d]"><p className="text-xs text-[#8b97a8]">Chat msgs</p><p className="text-xl font-black">{chatMsgs.length}</p><p className="text-[10px] text-[#8b97a8]">{directMsgs.length} directos</p></div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">👥 Usuarioses Conectados - Control Total Mundial (dar/quitar puntos, ban, mute, expulsar, suspender, borrar definitivo, editar email/pass)</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {profiles.map((u:any)=>{
                    const isOnline=onlineProfiles.some(o=>o.id===u.id) || !!onlineUsers[u.id]
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0e1116] border border-[#2a323d]">
                        <div className="flex items-center gap-3"><div className="relative"><div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{background:u.avatar_color}}>{u.username[0].toUpperCase()}</div>{isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00d4b1] border-2 border-[#0e1116] animate-pulse" />}</div><div><p className="text-sm font-bold">{u.username} {isOnline&&'🟢 online'} {u.banned&&'(BANEADO)'} {u.muted&&'(MUTEADO)'}</p><p className="text-[11px] text-[#8b97a8]">{u.chat_role} • {u.points} pts • {u.email} • {u.last_seen?new Date(u.last_seen).toLocaleTimeString():'sin last_seen'}</p></div></div>
                        <div className="flex gap-1 flex-wrap">
                          <span className="px-2 py-1 rounded bg-[#1d242e] border border-[#2a323d] text-[10px] font-bold" style={{color:getRank(u.points).color}}>{getRank(u.points).name}</span><button onClick={async()=>{ await supabase.from('profiles').update({points:u.points+100}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#7c5cff] text-white text-[10px]">+100</button>
                          <button onClick={async()=>{ await supabase.from('profiles').update({points:Math.max(0,u.points-100)}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#1d242e] border border-[#2a323d] text-[10px]">-100</button>
                          <div className="flex gap-1 flex-wrap"><span className="text-[10px] text-[#8b97a8] py-1">Rango:</span>{CHAT_ROLES.map(role=><button key={role} onClick={async()=>{ await supabase.from('profiles').update({chat_role:role}).eq('id', u.id) }} className={`px-2 py-1 rounded text-[10px] font-bold ${u.chat_role===role?'bg-[#7c5cff] text-white':'bg-[#1d242e] border border-[#2a323d] text-[#8b97a8]'}`}>{role}</button>)}</div><button onClick={async()=>{ await supabase.from('profiles').update({banned:!u.banned}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#ffb020]/20 text-[#ffb020] text-[10px]">{u.banned?'Unban':'Ban'}</button>
                          <button onClick={async()=>{ await supabase.from('profiles').update({muted:!u.muted}).eq('id', u.id) }} className="px-2 py-1 rounded bg-[#00d4b1]/20 text-[#00d4b1] text-[10px]">{u.muted?'Unmute':'Mute'}</button>
                          <button onClick={()=>{ setEditUserModal(u); setEditEmail(u.email||'') }} className="px-2 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-[10px]">Editar email/pass</button>
                          <button onClick={async()=>{ if(confirm('Borrar definitivo '+u.username+'? Borra perfil, posts, productos, chat, mensajes mundial')){ await supabase.from('profiles').delete().eq('id', u.id); await supabase.from('posts').delete().eq('author_id', u.id); await supabase.from('products').delete().eq('seller_id', u.id); await supabase.from('chat_messages').delete().eq('user_id', u.id); await supabase.from('direct_messages').delete().or(`from_id.eq.${u.id},to_id.eq.${u.id}`) } }} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px]">Borrar definitivo</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><h4 className="font-bold text-sm mb-2">Postses - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{posts.map(p=><div key={p.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span className="line-clamp-1">{p.text}</span><button onClick={async()=>{ await supabase.from('posts').delete().eq('id', p.id) }} className="text-red-400 ml-2">x</button></div>)}</div></div>
                <div><h4 className="font-bold text-sm mb-2">Productoses - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{products.map(p=><div key={p.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span>{p.title}</span><button onClick={async()=>{ await supabase.from('products').delete().eq('id', p.id) }} className="text-red-400 ml-2">x</button></div>)}</div></div>
                <div><h4 className="font-bold text-sm mb-2">Chat - borrar</h4><div className="space-y-1 max-h-[150px] overflow-y-auto">{chatMsgs.map(c=><div key={c.id} className="flex justify-between p-2 rounded bg-[#0e1116] border border-[#2a323d] text-xs"><span className="line-clamp-1">{c.text}</span><button onClick={async()=>{ await supabase.from('chat_messages').delete().eq('id', c.id) }} className="text-red-400 ml-2">x</button></div>)}</div></div>
              </div>
            </div>
            <p className="text-[10px] text-[#8b97a8] mt-6">: todo Supabase Realtime, nada local. Presencia online, usuarios conectados, chat mundial, mensajería directa entre países. Ghost mode sin rastro público EXT3. Crown 👑 solo hover master. Ctrl+Shift+A o 5 clicks ◈. Master: Ext3@elraizer.com</p>
          </div>
        </div>
      )}

      {editUserModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[20px] bg-[#161b23] border border-[#2a323d] p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Editar {editUserModal.username}</h3><button onClick={()=>setEditUserModal(null)} className="w-8 h-8 rounded-full bg-[#1d242e]">✕</button></div>
            <div className="space-y-3"><input value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Nuevo email" className="w-full px-4 py-3 rounded-xl bg-[#0e1116] border border-[#2a323d] text-sm" /><button onClick={async()=>{ await supabase.from('profiles').update({email:editEmail}).eq('id', editUserModal.id); setEditUserModal(null); setEditEmail(''); alert('Editado') }} className="w-full py-3 rounded-xl bg-[#7c5cff] text-white font-bold">Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
