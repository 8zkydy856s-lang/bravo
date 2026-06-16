-- Trigger: naplnění tabulky public.profiles při registraci nového uživatele.
--
-- Spustit v Supabase: SQL Editor -> nový dotaz -> vložit celý tento soubor -> Run.
--
-- Princip: po signUp posílá formulář (app/login/page.tsx) data uživatele v
-- options.data, která Supabase uloží do auth.users.raw_user_meta_data (JSON).
-- Tento trigger je přečte a založí odpovídající řádek v public.profiles.
-- Profil se NEPLNÍ z prohlížeče - při potvrzování emailem není uživatel
-- po signUp přihlášený a RLS by zápis tiše zablokoval.
--
-- Názvy sloupců jsou ověřené přímo proti databázi (information_schema).
-- Záměrně ZDE NENÍ "EXCEPTION WHEN OTHERS" - kdyby něco selhalo, chceme to
-- vidět nahlas v Postgres Logs, ne tiše spolknout.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, jmeno, prijmeni, prezdivka, pohlavie, telefon,
    datum_narozeni, svatek, preferovany_jazyk, oblibeny_napoj,
    preference_mleka, intolerance,
    newsletter, notifikace_nabidky, notifikace_novinky,
    souhlas_podminky, souhlas_gdpr
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'jmeno',
    new.raw_user_meta_data->>'prijmeni',
    new.raw_user_meta_data->>'prezdivka',
    new.raw_user_meta_data->>'pohlavie',
    new.raw_user_meta_data->>'telefon',
    -- prázdný řetězec z nevyplněného data -> NULL, jinak by ::date spadlo
    nullif(new.raw_user_meta_data->>'datum_narozeni', '')::date,
    nullif(new.raw_user_meta_data->>'svatek', '')::date,
    coalesce(new.raw_user_meta_data->>'preferovany_jazyk', 'cs'),
    new.raw_user_meta_data->>'oblibeny_napoj',
    new.raw_user_meta_data->>'preference_mleka',
    -- dietní omezení formulář spojí do jednoho textu pod klíčem 'intolerance'
    new.raw_user_meta_data->>'intolerance',
    -- ->> vrátí text "true"/"false", ::boolean ho převede; chybí-li, dá false
    coalesce((new.raw_user_meta_data->>'newsletter')::boolean, false),
    coalesce((new.raw_user_meta_data->>'notifikace_nabidky')::boolean, false),
    coalesce((new.raw_user_meta_data->>'notifikace_novinky')::boolean, false),
    coalesce((new.raw_user_meta_data->>'souhlas_podminky')::boolean, false),
    coalesce((new.raw_user_meta_data->>'souhlas_gdpr')::boolean, false)
  );
  return new;
end;
$$;

-- Trigger, který funkci spustí po vzniku nového uživatele.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
