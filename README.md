# ◈ Elraizer Community - Modo Fantasma PRO

Comunidad + Marketplace con expiracion 30 dias, control maestro total y Autenticacion email (Google removido).

## Deploy Rapido
1. npm install
2. cp .env.example .env y llena VITE_SUPABASE_URL y ANON_KEY
3. npm run dev

## Supabase Setup (produccion global)
1. Crea proyecto en supabase.com
2. SQL Editor > ejecuta supabase-schema.sql
3. Storage > crea buckets media y product-images (public)
4. Auth > Providers > habilita Email y Google
   - Google Cloud Console > Credentials > OAuth 2.0 Client
   - Redirect: https://TU_PROYECTO.supabase.co/auth/v1/callback
   - Copia ID y Secret en Supabase
5. Auth > Users > crea usuario maestro con Auto Confirm true (email y pass solo tu los sabes)
6. Ejecuta:
```sql
UPDATE profiles SET role='admin', chat_role='master', avatar_color='#ffb020', username='EXT3', bio='Fundador' WHERE id = (SELECT id FROM auth.users WHERE email='Ext3@elraizer.com');
```

## Vercel
- Push a GitHub, import en vercel.com/new, framework Vite, build npm run build, output dist, env vars VITE_SUPABASE_URL y ANON_KEY, Deploy.

## Master Panel
Acceso stealth: Ctrl+Shift+A o 5 clicks en logo ◈. Solo maestro ve corona. Control total: dar puntos, banear, eliminar posts/productos/comentarios, editar email/pass usuarios, renovar productos.

## Marketplace
Publicacion dura 30 dias, auto-delete, renovable, al comprar se envia mensaje automatico al vendedor con info comprador para coordinar pago directo.
