-- Items and budget tables for the wishlist app, with RLS scoped to the
-- authenticated user (single-user app, but still no open tables).

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  url text,
  image_url text,
  price numeric,
  currency text not null default 'CHF',
  category text,
  status text not null default 'wanted' check (status in ('wanted', 'bought')),
  priority boolean not null default false,
  target_date date,
  bought_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists items_user_id_idx on items (user_id);
create index if not exists items_status_idx on items (status);

alter table items enable row level security;

create policy "Users can view their own items"
  on items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own items"
  on items for delete
  using (auth.uid() = user_id);

create table if not exists budget (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  year int not null,
  amount numeric not null,
  currency text not null default 'CHF',
  unique (user_id, year)
);

alter table budget enable row level security;

create policy "Users can view their own budget"
  on budget for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budget"
  on budget for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budget"
  on budget for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own budget"
  on budget for delete
  using (auth.uid() = user_id);
