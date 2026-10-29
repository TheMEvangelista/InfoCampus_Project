create or replace function public.notify_friendship_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_username text;
begin
  select username into recipient_username
  from public.profiles
  where id = new.recipient_id;

  insert into public.notifications (user_id, type, message, link)
  values (
    new.requester_id,
    'friend_accepted',
    '@' || coalesce(recipient_username, 'alguém') || ' aceitou sua solicitação de amizade.',
    '/perfil/' || recipient_username
  );

  return new;
end;
$$;

revoke execute on function public.notify_friendship_accepted() from public, anon, authenticated;

drop trigger if exists notify_friendship_accepted on public.friend_requests;
create trigger notify_friendship_accepted
  after update of status on public.friend_requests
  for each row
  when (old.status = 'pending' and new.status = 'accepted')
  execute function public.notify_friendship_accepted();

create or replace function public.notify_staff_of_post_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reporter_username text;
begin
  if new.item_type <> 'post' then
    return new;
  end if;

  select username into reporter_username
  from public.profiles
  where id = new.reporter_id;

  insert into public.notifications (user_id, type, message, link)
  select distinct
    roles.user_id,
    'post_report',
    '@' || coalesce(reporter_username, 'alguém') || ' denunciou uma publicação para análise.',
    '/?publicacao=' || new.item_id::text || '#post-' || new.item_id::text
  from public.user_roles as roles
  where roles.role in ('admin'::public.app_role, 'editor'::public.app_role);

  return new;
end;
$$;

revoke execute on function public.notify_staff_of_post_report() from public, anon, authenticated;

drop trigger if exists notify_staff_of_post_report on public.reports;
create trigger notify_staff_of_post_report
  after insert on public.reports
  for each row
  when (new.item_type = 'post')
  execute function public.notify_staff_of_post_report();
