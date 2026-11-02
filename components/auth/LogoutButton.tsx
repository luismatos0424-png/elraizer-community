"use client";
import { supabase } from "@/lib/supabase/client";

export function LogoutButton() {
  async function handleLogout() {
    // 1. Limpiar fingerprint local
    try {
      localStorage.removeItem("elraizer_fp");
      sessionStorage.clear();
    } catch {}

    // 2. Cerrar sesión Supabase
    await supabase.auth.signOut();

    // 3. Avisar al backend (opcional)
    await fetch("/api/auth/logout", { method: "POST" });

    // 4. Redirigir
    window.location.href = "/login";
  }

  return (
    <button onClick={handleLogout} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300">
      Cerrar sesión
    </button>
  );
}
