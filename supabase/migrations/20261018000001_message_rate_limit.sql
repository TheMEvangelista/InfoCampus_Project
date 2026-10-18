-- Limita rajadas de mensagens por remetente. A constraint existente continua
-- validando tamanho e conteúdo; esta função só atua durante INSERT.
create or replace function public.enforce_message_rate_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.messages
  where sender_id = new.sender_id
    and created_at > now() - interval '10 seconds';

  if recent_count >= 5 then
    raise exception 'message_rate_limit_exceeded'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_message_rate_limit() from public, anon, authenticated;

create trigger messages_rate_limit
before insert on public.messages
for each row execute function public.enforce_message_rate_limit();
