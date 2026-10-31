
-- ELRAIZER COMMUNITY - GHOST + MARKETPLACE 30 DIAS
create extension if not exists "uuid-ossp";
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username)>=3),
  bio text check (char_length(bio)<=80),
  avatar_color text default '#7c5cff',
  role text default 'user' check (role in ('user','admin')),
  points int default 0,
  points_given int default 0,
  reset_day date default current_date,
  suspended boolean default false,
  chat_role text default 'nuevo' check (chat_role in ('nuevo','moderador','maestro','master')),
  muted_until timestamptz,
  banned_from_chat boolean default false,
  kicked_until timestamptz,
  created_at timestamptz default now()
);
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  tags text[] default '{}',
  image_url text,
  media jsonb default '[]',
  created_at timestamptz default now()
);
create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  media jsonb default '[]',
  created_at timestamptz default now()
);
create table if not exists post_votes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  price numeric not null check (price>=0),
  category text default 'Otros',
  description text,
  image_url text,
  images jsonb default '[]',
  location text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  renewed_count int default 0
);
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  stars int check (stars between 1 and 5),
  text text,
  created_at timestamptz default now()
);
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now(),
  deleted_at timestamptz,
  pinned boolean default false
);
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  icon text,
  read boolean default false,
  data jsonb default '{}',
  created_at timestamptz default now()
);
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade,
  items jsonb not null,
  total numeric not null,
  status text default 'pendiente',
  buyer_email text,
  created_at timestamptz default now()
);
create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  qty int default 1 check (qty>0),
  unique(user_id, product_id)
);
create table if not exists chat_moderation_log (
  id uuid primary key default uuid_generate_v4(),
  target_user_id uuid references profiles(id) on delete cascade not null,
  mod_user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  reason text,
  until timestamptz,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_comments enable row level security;
alter table post_votes enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table orders enable row level security;
alter table cart_items enable row level security;
alter table chat_moderation_log enable row level security;
drop policy if exists "authenticated read profiles" on profiles; create policy "authenticated read profiles" on profiles for select to authenticated using (true);
drop policy if exists "own update or admin" on profiles; create policy "own update or admin" on profiles for update to authenticated using (auth.uid()=id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
drop policy if exists "insert own profile" on profiles; create policy "insert own profile" on profiles for insert to authenticated with check (auth.uid()=id);
drop policy if exists "auth read posts" on posts; create policy "auth read posts" on posts for select to authenticated using (true);
drop policy if exists "own crud posts" on posts; create policy "own crud posts" on posts for all to authenticated using (author_id=auth.uid() or exists(select 1 from profiles where id=auth.uid() and role='admin'));
drop policy if exists "auth read comments" on post_comments; create policy "auth read comments" on post_comments for select to authenticated using (true);
drop policy if exists "own crud comments" on post_comments; create policy "own crud comments" on post_comments for all to authenticated using (author_id=auth.uid() or exists(select 1 from profiles where id=auth.uid() and role='admin'));
drop policy if exists "auth read votes" on post_votes; create policy "auth read votes" on post_votes for select to authenticated using (true);
drop policy if exists "own vote" on post_votes; create policy "own vote" on post_votes for all to authenticated using (user_id=auth.uid());
drop policy if exists "auth read products" on products; create policy "auth read products" on products for select to authenticated using (true);
drop policy if exists "seller crud" on products; create policy "seller crud" on products for all to authenticated using (seller_id=auth.uid() or exists(select 1 from profiles where id=auth.uid() and role='admin'));
drop policy if exists "auth read reviews" on reviews; create policy "auth read reviews" on reviews for select to authenticated using (true);
drop policy if exists "reviewer insert" on reviews; create policy "reviewer insert" on reviews for insert to authenticated with check (reviewer_id=auth.uid());
drop policy if exists "auth messages" on messages; create policy "auth messages" on messages for select to authenticated using (true);
drop policy if exists "auth insert messages" on messages; create policy "auth insert messages" on messages for insert to authenticated with check (true);
drop policy if exists "mod update messages" on messages; create policy "mod update messages" on messages for update to authenticated using (exists(select 1 from profiles where id=auth.uid() and chat_role in ('moderador','maestro','master')) or user_id=auth.uid());
drop policy if exists "own notifications" on notifications; create policy "own notifications" on notifications for all to authenticated using (user_id=auth.uid());
drop policy if exists "master can insert notifications" on notifications; create policy "master can insert notifications" on notifications for insert to authenticated with check (true);
drop policy if exists "own cart" on cart_items; create policy "own cart" on cart_items for all to authenticated using (user_id=auth.uid());
drop policy if exists "buyer orders" on orders; create policy "buyer orders" on orders for all to authenticated using (buyer_id=auth.uid() or seller_id=auth.uid() or exists(select 1 from profiles where id=auth.uid() and role='admin'));
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table products;
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict (id) do nothing;
create policy "auth read media" on storage.objects for select to authenticated using (bucket_id in ('media','product-images'));
create policy "auth upload media" on storage.objects for insert to authenticated with check (bucket_id in ('media','product-images'));
create policy "own delete media" on storage.objects for delete to authenticated using (bucket_id in ('media','product-images'));
create or replace function delete_expired_products() returns void as $$ begin delete from products where expires_at < now(); end; $$ language plpgsql security definer;
