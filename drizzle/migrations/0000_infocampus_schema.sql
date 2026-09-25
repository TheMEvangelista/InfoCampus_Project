-- ENUMS
create type public.app_role as enum ('admin','editor','author','user');
create type public.opportunity_type as enum ('estagio','emprego','bolsa','pesquisa','monitoria');

-- PROFILES
create table public.profiles (
  id uuid primary key,
  username text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- new user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public" on public.categories for select using (true);

-- COMMUNITIES
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  cover_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.communities to anon;
grant select, insert, update, delete on public.communities to authenticated;
grant all on public.communities to service_role;
alter table public.communities enable row level security;
create policy "communities public" on public.communities for select using (true);
create policy "create community" on public.communities for insert to authenticated with check (auth.uid() = created_by);
create policy "owner updates community" on public.communities for update to authenticated using (auth.uid() = created_by or public.has_role(auth.uid(),'admin'));
create policy "owner deletes community" on public.communities for delete to authenticated using (auth.uid() = created_by or public.has_role(auth.uid(),'admin'));

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);
grant select on public.community_members to anon;
grant select, insert, delete on public.community_members to authenticated;
grant all on public.community_members to service_role;
alter table public.community_members enable row level security;
create policy "members public" on public.community_members for select using (true);
create policy "join community" on public.community_members for insert to authenticated with check (auth.uid() = user_id);
create policy "leave community" on public.community_members for delete to authenticated using (auth.uid() = user_id);

-- POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete set null,
  content text not null,
  image_url text,
  video_url text,
  link_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts public" on public.posts for select using (true);
create policy "create post" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "update own post" on public.posts for update to authenticated using (auth.uid() = author_id);
create policy "delete own post" on public.posts for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select on public.post_likes to anon;
grant select, insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "likes public" on public.post_likes for select using (true);
create policy "like post" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "unlike post" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

-- ARTICLES
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  cover_url text,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "published articles public" on public.articles for select using (published = true);
create policy "author reads own articles" on public.articles for select to authenticated using (auth.uid() = author_id);
create policy "create article" on public.articles for insert to authenticated with check (auth.uid() = author_id);
create policy "update own article" on public.articles for update to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));
create policy "delete own article" on public.articles for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));

create table public.article_likes (
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (article_id, user_id)
);
grant select on public.article_likes to anon;
grant select, insert, delete on public.article_likes to authenticated;
grant all on public.article_likes to service_role;
alter table public.article_likes enable row level security;
create policy "article likes public" on public.article_likes for select using (true);
create policy "like article" on public.article_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "unlike article" on public.article_likes for delete to authenticated using (auth.uid() = user_id);

-- COMMENTS
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
grant select on public.comments to anon;
grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments public" on public.comments for select using (true);
create policy "create comment" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "update own comment" on public.comments for update to authenticated using (auth.uid() = author_id);
create policy "delete own comment" on public.comments for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));

-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  location text,
  starts_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null
);
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "events public" on public.events for select using (true);
create policy "create event" on public.events for insert to authenticated with check (auth.uid() = created_by);
create policy "update own event" on public.events for update to authenticated using (auth.uid() = created_by or public.has_role(auth.uid(),'admin'));
create policy "delete own event" on public.events for delete to authenticated using (auth.uid() = created_by or public.has_role(auth.uid(),'admin'));

-- OPPORTUNITIES
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type opportunity_type not null default 'estagio',
  description text not null,
  link text,
  deadline date,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.opportunities to anon;
grant select, insert, update, delete on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "opportunities public" on public.opportunities for select using (true);
create policy "create opportunity" on public.opportunities for insert to authenticated with check (auth.uid() = author_id);
create policy "update own opportunity" on public.opportunities for update to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));
create policy "delete own opportunity" on public.opportunities for delete to authenticated using (auth.uid() = author_id or public.has_role(auth.uid(),'admin'));

-- FOLLOWS
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  primary key (follower_id, following_id)
);
grant select on public.follows to anon;
grant select, insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;
alter table public.follows enable row level security;
create policy "follows public" on public.follows for select using (true);
create policy "follow" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "unfollow" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- SAVED ITEMS
create table public.saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);
grant select, insert, delete on public.saved_items to authenticated;
grant all on public.saved_items to service_role;
alter table public.saved_items enable row level security;
create policy "read own saved" on public.saved_items for select to authenticated using (auth.uid() = user_id);
create policy "save item" on public.saved_items for insert to authenticated with check (auth.uid() = user_id);
create policy "unsave item" on public.saved_items for delete to authenticated using (auth.uid() = user_id);

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "read own messages" on public.messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "send message" on public.messages for insert to authenticated with check (auth.uid() = sender_id);
create policy "mark read" on public.messages for update to authenticated using (auth.uid() = recipient_id);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "create notification" on public.notifications for insert to authenticated with check (true);
create policy "update own notification" on public.notifications for update to authenticated using (auth.uid() = user_id);
create policy "delete own notification" on public.notifications for delete to authenticated using (auth.uid() = user_id);

-- REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  reason text not null,
  status text not null default 'aberta',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reporter or admin reads" on public.reports for select to authenticated using (auth.uid() = reporter_id or public.has_role(auth.uid(),'admin'));
create policy "create report" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "admin updates report" on public.reports for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- SEED DATA
insert into public.categories (slug, name, description) values
  ('institucional','Institucional','Comunicados e notícias oficiais do IFMA'),
  ('oportunidades','Oportunidades','Estágios, bolsas, empregos e pesquisa'),
  ('eventos','Eventos','Semanas acadêmicas, palestras e workshops'),
  ('editais','Editais','Editais abertos e processos seletivos');

insert into public.profiles (id, username, full_name, bio, avatar_url, links) values
  ('11111111-1111-1111-1111-111111111111','ana.souza','Ana Souza','Estudante de Informática no IFMA. Apaixonada por dados.', 'https://i.pravatar.cc/150?img=47', '[{"label":"GitHub","url":"https://github.com"}]'),
  ('22222222-2222-2222-2222-222222222222','carlos.lima','Carlos Lima','Monitor de Redes de Computadores.', 'https://i.pravatar.cc/150?img=12', '[]'),
  ('33333333-3333-3333-3333-333333333333','comunicacao.ifma','Comunicação IFMA','Perfil institucional de comunicação do campus.', 'https://i.pravatar.cc/150?img=32', '[]');

insert into public.communities (id, slug, name, description, created_by) values
  ('aaaaaaa1-0000-4000-8000-000000000001','info-dev','InfoDev','Comunidade de desenvolvimento de software do campus.','11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000002','robotica','Robótica IFMA','Projetos de robótica e automação.','22222222-2222-2222-2222-222222222222'),
  ('aaaaaaa1-0000-4000-8000-000000000003','pesquisa','Iniciação Científica','Grupos de pesquisa e bolsas PIBIC.','33333333-3333-3333-3333-333333333333');

insert into public.community_members (community_id, user_id) values
  ('aaaaaaa1-0000-4000-8000-000000000001','11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000001','22222222-2222-2222-2222-222222222222'),
  ('aaaaaaa1-0000-4000-8000-000000000002','22222222-2222-2222-2222-222222222222');

insert into public.posts (author_id, community_id, content) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-4000-8000-000000000001','Alguém do 5º período quer formar grupo para o projeto integrador de Web?'),
  ('22222222-2222-2222-2222-222222222222','aaaaaaa1-0000-4000-8000-000000000002','Hoje montamos o braço robótico no laboratório. Ficou incrível!'),
  ('33333333-3333-3333-3333-333333333333',null,'Atenção: a matrícula online do próximo semestre começa na segunda-feira.');

insert into public.articles (slug, title, subtitle, content, author_id, category_id, tags, featured, cover_url) values
  ('matriculas-abertas','Matrículas do próximo semestre estão abertas','Confira o calendário completo e a documentação necessária','O IFMA divulgou o calendário de matrículas para o próximo semestre letivo. Os estudantes devem acessar o sistema acadêmico e confirmar a matrícula dentro do prazo.\n\nA documentação exigida inclui documento de identidade, comprovante de residência e histórico atualizado.', '33333333-3333-3333-3333-333333333333', (select id from public.categories where slug='institucional'), '{matricula,academico}', true, null),
  ('pibic-2026','Edital PIBIC 2026 com 120 bolsas','Inscrições abertas para iniciação científica','O edital PIBIC deste ano oferece 120 bolsas de iniciação científica para estudantes de todos os campi. As inscrições vão até o fim do mês.', '11111111-1111-1111-1111-111111111111', (select id from public.categories where slug='editais'), '{pesquisa,bolsa}', true, null),
  ('semana-tecnologia','Semana de Tecnologia terá maratona de programação','Três dias de palestras, oficinas e competições','A Semana de Tecnologia do campus acontece no próximo mês com maratona de programação, oficinas de robótica e palestras sobre inteligência artificial.', '22222222-2222-2222-2222-222222222222', (select id from public.categories where slug='eventos'), '{evento,programacao}', false, null),
  ('estagio-remoto','Como conseguir seu primeiro estágio na área de TI','Dicas práticas de currículo e portfólio','Montar um portfólio simples com dois ou três projetos reais costuma valer mais do que um currículo longo. Mostre código, explique decisões e mantenha o perfil atualizado.', '11111111-1111-1111-1111-111111111111', (select id from public.categories where slug='oportunidades'), '{estagio,carreira}', false, null);

insert into public.events (title, summary, location, starts_at, created_by) values
  ('Semana de Tecnologia','Maratona de programação, oficinas e palestras.','Auditório Central', now() + interval '12 days','33333333-3333-3333-3333-333333333333'),
  ('Feira de Estágios','Empresas parceiras apresentam vagas abertas.','Ginásio do campus', now() + interval '20 days','33333333-3333-3333-3333-333333333333'),
  ('Oficina de Robótica','Montagem de braço robótico com Arduino.','Laboratório 3', now() + interval '5 days','22222222-2222-2222-2222-222222222222');

insert into public.opportunities (title, type, description, author_id, deadline) values
  ('Estágio em desenvolvimento web','estagio','Vaga de estágio para estudantes a partir do 4º período. 20h semanais, bolsa + auxílio transporte.','11111111-1111-1111-1111-111111111111', current_date + 30),
  ('Bolsa de iniciação científica em IA','bolsa','Projeto de pesquisa sobre visão computacional aplicada à agricultura.','33333333-3333-3333-3333-333333333333', current_date + 15),
  ('Monitoria de Banco de Dados','monitoria','Seleção de monitores para a disciplina de Banco de Dados.','22222222-2222-2222-2222-222222222222', current_date + 10);

insert into public.comments (author_id, post_id, content)
select '22222222-2222-2222-2222-222222222222', id, 'Bora! Me chama no direct.' from public.posts limit 1;
