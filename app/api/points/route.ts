import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export async function POST(req: NextRequest){
  try{
    const { post_id, points } = await req.json();
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ","");
    const supabase = supabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser(token || "");
    // Si viene desde cliente con supabase.auth.getUser() no funciona en server, usamos voter_id del body en MVP
    const { voter_id } = await req.json().catch(()=>({voter_id:null})) || {};
    // Para simplificar, el cliente manda voter_id, en producción usa middleware de auth
    const body = await req.json().catch(()=>({}));
    // Usamos RPC atomica
    const { error } = await supabase.rpc("give_points", { voter: body.voter_id || body.voterId, target_post: body.post_id || post_id, pts: body.points || points });
    if(error) throw error;
    return NextResponse.json({ ok: true });
  }catch(e:any){
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
