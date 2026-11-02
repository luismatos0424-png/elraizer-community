import Link from "next/link";
export default function Home(){
 return (
  <main className="max-w-6xl mx-auto p-6">
   <header className="flex justify-between items-center py-6">
    <h1 className="text-3xl font-black">ELRAIZER<span className="text-[#00FF88]">.COMMUNITY</span></h1>
    <Link href="/api/health" className="px-4 py-2 bg-[#00FF88] text-black rounded-full font-bold">API OK</Link>
   </header>
   <section className="grid md:grid-cols-3 gap-4 mt-10">
    <div className="elraizer-card p-6"><h2 className="font-bold text-xl mb-2">Foro</h2><p className="text-zinc-400">Puntos diarios, rangos 0-6, top y destacados.</p></div>
    <div className="elraizer-card p-6"><h2 className="font-bold text-xl mb-2">Marketplace Custodia</h2><p className="text-zinc-400">Saldo retenido. Hasta confirmar no se libera.</p></div>
    <div className="elraizer-card p-6"><h2 className="font-bold text-xl mb-2">Chat Global</h2><p className="text-zinc-400">5 roles: Invitado, Miembro, Moderador, Dueno, Dueno Principal.</p></div>
   </section>
  </main>
 );
}
