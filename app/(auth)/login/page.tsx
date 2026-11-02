"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(form);
    if (error) setMsg(error.message);
    else window.location.href = "/";
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="elraizer-card p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-black">Entrar a <span className="text-[#00FF88]">Elraizer</span></h1>
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <button disabled={loading} className="w-full py-3 bg-[#00FF88] text-black font-black rounded-full">{loading ? "Entrando..." : "Entrar"}</button>
        {msg && <p className="text-sm text-red-400 text-center">{msg}</p>}
        <p className="text-center text-sm text-zinc-400">¿No tienes cuenta? <Link href="/register" className="text-[#00FF88]">Crear cuenta blindada</Link></p>
      </form>
    </main>
  );
}
