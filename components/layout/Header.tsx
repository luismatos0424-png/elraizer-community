"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function Header() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  return (
    <header className="flex justify-between items-center py-6">
      <Link href="/" className="text-2xl font-black">ELRAIZER<span className="text-[#00FF88]">.COMMUNITY</span></Link>
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            <Link href="/create" className="px-4 py-2 bg-[#00FF88] text-black rounded-full font-bold text-sm">+ Crear</Link>
            <Link href="/admin" className="px-3 py-1 bg-zinc-800 rounded-full text-xs">Admin</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 bg-zinc-800 rounded-full text-sm">Entrar</Link>
            <Link href="/register" className="px-4 py-2 bg-[#00FF88] text-black rounded-full font-bold text-sm">Registro Blindado</Link>
          </>
        )}
      </div>
    </header>
  );
}
