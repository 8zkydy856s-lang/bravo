-- Obsah úvodní stránky (volitelná sdělení + výhled na zítřek) - jeden řádek nastavení.
--
-- Spustit v Supabase: SQL Editor -> nový dotaz -> vložit celý tento soubor -> Run.
-- Idempotentní: tabulka i výchozí řádek se vytvoří jen když chybí.
-- RLS stejný vzor jako kiosk_status / rychle_hlasky: čtení pro všechny, zápis jen přihlášený.

create table if not exists public.web_obsah (
  id            bigint generated always as identity primary key,
  klic          text not null default 'hlavni' unique,
  sdeleni1_zap  boolean not null default false,
  sdeleni1_text text,
  sdeleni2_zap  boolean not null default false,
  sdeleni2_text text,
  sdeleni3_zap  boolean not null default false,
  sdeleni3_text text,
  zitra_zap     boolean not null default true,
  zitra_text    text not null default 'Zítra: pravděpodobně otevřeno',
  updated_at    timestamptz not null default now()
);

-- updated_at se automaticky aktualizuje při každé změně (funkce sdílená s ostatními tabulkami)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists web_obsah_set_updated_at on public.web_obsah;
create trigger web_obsah_set_updated_at
  before update on public.web_obsah
  for each row execute function public.set_updated_at();

-- výchozí řádek - jen pokud je tabulka prázdná
insert into public.web_obsah (klic)
select 'hlavni'
where not exists (select 1 from public.web_obsah);

-- RLS: čtení pro všechny (i nepřihlášené), zápis (insert/update) jen pro přihlášené
alter table public.web_obsah enable row level security;

drop policy if exists web_obsah_select_all on public.web_obsah;
create policy web_obsah_select_all
  on public.web_obsah for select
  to anon, authenticated
  using (true);

drop policy if exists web_obsah_insert_auth on public.web_obsah;
create policy web_obsah_insert_auth
  on public.web_obsah for insert
  to authenticated
  with check (true);

drop policy if exists web_obsah_update_auth on public.web_obsah;
create policy web_obsah_update_auth
  on public.web_obsah for update
  to authenticated
  using (true)
  with check (true);
