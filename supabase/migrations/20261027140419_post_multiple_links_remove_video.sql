alter table public.posts
  add column link_urls text[] not null default '{}';

update public.posts
set link_urls = array_append(link_urls, link_url)
where link_url is not null and btrim(link_url) <> '';

alter table public.posts
  drop constraint if exists posts_video_url_http,
  drop constraint if exists posts_link_url_http,
  drop column if exists video_url,
  drop column if exists link_url,
  add constraint posts_link_urls_count
    check (
      cardinality(link_urls) <= 10
      and array_position(link_urls, null) is null
      and array_position(link_urls, '') is null
    );

grant update (content, image_url, link_urls) on public.posts to authenticated;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
where id = 'post-media';
