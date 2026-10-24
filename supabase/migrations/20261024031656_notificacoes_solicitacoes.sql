-- Notify recipients when a friend request is created.
create or replace function public.notify_new_friend_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester_username text;
begin
  select username into requester_username
  from public.profiles
  where id = new.requester_id;

  insert into public.notifications (user_id, type, message, link)
  values (
    new.recipient_id,
    'friend_request',
    'Nova solicitação de amizade de @' || coalesce(requester_username, 'alguém'),
    '/notificacoes'
  );

  return new;
end;
$$;

revoke execute on function public.notify_new_friend_request() from public, anon, authenticated;

drop trigger if exists notify_new_friend_request on public.friend_requests;
create trigger notify_new_friend_request
  after insert on public.friend_requests
  for each row execute function public.notify_new_friend_request();
