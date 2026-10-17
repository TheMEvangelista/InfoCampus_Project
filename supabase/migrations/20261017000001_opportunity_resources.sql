alter table public.opportunities
  add column if not exists edital_url text,
  add column if not exists attachment_urls text[] not null default '{}',
  add column if not exists registration_url text;

alter table public.opportunities
  drop constraint if exists opportunities_edital_url_http,
  drop constraint if exists opportunities_registration_url_http,
  drop constraint if exists opportunities_attachment_urls_len;

alter table public.opportunities
  add constraint opportunities_edital_url_http
    check (edital_url is null or (edital_url ~* '^https?://' and char_length(edital_url) <= 2048)),
  add constraint opportunities_registration_url_http
    check (registration_url is null or (registration_url ~* '^https?://' and char_length(registration_url) <= 2048)),
  add constraint opportunities_attachment_urls_len
    check (cardinality(attachment_urls) <= 10);