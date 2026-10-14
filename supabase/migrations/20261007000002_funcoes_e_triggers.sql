-- InfoCampus: funções auxiliares e triggers.

-- ---------------------------------------------------------------- papéis
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role((select auth.uid()), 'admin');
$$;

-- admin ou editor
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role((select auth.uid()), 'admin')
      or public.has_role((select auth.uid()), 'editor');
$$;

-- has_role aceita qualquer id, então só as funções acima (sem argumento) ficam
-- visíveis para o navegador. Elas só revelam o papel de quem está logado.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_staff() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

-- --------------------------------------------- e-mail institucional only
create or replace function public.enforce_institutional_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) !~ '@acad\.ifma\.edu\.br$' then
    raise exception 'Cadastro permitido apenas com e-mail institucional (@acad.ifma.edu.br).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_institutional_email() from public, anon, authenticated;

drop trigger if exists enforce_institutional_email on auth.users;
create trigger enforce_institutional_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_institutional_email();

-- ------------------------------------- perfil criado junto com a conta
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  base_username text;
  final_username text;
  display_name text;
  avatar text;
begin
  -- nome de usuário: só letras minúsculas, números, "_" e "."
  base_username := lower(regexp_replace(coalesce(meta->>'username', ''), '[^a-zA-Z0-9_.]', '', 'g'));
  if char_length(base_username) < 3 then
    base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_.]', '', 'g'));
  end if;
  if char_length(base_username) < 3 then
    base_username := 'user' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  base_username := left(base_username, 24);

  -- se já existir, acrescenta um sufixo aleatório
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    final_username := base_username || substr(md5(random()::text), 1, 4);
  end loop;

  display_name := btrim(coalesce(meta->>'full_name', ''));
  if char_length(display_name) < 3 then
    display_name := coalesce(nullif(split_part(new.email, '@', 1), ''), 'Estudante');
  end if;
  if char_length(display_name) < 3 then
    display_name := 'Estudante';
  end if;
  display_name := left(display_name, 100);

  avatar := nullif(btrim(coalesce(meta->>'avatar_url', '')), '');
  if avatar is not null and (avatar !~* '^https?://' or char_length(avatar) > 2048) then
    avatar := null;
  end if;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, final_username, display_name, avatar);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------ artigos: moderação
-- Quem não é admin/editor nunca publica nem destaca: o artigo entra como
-- rascunho (published = false) e a moderação aprova no painel /admin.
-- Admin/editor publicam direto. Contextos sem usuário (SQL Editor, service
-- role) passam sem alteração.
create or replace function public.articles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  staff boolean := public.is_staff();
begin
  if uid is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.author_id := uid;
    new.published := staff;
    if not staff then
      new.featured := false;
    end if;
  else
    if not staff then
      new.published := old.published;
      new.featured := old.featured;
      new.author_id := old.author_id;
      new.slug := old.slug;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.articles_guard() from public, anon, authenticated;

drop trigger if exists articles_guard on public.articles;
create trigger articles_guard
  before insert or update on public.articles
  for each row execute function public.articles_guard();

-- ------------------------------------------------------------ posts
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();
