import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkAntiClone } from "@/lib/shield/antiClone";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, birthdate, fingerprint, turnstileToken } = await req.json();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";

    // 1. Verificar Turnstile
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: "Captcha inválido - Turnstile falló" }, { status: 400 });
    }

    // 2. Anti-clon check
    await checkAntiClone({ fingerprint, ip, email });

    // 3. Validaciones
    if (username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username inválido" }, { status: 400 });
    }
    if (password.length < 10) {
      return NextResponse.json({ error: "Contraseña mínimo 10 caracteres" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // 4. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username, birthdate },
    });
    if (authError) throw new Error(authError.message);
    const userId = authData.user.id;

    // 5. Crear perfil + huellas en transacción atómica
    const { error: profileError } = await supabase.from("profiles").insert({ id: userId, username });
    if (profileError) throw new Error(profileError.message);

    await supabase.from("user_fingerprints").insert({ user_id: userId, fingerprint, ip });
    await supabase.from("ip_logs").insert({ ip });
    await supabase.from("chat_roles").insert({ user_id: userId, role: 1 }); // Miembro por defecto

    return NextResponse.json({ ok: true, userId });
  } catch (e: any) {
    // Log intento sospechoso
    try {
      const supabase = supabaseAdmin();
      await supabase.from("suspicious_attempts").insert({ fingerprint: "unknown", ip: "unknown", reason: e.message });
    } catch {}
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
