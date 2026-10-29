alter table public.posts
  add column comments_enabled boolean not null default true;

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (article_id is null or exists (
      select 1 from public.articles a where a.id = comments.article_id
    ))
    and (post_id is null or exists (
      select 1 from public.posts p where p.id = comments.post_id and p.comments_enabled
    ))
  );
