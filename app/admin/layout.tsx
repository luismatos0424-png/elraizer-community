"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data } = await supabase.from("chat_roles").select("role").eq("user_id", user.id).single();
      if (data && data.role >= 3) setIsAdmin(true);
      else window.location.href = "/";
      setLoading(false);
    }
    check();
  }, []);

  if (loading) return <div className="p-10 text-center">Verificando acceso Elraizer Admin...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <aside className="w-64 elraizer-card m-4 p-4 h-fit">
        <h2 className="font-black text-xl mb-6">ELRAIZER<span className="text-[#00FF88]"> ADMIN</span></h2>
        <nav className="space-y-2 text-sm">
          <Link href="/admin" className="block p-2 rounded bg-zinc-800">Dashboard</Link>
          <Link href="/admin/disputes" className="block p-2 rounded hover:bg-zinc-800">Disputas Marketplace</Link>
          <Link href="/admin/users" className="block p-2 rounded hover:bg-zinc-800">Usuarios y Roles Chat</Link>
          <Link href="/admin/posts" className="block p-2 rounded hover:bg-zinc-800">Moderar Posts</Link>
          <Link href="/" className="block p-2 rounded hover:bg-zinc-800 mt-6 text-zinc-400">Volver al foro</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
