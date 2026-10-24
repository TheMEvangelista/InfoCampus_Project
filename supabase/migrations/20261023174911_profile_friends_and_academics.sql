alter table public.profiles
  add column course text,
  add column cohort text,
  add column gender text;

alter table public.profiles
  add constraint profiles_course_len check (course is null or char_length(course) <= 120),
  add constraint profiles_cohort_len check (cohort is null or char_length(cohort) <= 80);
alter table public.profiles
  add constraint profiles_gender_values check (gender is null or gender in ('masculino', 'feminino', 'prefiro_nao_dizer'));

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint friend_requests_not_self check (requester_id <> recipient_id),
  constraint friend_requests_pair unique (requester_id, recipient_id)
);

create index friend_requests_recipient_status_idx on public.friend_requests(recipient_id, status);
create index friend_requests_requester_status_idx on public.friend_requests(requester_id, status);

-- Only mutual follows map to friendship; unilateral follows never imply consent.
insert into public.friend_requests (requester_id, recipient_id, status)
select f.follower_id, f.following_id, 'accepted'
from public.follows f
where f.follower_id < f.following_id
  and exists (
    select 1 from public.follows reciprocal
    where reciprocal.follower_id = f.following_id
      and reciprocal.following_id = f.follower_id
  );
drop table public.follows;

alter table public.friend_requests enable row level security;

create policy friend_requests_select_participant on public.friend_requests
  for select to authenticated
  using (requester_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy friend_requests_insert_requester on public.friend_requests
  for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');
create policy friend_requests_accept_recipient on public.friend_requests
  for update to authenticated
  using (recipient_id = (select auth.uid()) and status = 'pending')
  with check (recipient_id = (select auth.uid()) and status = 'accepted');
create policy friend_requests_delete_participant on public.friend_requests
  for delete to authenticated
  using (requester_id = (select auth.uid()) or recipient_id = (select auth.uid()));

grant select, insert, delete on public.friend_requests to authenticated;
grant update (status) on public.friend_requests to authenticated;
grant update (full_name, bio, avatar_url, links, course, cohort, gender) on public.profiles to authenticated;
