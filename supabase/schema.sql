-- Run this in the Supabase SQL Editor after creating your project.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "admins can read own admin record" on public.admin_users
for select to authenticated using (user_id = auth.uid());

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  price_cents integer not null check (price_cents between 0 and 999999),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "anyone can view active products" on public.products
for select to anon, authenticated using (active = true or exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can insert products" on public.products
for insert to authenticated with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can update products" on public.products
for update to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid())) with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can delete products" on public.products
for delete to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_contact text not null check (char_length(customer_contact) between 3 and 160),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null check (char_length(product_name) between 1 and 100),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "admins can view orders" on public.orders
for select to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Product photos: public read, authenticated admins may upload/update/delete.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "public can view product photos" on storage.objects
for select to public using (bucket_id = 'product-images');
create policy "admins can upload product photos" on storage.objects
for insert to authenticated with check (bucket_id = 'product-images' and exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can update product photos" on storage.objects
for update to authenticated using (bucket_id = 'product-images' and exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can delete product photos" on storage.objects
for delete to authenticated using (bucket_id = 'product-images' and exists (select 1 from public.admin_users where user_id = auth.uid()));

-- After creating your admin user in Authentication, add their UUID:
-- insert into public.admin_users (user_id) values ('PASTE_AUTH_USER_UUID_HERE');
