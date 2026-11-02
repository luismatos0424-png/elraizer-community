"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PostsAdmin(){
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(()=>{
    async function load(){
      const { data } = await supabase.from("posts").select("*, profiles(username)").order("created_at",{ascending:false}).limit(50);
      if(data) setPosts(data);
    }
    load();
  },[]);

  async function del(id: string){
    if(!confirm("¿Borrar post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if(!error) setPosts(prev=>prev.filter(p=>p.id!==id));
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Moderar Posts</h1>
      {posts.map(p=>(
        <div key={p.id} className="elraizer-card p-4 mb-3 flex justify-between">
          <div><p className="font-bold">{p.title}</p><p className="text-xs text-zinc-500">{p.profiles?.username} - {p.points_received} pts</p></div>
          <button onClick={()=>del(p.id)} className="px-3 py-1 bg-red-500 rounded-full text-xs">Borrar</button>
        </div>
      ))}
    </div>
  );
}
