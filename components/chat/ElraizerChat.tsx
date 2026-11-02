"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

type Message = { id: string; message: string; created_at: string; user_id: string; profiles?: { username: string; rank: number } };
type Role = { user_id: string; role: number };

const roleColors: any = { 0: "text-zinc-500", 1: "text-blue-400", 2: "text-green-400", 3: "text-orange-400", 4: "text-red-500" };
const roleNames: any = { 0: "Invitado", 1: "Miembro", 2: "Moderador", 3: "Dueño", 4: "Principal" };

export default function ElraizerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [roles, setRoles] = useState<Record<string, number>>({});
  const [input, setInput] = useState("");
  const [myRole, setMyRole] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: msgs } = await supabase.from("chat_messages").select("*, profiles(username,rank)").order("created_at", { ascending: true }).limit(100);
      if (msgs) setMessages(msgs as any);
      const { data: r } = await supabase.from("chat_roles").select("*");
      if (r) {
        const map: any = {};
        r.forEach((x: any) => map[x.user_id] = x.role);
        setRoles(map);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user && r) {
        const mine = r.find((x: any) => x.user_id === user.id);
        if (mine) setMyRole(mine.role);
      }
    }
    load();

    const channel = supabase.channel("elraizer-chat").on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
      setMessages(prev => [...prev, payload.new as any]);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Debes loguearte"); return; }
    const { error } = await supabase.from("chat_messages").insert({ user_id: user.id, message: input });
    if (!error) setInput("");
  }

  async function deleteMessage(id: string) {
    if (myRole < 2) return alert("No tienes permiso");
    await supabase.from("chat_messages").delete().eq("id", id);
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="elraizer-card flex flex-col h-[600px] md:h-[700px]">
      <div className="p-4 border-b border-zinc-800 flex justify-between">
        <h3 className="font-bold">Chat Global Elraizer - {messages.length} mensajes</h3>
        <span className="text-xs text-zinc-400">Tu rol: {roleNames[myRole]}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => {
          const role = roles[m.user_id] ?? 1;
          return (
            <div key={m.id} className="flex gap-2 text-sm group">
              <span className={roleColors[role] + " font-bold"}>{m.profiles?.username || "anon"} [{roleNames[role]}]:</span>
              <span className="text-zinc-200 flex-1">{m.message}</span>
              {myRole >= 2 && <button onClick={() => deleteMessage(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">borrar</button>}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-zinc-800 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe algo..." maxLength={500} className="flex-1 p-2 rounded bg-zinc-900 border border-zinc-800 text-sm" />
        <button className="px-4 py-2 bg-[#00FF88] text-black rounded-full font-bold text-sm">Enviar</button>
      </form>
    </div>
  );
}
