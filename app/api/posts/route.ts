import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export async function GET(){
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("posts").select("*, profiles(username)").order("created_at", { ascending: false }).limit(50);
  if(error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
