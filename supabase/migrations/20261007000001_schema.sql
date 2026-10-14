-- InfoCampus: tabelas, enums, chaves e índices.
-- As regras de segurança (RLS) ficam em 20261007000003.

create type public.app_role as enum ('admin', 'editor', 'author', 'user');
create type public.opportunity_type as enum ('estagio', 'emprego', 'bolsa', 'pesquisa', 'monitoria');

-- ---------------------------------------------------------------- perfis
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  full_name text not null,
  avatar_url text,
  bio text,
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint profiles_username_key unique (username),
  constraint profiles_username_format check (username ~ '^[a-z0-9_.]{3,30}$'),
  constraint profiles_full_name_len check (char_length(full_name) between 3 and 100),
  constraint profiles_bio_len check (bio is null or char_length(bio) <= 500),
  constraint profiles_avatar_url_http check (
    avatar_url is null or (avatar_url ~* '^https?://' and char_length(avatar_url) <= 2048)
  )
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  constraint user_roles_user_id_role_key unique (user_id, role)
);

-- ------------------------------------------------------------- conteúdo
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  constraint categories_slug_key unique (slug),
  constraint categories_name_len check (char_length(name) between 1 and 80)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  subtitle text,
  content text not null,
  cover_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  author_id uuid,
  category_id uuid,
  created_at timestamptz not null default now(),
  constraint articles_slug_key unique (slug),
  constraint articles_author_id_fkey foreign key (author_id) references public.profiles (id) on delete set null,
  constraint articles_category_id_fkey foreign key (category_id) references public.categories (id) on delete set null,
  constraint articles_title_len check (char_length(btrim(title)) between 1 and 200),
  constraint articles_subtitle_len check (subtitle is null or char_length(subtitle) <= 300),
  constraint articles_content_len check (char_length(btrim(content)) between 1 and 100000),
  constraint articles_cover_url_http check (
    cover_url is null or (cover_url ~* '^https?://' and char_length(cover_url) <= 2048)
  )
);
create index articles_published_created_idx on public.articles (published, created_at desc);
create index articles_author_idx on public.articles (author_id);
create index articles_category_idx on public.articles (category_id);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  cover_url text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  constraint communities_slug_key unique (slug),
  constraint communities_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null,
  constraint communities_name_len check (char_length(name) between 1 and 100),
  constraint communities_cover_url_http check (
    cover_url is null or (cover_url ~* '^https?://' and char_length(cover_url) <= 2048)
  )
);

create table public.community_members (
  community_id uuid not null,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id),
  constraint community_members_community_id_fkey foreign key (community_id) references public.communities (id) on delete cascade,
  constraint community_members_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
);
create index community_members_user_idx on public.community_members (user_id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  community_id uuid,
  content text not null,
  image_url text,
  video_url text,
  link_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_author_id_fkey foreign key (author_id) references public.profiles (id) on delete cascade,
  constraint posts_community_id_fkey foreign key (community_id) references public.communities (id) on delete set null,
  constraint posts_content_len check (char_length(btrim(content)) between 1 and 5000),
  constraint posts_image_url_http check (image_url is null or (image_url ~* '^https?://' and char_length(image_url) <= 2048)),
  constraint posts_video_url_http check (video_url is null or (video_url ~* '^https?://' and char_length(video_url) <= 2048)),
  constraint posts_link_url_http check (link_url is null or (link_url ~* '^https?://' and char_length(link_url) <= 2048))
);
create index posts_created_idx on public.posts (created_at desc);
create index posts_author_idx on public.posts (author_id);
create index posts_community_idx on public.posts (community_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  post_id uuid,
  author_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_article_id_fkey foreign key (article_id) references public.articles (id) on delete cascade,
  constraint comments_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
  constraint comments_author_id_fkey foreign key (author_id) references public.profiles (id) on delete cascade,
  constraint comments_one_target check (num_nonnulls(article_id, post_id) = 1),
  constraint comments_content_len check (char_length(btrim(content)) between 1 and 2000)
);
create index comments_article_idx on public.comments (article_id, created_at);
create index comments_post_idx on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);

create table public.article_likes (
  article_id uuid not null,
  user_id uuid not null,
  primary key (article_id, user_id),
  constraint article_likes_article_id_fkey foreign key (article_id) references public.articles (id) on delete cascade,
  constraint article_likes_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
);

create table public.post_likes (
  post_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id),
  constraint post_likes_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
  constraint post_likes_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
);
create index post_likes_user_idx on public.post_likes (user_id);

create table public.saved_items (
  user_id uuid not null,
  item_type text not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id),
  constraint saved_items_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade,
  constraint saved_items_item_type_check check (item_type in ('post', 'article'))
);

create table public.follows (
  follower_id uuid not null,
  following_id uuid not null,
  primary key (follower_id, following_id),
  constraint follows_follower_id_fkey foreign key (follower_id) references public.profiles (id) on delete cascade,
  constraint follows_following_id_fkey foreign key (following_id) references public.profiles (id) on delete cascade,
  constraint follows_not_self check (follower_id <> following_id)
);
create index follows_following_idx on public.follows (following_id);

-- ------------------------------------------------- agenda e oportunidades
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  location text,
  starts_at timestamptz not null,
  created_by uuid default auth.uid(),
  constraint events_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null,
  constraint events_title_len check (char_length(title) between 1 and 200)
);
create index events_starts_idx on public.events (starts_at);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.opportunity_type not null default 'estagio',
  description text not null,
  deadline date,
  link text,
  author_id uuid default auth.uid(),
  created_at timestamptz not null default now(),
  constraint opportunities_author_id_fkey foreign key (author_id) references public.profiles (id) on delete set null,
  constraint opportunities_title_len check (char_length(title) between 1 and 200),
  constraint opportunities_link_http check (link is null or (link ~* '^https?://' and char_length(link) <= 2048))
);
create index opportunities_created_idx on public.opportunities (created_at desc);

-- ------------------------------------------- mensagens, avisos, denúncias
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  recipient_id uuid not null,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_sender_id_fkey foreign key (sender_id) references public.profiles (id) on delete cascade,
  constraint messages_recipient_id_fkey foreign key (recipient_id) references public.profiles (id) on delete cascade,
  constraint messages_not_self check (sender_id <> recipient_id),
  constraint messages_content_len check (char_length(btrim(content)) between 1 and 2000)
);
create index messages_sender_idx on public.messages (sender_id, created_at desc);
create index messages_recipient_idx on public.messages (recipient_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
);
create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  item_type text not null,
  item_id uuid not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint reports_reporter_id_fkey foreign key (reporter_id) references public.profiles (id) on delete cascade,
  constraint reports_reason_len check (char_length(btrim(reason)) between 1 and 1000)
);
create index reports_status_idx on public.reports (status, created_at desc);
