import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false },
  });

  const token = req.cookies.get("sb-access-token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  
  const protectedRoutes = ["/create", "/admin"];
  const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Verificación ligera - en producción usa supabase.auth.getUser(token)
    // Para MVP redirigimos si no hay token, el layout de admin hace verificación profunda de rol
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create/:path*", "/admin/:path*"],
};
