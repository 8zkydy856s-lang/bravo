-- Rychlé hlášky pro admin stavu kiosku - spravované z databáze (ne natvrdo v kódu).
--
-- Spustit v Supabase: SQL Editor -> nový dotaz -> vložit celý tento soubor -> Run.
-- Idempotentní: tabulka se vytvoří jen když chybí, výchozí hlášky se vloží jen když je prázdná.

create table if not exists public.rychle_hlasky (
  id         bigint generated always as identity primary key,
  text       text not null,
  aktivni    boolean not null default true,
  poradi     int not null default 0,
  created_at timestamptz not null default now()
);

-- výchozích 5 hlášek - jen pokud je tabulka úplně prázdná
insert into public.rychle_hlasky (text, poradi)
select v.text, v.poradi
from (values
  ('Dnes jen do 14:00', 1),
  ('Zavřeno kvůli počasí', 2),
  ('Čerstvé květiny dorazily', 3),
  ('Dnes mimořádně zavřeno', 4),
  ('Vrátím se za chvíli', 5)
) as v(text, poradi)
where not exists (select 1 from public.rychle_hlasky);

-- RLS: čtení pro všechny, zápis (insert/update/delete) jen pro přihlášené
alter table public.rychle_hlasky enable row level security;

drop policy if exists rychle_hlasky_select_all on public.rychle_hlasky;
create policy rychle_hlasky_select_all
  on public.rychle_hlasky for select
  to anon, authenticated
  using (true);

drop policy if exists rychle_hlasky_insert_auth on public.rychle_hlasky;
create policy rychle_hlasky_insert_auth
  on public.rychle_hlasky for insert
  to authenticated
  with check (true);

drop policy if exists rychle_hlasky_update_auth on public.rychle_hlasky;
create policy rychle_hlasky_update_auth
  on public.rychle_hlasky for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists rychle_hlasky_delete_auth on public.rychle_hlasky;
create policy rychle_hlasky_delete_auth
  on public.rychle_hlasky for delete
  to authenticated
  using (true);
