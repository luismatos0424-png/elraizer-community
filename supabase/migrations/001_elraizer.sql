
-- ELRAIZER COMMUNITY - MIGRACION COMPLETA
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  phone text unique,
  rank int default 0,
  points_total int default 0,
  points_to_give int default 10,
  last_points_reset date default current_date,
  created_at timestamp default now()
);
create table if not exists user_fingerprints (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id), fingerprint text not null, ip text not null, created_at timestamp default now());
create table if not exists ip_logs (id uuid primary key default gen_random_uuid(), ip text not null, created_at timestamp default now());
create table if not exists posts (id uuid primary key default gen_random_uuid(), author_id uuid references profiles(id), title text not null, content text not null, category text not null, is_marketplace boolean default false, price numeric, points_received int default 0, points_today int default 0, created_at timestamp default now());
create table if not exists point_votes (id uuid primary key default gen_random_uuid(), voter_id uuid references profiles(id), post_id uuid references posts(id), points int check (points between 1 and 10), created_at date default current_date, unique(voter_id, post_id, created_at));
create table if not exists marketplace_orders (id uuid primary key default gen_random_uuid(), post_id uuid references posts(id), buyer_id uuid references profiles(id), seller_id uuid references profiles(id), amount numeric not null, status text default 'retenido', created_at timestamp default now());
create table if not exists chat_messages (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id), message text not null, created_at timestamp default now());
create table if not exists chat_roles (user_id uuid primary key references profiles(id), role int default 1, updated_at timestamp default now());

alter table profiles enable row level security;
alter table posts enable row level security;
alter table chat_messages enable row level security;
create policy "lectura publica posts" on posts for select using (true);
create policy "insert auth posts" on posts for insert with check (auth.uid() = author_id);
create policy "lectura perfiles" on profiles for select using (true);
create policy "update propio" on profiles for update using (auth.uid() = id);
create policy "chat lectura" on chat_messages for select using (true);
create policy "chat insert" on chat_messages for insert with check (auth.uid() = user_id);

-- Funcion atomica puntos
create or replace function give_points(voter uuid, target_post uuid, pts int) returns void as $$
declare remaining int; author uuid;
begin
  select points_to_give into remaining from profiles where id = voter for update;
  if remaining < pts then raise exception 'Sin puntos'; end if;
  select author_id into author from posts where id = target_post;
  if voter = author then raise exception 'No auto-puntos'; end if;
  insert into point_votes (voter_id, post_id, points) values (voter, target_post, pts);
  update profiles set points_to_give = points_to_give - pts where id = voter;
  update posts set points_received = points_received + pts, points_today = points_today + pts where id = target_post;
  update profiles set points_total = points_total + pts where id = author;
end;
$$ language plpgsql security definer;
