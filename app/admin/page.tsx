import { supabaseAdmin } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = supabaseAdmin();
  const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: posts } = await supabase.from("posts").select("*", { count: "exact", head: true });
  const { count: disputes } = await supabase.from("marketplace_orders").select("*", { count: "exact", head: true }).eq("status", "disputa");
  const { count: suspicious } = await supabase.from("suspicious_attempts").select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Dashboard Elraizer</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="elraizer-card p-6"><p className="text-zinc-400 text-sm">Usuarios</p><p className="text-3xl font-black">{users || 0}</p></div>
        <div className="elraizer-card p-6"><p className="text-zinc-400 text-sm">Posts</p><p className="text-3xl font-black">{posts || 0}</p></div>
        <div className="elraizer-card p-6 border-red-900/50"><p className="text-zinc-400 text-sm">Disputas Activas</p><p className="text-3xl font-black text-red-400">{disputes || 0}</p></div>
        <div className="elraizer-card p-6 border-yellow-900/50"><p className="text-zinc-400 text-sm">Intentos Sospechosos</p><p className="text-3xl font-black text-yellow-400">{suspicious || 0}</p></div>
      </div>
      <div className="elraizer-card p-6 mt-6">
        <h3 className="font-bold">Acciones Rápidas</h3>
        <p className="text-sm text-zinc-400 mt-2">Desde aquí controlas todo. La lógica de custodia de fondos es atómica para evitar bugs. Nunca liberes saldo manualmente sin verificar entrega.</p>
      </div>
    </div>
  );
}
