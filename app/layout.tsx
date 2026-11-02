import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Elraizer Community", description: "Donde la comunidad es el poder" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body className="min-h-screen bg-[#0A0A0A] text-white">{children}</body></html>; }
