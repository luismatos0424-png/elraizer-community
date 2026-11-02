import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export async function POST(req: NextRequest){
  try{
    const { user_id, role } = await req.json();
    if(role <0 || role >4) throw new Error("Rol inválido");
    const supabase = supabaseAdmin();
    const { error } = await supabase.from("chat_roles").upsert({ user_id, role });
    if(error) throw error;
    return NextResponse.json({ ok: true });
  }catch(e:any){ return NextResponse.json({ error: e.message }, { status: 400 }); }
}
