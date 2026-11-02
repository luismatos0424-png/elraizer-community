"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DisputesPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("marketplace_orders").select("*, posts(title), buyer:profiles!marketplace_orders_buyer_id_fkey(username), seller:profiles!marketplace_orders_seller_id_fkey(username)").eq("status", "disputa").order("created_at", { ascending: false });
      if (data) setOrders(data);
    }
    load();
  }, []);

  async function resolve(id: string, action: "completado" | "retenido") {
    const res = await fetch("/api/admin/disputes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_id: id, action }) });
    const data = await res.json();
    if (data.ok) { alert(`Disputa resuelta: ${action}`); setOrders(prev => prev.filter(o => o.id !== id)); }
    else alert(data.error);
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Disputas Marketplace - Custodia</h1>
      {orders.length === 0 ? <div className="elraizer-card p-10 text-center text-zinc-500">No hay disputas activas. Todo limpio.</div> :
        orders.map(o => (
          <div key={o.id} className="elraizer-card p-5 mb-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{o.posts?.title} - ${o.amount}</p>
              <p className="text-xs text-zinc-400">Comprador: {o.buyer?.username} | Vendedor: {o.seller?.username}</p>
              <p className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resolve(o.id, "completado")} className="px-4 py-2 bg-[#00FF88] text-black rounded-full text-xs font-bold">Liberar a Vendedor</button>
              <button onClick={() => resolve(o.id, "retenido")} className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold">Reembolsar a Comprador</button>
            </div>
          </div>
        ))}
    </div>
  );
}
