import React, { useEffect, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js';

// Inicialización de cliente Supabase (Asegúrate de ajustar tus variables de entorno si es necesario)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Obtener la sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Escuchar cambios en el estado de autenticación (Sintaxis corregida)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      
      if (sess?.user) {
        const { data: existing, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sess.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          console.log('Profile found:', existing);
        }
      }
      setLoading(false);
    });

    // Limpieza de la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <p className="animate-pulse font-medium text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400">
          Elraizer Community
        </h1>
        <p className="text-slate-400 mt-2">Plataforma lista para producción</p>
      </header>

      <main className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        {session ? (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Usuario Activo</p>
              <p className="text-sm font-mono text-emerald-400 mt-1 truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors shadow"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-slate-300">No has iniciado sesión.</p>
            <button
              onClick={() => {
                /* Agrega tu lógica de inicio de sesión o modal aquí */
                alert('Conecta tu flujo de login/registro');
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow"
            >
              Iniciar Sesión / Registrarse
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
