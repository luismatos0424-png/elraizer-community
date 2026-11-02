"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("profiles").select("*, chat_roles(role)").order("created_at", { ascending: false }).limit(100);
      if (data) setUsers(data);
    }
    load();
  }, []);

  async function changeRole(userId: string, role: number) {
    const res = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, role }) });
    const data = await res.json();
    if (data.ok) { alert("Rol actualizado"); window.location.reload(); } else alert(data.error);
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Usuarios y Roles Chat</h1>
      <div className="elraizer-card p-4">
        <div className="grid grid-cols-5 text-xs text-zinc-500 font-bold p-2 border-b border-zinc-800">
          <span>Username</span><span>Rank</span><span>Puntos</span><span>Rol Chat</span><span>Acción</span>
        </div>
        {users.map(u => (
          <div key={u.id} className="grid grid-cols-5 text-sm p-2 border-b border-zinc-900 items-center">
            <span>{u.username}</span><span>{u.rank}</span><span>{u.points_total}</span><span>{u.chat_roles?.role ?? 1}</span>
            <select defaultValue={u.chat_roles?.role ?? 1} onChange={e => changeRole(u.id, parseInt(e.target.value))} className="bg-zinc-800 rounded p-1 text-xs">
              <option value="0">0 Invitado</option><option value="1">1 Miembro</option><option value="2">2 Moderador</option><option value="3">3 Dueño</option><option value="4">4 Principal</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
