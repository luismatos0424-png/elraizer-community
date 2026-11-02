"use client";
import { useState, useEffect } from "react";
import { getFingerprint } from "@/lib/shield/fingerprint";

declare global { interface Window { turnstile: any; onTurnstileSuccess: (token: string) => void; } }

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", birthdate: "" });
  const [fingerprint, setFingerprint] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getFingerprint().then(setFingerprint);
    // Cargar Turnstile
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.body.appendChild(script);
    // @ts-ignore
    window.onTurnstileSuccess = (token: string) => setTurnstileToken(token);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fingerprint) { setMsg("Generando huella de seguridad... espera 2s"); return; }
    if (!turnstileToken) { setMsg("Completa el captcha Turnstile"); return; }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fingerprint, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("Cuenta creada! Revisa tu email para verificar - Elraizer Shield activo");
    } catch (err: any) {
      setMsg(err.message || "Error en registro");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
      <form onSubmit={handleSubmit} className="elraizer-card p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-black">Crear cuenta <span className="text-[#00FF88]">Elraizer</span></h1>
        <p className="text-xs text-zinc-400">Protegido con Elraizer Shield - Anti-clon por huella + IP</p>
        
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" placeholder="Username (4-20, solo letras y _)" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="password" placeholder="Contraseña 10+ con mayúscula, número y símbolo" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <input className="w-full p-3 rounded bg-zinc-900 border border-zinc-800" type="date" value={form.birthdate} onChange={e=>setForm({...form, birthdate:e.target.value})} required />

        <div className="text-[10px] text-zinc-500">Fingerprint: {fingerprint ? fingerprint.slice(0,12)+"... activo" : "generando..."}</div>

        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback="onTurnstileSuccess"></div>

        <button disabled={loading} className="w-full py-3 bg-[#00FF88] text-black font-black rounded-full disabled:opacity-50">
          {loading ? "Verificando Shield..." : "Crear cuenta blindada"}
        </button>

        {msg && <p className="text-sm text-center text-yellow-400">{msg}</p>}
      </form>
    </main>
  );
}
