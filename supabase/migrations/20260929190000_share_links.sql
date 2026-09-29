-- Public, revocable share links for a user's wishlist.
--
-- One row per user. The owner manages it through normal RLS. Anonymous
-- visitors never touch the tables: they call get_shared_wishlist(token),
-- a SECURITY DEFINER function that returns only a safe subset of columns
-- for items that are still "wanted". Bought items, notes and the budget
-- are never exposed.

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  token text not null unique
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  enabled boolean not null default true,
  title text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table share_links enable row level security;

create policy "Users can view their own share link"
  on share_links for select
  using (auth.uid() = user_id);

create policy "Users can insert their own share link"
  on share_links for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own share link"
  on share_links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own share link"
  on share_links for delete
  using (auth.uid() = user_id);

create or replace function public.get_shared_wishlist(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'title', s.title,
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'name', i.name,
            'url', i.url,
            'image_url', i.image_url,
            'price', i.price,
            'currency', i.currency,
            'category', i.category,
            'priority', i.priority,
            'target_date', i.target_date
          )
          order by i.created_at desc
        )
        from public.items i
        where i.user_id = s.user_id
          and i.status = 'wanted'
      ),
      '[]'::jsonb
    )
  )
  from public.share_links s
  where s.token = p_token
    and s.enabled
$$;

revoke all on function public.get_shared_wishlist(text) from public;
grant execute on function public.get_shared_wishlist(text) to anon, authenticated;
