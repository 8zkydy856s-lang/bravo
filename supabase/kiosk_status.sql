-- Stav kiosku BRAVA (otevřeno/zavřeno) — tabulka + auto updated_at + RLS + výchozí řádek.
--
-- Spustit v Supabase: SQL Editor -> nový dotaz -> vložit celý tento soubor -> Run.
--
-- Základ je založen ŠIROCE i pro věci, které se zatím nezobrazují:
--   - pobocka_id (unikátní) připravuje více poboček
--   - viditelnost má 3 povolené stavy (viditelne / skryte / vypnuto)
-- Čtení je povolené všem (i nepřihlášeným), zápis jen přihlášenému (majitel).

create table if not exists public.kiosk_status (
  id            bigint generated always as identity primary key,
  pobocka_id    text not null default 'hlavni' unique,
  je_otevreno   boolean not null default true,
  oteviraci_cas text,
  zaviraci_cas  text,
  duvod          text,  -- ponecháno kvůli kompatibilitě, nově se používá poznamka
  poznamka       text,
  dnesni_vyjimka boolean not null default false,
  viditelnost    text not null default 'viditelne'
                   check (viditelnost in ('viditelne', 'skryte', 'vypnuto')),
  updated_at     timestamptz not null default now()
);

-- pro existující tabulku jen doplní nové sloupce (nic nepřepíše)
alter table public.kiosk_status add column if not exists poznamka text;
alter table public.kiosk_status add column if not exists dnesni_vyjimka boolean not null default false;

-- updated_at se automaticky aktualizuje při každé změně řádku
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kiosk_status_set_updated_at on public.kiosk_status;
create trigger kiosk_status_set_updated_at
  before update on public.kiosk_status
  for each row execute function public.set_updated_at();

-- výchozí řádek (jen pokud ještě neexistuje)
insert into public.kiosk_status (pobocka_id, je_otevreno, oteviraci_cas, zaviraci_cas, duvod, viditelnost)
values ('hlavni', true, '07:00', '18:00', null, 'viditelne')
on conflict (pobocka_id) do nothing;

-- RLS: čtení pro všechny, zápis jen pro přihlášené
alter table public.kiosk_status enable row level security;

drop policy if exists kiosk_status_select_all on public.kiosk_status;
create policy kiosk_status_select_all
  on public.kiosk_status for select
  to anon, authenticated
  using (true);

drop policy if exists kiosk_status_insert_auth on public.kiosk_status;
create policy kiosk_status_insert_auth
  on public.kiosk_status for insert
  to authenticated
  with check (true);

drop policy if exists kiosk_status_update_auth on public.kiosk_status;
create policy kiosk_status_update_auth
  on public.kiosk_status for update
  to authenticated
  using (true)
  with check (true);
