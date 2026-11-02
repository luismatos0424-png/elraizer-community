import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
  try {
    // El cliente ya hizo supabase.auth.signOut(), aquí limpiamos logs si quieres
    // Opcional: podrías guardar logout en auditoría
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
