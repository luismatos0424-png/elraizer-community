"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CreatePage(){
  const [form, setForm] = useState({ title:"", content:"", category:"General", is_marketplace:false, price:"" });
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if(!user){ setMsg("Debes loguearte"); return; }
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
      is_marketplace: form.is_marketplace,
      price: form.is_marketplace ? parseFloat(form.price) : null,
    });
    if(error) setMsg(error.message); else { setMsg("Post creado!"); window.location.href="/"; }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-black mb-6">Crear publicación Elraizer</h1>
      <form onSubmit={handleSubmit} className="elraizer-card p-6 space-y-4">
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" placeholder="Título (5-150 chars)" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <select className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
          <option>General</option><option>Gaming</option><option>Tecnología</option><option>Tutoriales</option><option>Marketplace</option>
        </select>
        <textarea className="w-full p-3 rounded bg-zinc-900 border border-zinc-800 h-40" placeholder="Contenido..." value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_marketplace} onChange={e=>setForm({...form, is_marketplace:e.target.checked})} /> ¿Es producto para marketplace?</label>
        {form.is_marketplace && <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="number" placeholder="Precio" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />}
        <button className="w-full py-3 bg-[#00FF88] text-black font-black rounded-full">Publicar</button>
        {msg && <p className="text-center text-sm text-yellow-400">{msg}</p>}
      </form>
    </main>
  );
}
