-- InfoCampus: segurança (RLS) e permissões.
-- Princípio: tudo começa bloqueado; cada tabela libera só o necessário.
-- Leitura pública (sem login): perfis, artigos publicados, posts, comunidades,
-- eventos, oportunidades, categorias, curtidas, seguidores e comentários.
-- Mensagens, notificações, itens salvos e denúncias são privados.

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.article_likes enable row level security;
alter table public.comments enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.saved_items enable row level security;
alter table public.follows enable row level security;
alter table public.events enable row level security;
alter table public.opportunities enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- --------------------------------------------------------------- perfis
create policy profiles_select on public.profiles
  for select to anon, authenticated using (true);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------------------------------------------------------------- papéis
create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy user_roles_insert_admin on public.user_roles
  for insert to authenticated with check ((select public.is_admin()));
create policy user_roles_update_admin on public.user_roles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy user_roles_delete_admin on public.user_roles
  for delete to authenticated using ((select public.is_admin()));

-- ------------------------------------------------------------ categorias
create policy categories_select on public.categories
  for select to anon, authenticated using (true);
create policy categories_insert_admin on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy categories_update_admin on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy categories_delete_admin on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- --------------------------------------------------------------- artigos
create policy articles_select on public.articles
  for select to anon, authenticated
  using (published or author_id = (select auth.uid()) or (select public.is_staff()));
create policy articles_insert on public.articles
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy articles_update on public.articles
  for update to authenticated
  using ((select public.is_staff()) or (author_id = (select auth.uid()) and not published))
  with check ((select public.is_staff()) or author_id = (select auth.uid()));
create policy articles_delete on public.articles
  for delete to authenticated
  using ((select public.is_staff()) or (author_id = (select auth.uid()) and not published));

create policy article_likes_select on public.article_likes
  for select to anon, authenticated using (true);
create policy article_likes_insert on public.article_likes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy article_likes_delete on public.article_likes
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------- comentários
-- A subconsulta respeita a RLS de artigos: ninguém lê comentário de rascunho.
create policy comments_select on public.comments
  for select to anon, authenticated
  using (article_id is null or exists (select 1 from public.articles a where a.id = comments.article_id));
create policy comments_insert on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (article_id is null or exists (
      select 1 from public.articles a where a.id = article_id and a.published
    ))
  );
create policy comments_update_own on public.comments
  for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy comments_delete on public.comments
  for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_staff()));

-- ------------------------------------------------------------ comunidades
create policy communities_select on public.communities
  for select to anon, authenticated using (true);
create policy communities_insert_staff on public.communities
  for insert to authenticated with check ((select public.is_staff()));
create policy communities_update_staff on public.communities
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy communities_delete_staff on public.communities
  for delete to authenticated using ((select public.is_staff()));

create policy community_members_select on public.community_members
  for select to anon, authenticated using (true);
create policy community_members_insert on public.community_members
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy community_members_delete on public.community_members
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------- posts
create policy posts_select on public.posts
  for select to anon, authenticated using (true);
create policy posts_insert on public.posts
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (community_id is null or exists (
      select 1 from public.community_members m
      where m.community_id = posts.community_id and m.user_id = (select auth.uid())
    ))
  );
create policy posts_update_own on public.posts
  for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy posts_delete on public.posts
  for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_staff()));

create policy post_likes_select on public.post_likes
  for select to anon, authenticated using (true);
create policy post_likes_insert on public.post_likes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy post_likes_delete on public.post_likes
  for delete to authenticated using (user_id = (select auth.uid()));

-- ------------------------------------------------ salvos e seguidores
create policy saved_items_select on public.saved_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy saved_items_insert on public.saved_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy saved_items_delete on public.saved_items
  for delete to authenticated using (user_id = (select auth.uid()));

create policy follows_select on public.follows
  for select to anon, authenticated using (true);
create policy follows_insert on public.follows
  for insert to authenticated with check (follower_id = (select auth.uid()));
create policy follows_delete on public.follows
  for delete to authenticated using (follower_id = (select auth.uid()));

-- --------------------------------------------- eventos e oportunidades
create policy events_select on public.events
  for select to anon, authenticated using (true);
create policy events_insert_staff on public.events
  for insert to authenticated with check ((select public.is_staff()));
create policy events_update_staff on public.events
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy events_delete_staff on public.events
  for delete to authenticated using ((select public.is_staff()));

create policy opportunities_select on public.opportunities
  for select to anon, authenticated using (true);
create policy opportunities_insert_staff on public.opportunities
  for insert to authenticated with check ((select public.is_staff()));
create policy opportunities_update_staff on public.opportunities
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy opportunities_delete_staff on public.opportunities
  for delete to authenticated using ((select public.is_staff()));

-- ------------------------------------------------------------ mensagens
create policy messages_select on public.messages
  for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy messages_insert on public.messages
  for insert to authenticated with check (sender_id = (select auth.uid()));
create policy messages_update_recipient on public.messages
  for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

-- ---------------------------------------------------------- notificações
-- Criadas só por triggers; o usuário lê, marca como lida e apaga as suas.
create policy notifications_select on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));

-- ------------------------------------------------------------- denúncias
create policy reports_select on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_staff()));
create policy reports_insert on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy reports_update_staff on public.reports
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy reports_delete_staff on public.reports
  for delete to authenticated using ((select public.is_staff()));

-- ------------------------------------------------------------ permissões
-- A RLS filtra linhas; os GRANTs abaixo limitam também as colunas editáveis.
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.profiles, public.categories, public.articles, public.article_likes,
  public.comments, public.communities, public.community_members, public.posts,
  public.post_likes, public.follows, public.events, public.opportunities
  to anon, authenticated;

grant select on public.user_roles, public.saved_items, public.messages,
  public.notifications, public.reports to authenticated;

grant update (full_name, bio, avatar_url, links) on public.profiles to authenticated;

grant insert, update, delete on public.user_roles to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.articles to authenticated;
grant insert, delete on public.article_likes to authenticated;
grant insert, delete on public.comments to authenticated;
grant update (content) on public.comments to authenticated;
grant insert, update, delete on public.communities to authenticated;
grant insert, delete on public.community_members to authenticated;
grant insert, delete on public.posts to authenticated;
grant update (content, image_url, link_urls) on public.posts to authenticated;
grant insert, delete on public.post_likes to authenticated;
grant insert, delete on public.saved_items to authenticated;
grant insert, delete on public.follows to authenticated;
grant insert, update, delete on public.events to authenticated;
grant insert, update, delete on public.opportunities to authenticated;
grant insert on public.messages to authenticated;
grant update (read) on public.messages to authenticated;
grant update (read) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;
grant insert, delete on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
