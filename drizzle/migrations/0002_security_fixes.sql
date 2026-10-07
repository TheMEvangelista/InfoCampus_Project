-- =====================================================================
-- 0002 — Correções de segurança (S1 a S6)
-- Revise antes de aplicar. Todas as mudanças são aditivas ou restritivas.
-- =====================================================================

-- ---------------------------------------------------------------------
-- S1 — Restringir cadastro ao domínio institucional DENTRO do banco
-- Para permitir outros domínios no futuro (ex.: professores), edite a
-- lista abaixo e a constante ALLOWED_EMAIL_DOMAINS em src/lib/auth.tsx.
-- ---------------------------------------------------------------------
create or replace function public.enforce_institutional_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_domains text[] := array['acad.ifma.edu.br'];
  domain text;
begin
  -- Não bloqueia atualizações que não mudam o e-mail (contas antigas continuam funcionando).
  if tg_op = 'UPDATE' and new.email is not distinct from old.email then
    return new;
  end if;
  domain := lower(split_part(coalesce(new.email, ''), '@', 2));
  if new.email is null or not (domain = any (allowed_domains)) then
    raise exception 'Cadastro permitido apenas para e-mails institucionais do IFMA'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_institutional_email on auth.users;
create trigger enforce_institutional_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_institutional_email();

-- ---------------------------------------------------------------------
-- S5 (parte 1) — Limpar URLs inválidas já gravadas e validar daqui em diante
-- ---------------------------------------------------------------------
update public.profiles       set avatar_url = null where avatar_url is not null and avatar_url !~* '^https?://';
update public.posts          set image_url  = null where image_url  is not null and image_url  !~* '^https?://';
update public.posts          set video_url  = null where video_url  is not null and video_url  !~* '^https?://';
update public.posts          set link_url   = null where link_url   is not null and link_url   !~* '^https?://';
update public.articles       set cover_url  = null where cover_url  is not null and cover_url  !~* '^https?://';
update public.communities    set cover_url  = null where cover_url  is not null and cover_url  !~* '^https?://';
update public.opportunities  set link       = null where link       is not null and link       !~* '^https?://';

alter table public.profiles      add constraint profiles_avatar_url_http      check (avatar_url is null or avatar_url ~* '^https?://');
alter table public.posts         add constraint posts_image_url_http          check (image_url  is null or image_url  ~* '^https?://');
alter table public.posts         add constraint posts_video_url_http          check (video_url  is null or video_url  ~* '^https?://');
alter table public.posts         add constraint posts_link_url_http           check (link_url   is null or link_url   ~* '^https?://');
alter table public.articles      add constraint articles_cover_url_http       check (cover_url  is null or cover_url  ~* '^https?://');
alter table public.communities   add constraint communities_cover_url_http    check (cover_url  is null or cover_url  ~* '^https?://');
alter table public.opportunities add constraint opportunities_link_http       check (link       is null or link       ~* '^https?://');

-- O trigger de novo usuário copia avatar_url dos metadados do cadastro.
-- Sem sanitizar, uma URL inválida faria o cadastro inteiro falhar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_avatar text := new.raw_user_meta_data->>'avatar_url';
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    case when meta_avatar ~* '^https?://' then meta_avatar else null end
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- S2 — Notificações: ninguém cria notificação pelo cliente
-- (as notificações passarão a ser geradas por triggers security definer)
-- ---------------------------------------------------------------------
drop policy if exists "create notification" on public.notifications;
revoke insert on public.notifications from authenticated;
revoke update on public.notifications from authenticated;
grant  update (read) on public.notifications to authenticated;

-- ---------------------------------------------------------------------
-- S3 — Artigos: só admin/editor publicam e destacam
-- ---------------------------------------------------------------------
create or replace function public.guard_article_flags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() é nulo para service role e migrações: não interfere.
  if auth.uid() is not null
     and not (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) then
    if tg_op = 'INSERT' then
      new.featured  := false;
      new.published := false;
    else
      new.featured  := old.featured;
      new.published := old.published;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_article_flags on public.articles;
create trigger guard_article_flags
  before insert or update on public.articles
  for each row execute function public.guard_article_flags();

drop policy if exists "update own article" on public.articles;
drop policy if exists "delete own article" on public.articles;

create policy "update own or staff article" on public.articles for update to authenticated
  using (auth.uid() = author_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "delete own or staff article" on public.articles for delete to authenticated
  using (auth.uid() = author_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
-- Admin/editor precisam ler artigos pendentes de outras pessoas para aprovar.
create policy "staff reads all articles" on public.articles for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ---------------------------------------------------------------------
-- S4 — Eventos e oportunidades: só admin/editor criam, editam e excluem
-- ---------------------------------------------------------------------
drop policy if exists "create event"        on public.events;
drop policy if exists "update own event"    on public.events;
drop policy if exists "delete own event"    on public.events;

create policy "staff creates events" on public.events for insert to authenticated
  with check (auth.uid() = created_by and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
create policy "staff updates events" on public.events for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "staff deletes events" on public.events for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

drop policy if exists "create opportunity"     on public.opportunities;
drop policy if exists "update own opportunity" on public.opportunities;
drop policy if exists "delete own opportunity" on public.opportunities;

create policy "staff creates opportunities" on public.opportunities for insert to authenticated
  with check (auth.uid() = author_id and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
create policy "staff updates opportunities" on public.opportunities for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "staff deletes opportunities" on public.opportunities for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ---------------------------------------------------------------------
-- S6 — Mensagens: destinatário só marca como lida; conteúdo validado
-- ---------------------------------------------------------------------
revoke update on public.messages from authenticated;
grant  update (read) on public.messages to authenticated;

-- NOT VALID: vale para novas linhas sem falhar por mensagens antigas.
-- Depois de conferir os dados antigos, rode:
--   alter table public.messages validate constraint messages_content_length;
--   alter table public.messages validate constraint messages_no_self;
alter table public.messages add constraint messages_content_length
  check (char_length(btrim(content)) between 1 and 2000) not valid;
alter table public.messages add constraint messages_no_self
  check (sender_id <> recipient_id) not valid;
