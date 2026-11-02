import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export async function POST(req: NextRequest){
  try{
    const body = await req.json();
    const targetPost = body.post_id;
    const pts = body.points;
    const voter = body.voter_id || body.voterId;
    if(!voter || !targetPost || !pts) throw new Error("Faltan datos");
    const supabase = supabaseAdmin();
    const { error } = await supabase.rpc("give_points", { voter, target_post: targetPost, pts });
    if(error) throw error;
    return NextResponse.json({ ok: true });
  }catch(e:any){
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
