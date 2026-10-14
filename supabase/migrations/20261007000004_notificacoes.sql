-- InfoCampus: notificações automáticas (opcional).
-- Se não quiser alguma, basta apagar o trigger correspondente.
-- O navegador não insere notificações; só estes triggers fazem isso.

-- nova mensagem -> avisa o destinatário
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  sender_username text;
begin
  select username into sender_username from public.profiles where id = new.sender_id;
  insert into public.notifications (user_id, type, message, link)
  values (new.recipient_id, 'message', 'Nova mensagem de @' || coalesce(sender_username, 'alguém'), '/mensagens');
  return new;
end;
$$;

-- novo comentário -> avisa o autor do artigo ou da publicação
create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_author uuid;
  target_slug text;
  target_title text;
begin
  if new.article_id is not null then
    select author_id, slug, title into target_author, target_slug, target_title
    from public.articles where id = new.article_id;
    if target_author is not null and target_author <> new.author_id then
      insert into public.notifications (user_id, type, message, link)
      values (target_author, 'comment',
              'Novo comentário no seu artigo "' || left(target_title, 80) || '"',
              '/artigo/' || target_slug);
    end if;
  else
    select author_id into target_author from public.posts where id = new.post_id;
    if target_author is not null and target_author <> new.author_id then
      insert into public.notifications (user_id, type, message, link)
      values (target_author, 'comment', 'Novo comentário na sua publicação', '/');
    end if;
  end if;
  return new;
end;
$$;

-- artigo aprovado pela moderação -> avisa o autor
create or replace function public.notify_article_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.author_id is not null then
    insert into public.notifications (user_id, type, message, link)
    values (new.author_id, 'article',
            'Seu artigo "' || left(new.title, 80) || '" foi publicado!',
            '/artigo/' || new.slug);
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_new_message() from public, anon, authenticated;
revoke execute on function public.notify_new_comment() from public, anon, authenticated;
revoke execute on function public.notify_article_published() from public, anon, authenticated;

drop trigger if exists notify_new_message on public.messages;
create trigger notify_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();

drop trigger if exists notify_new_comment on public.comments;
create trigger notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();

drop trigger if exists notify_article_published on public.articles;
create trigger notify_article_published
  after update of published on public.articles
  for each row
  when (old.published is distinct from true and new.published = true)
  execute function public.notify_article_published();
