import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export async function POST(req: NextRequest){
  try{
    const { order_id, action } = await req.json();
    const supabase = supabaseAdmin();
    if(action === "completado"){
      await supabase.from("marketplace_orders").update({ status: "completado" }).eq("id", order_id);
    } else {
      await supabase.from("marketplace_orders").update({ status: "retenido" }).eq("id", order_id);
    }
    return NextResponse.json({ ok: true });
  }catch(e:any){ return NextResponse.json({ error: e.message }, { status: 400 }); }
}
