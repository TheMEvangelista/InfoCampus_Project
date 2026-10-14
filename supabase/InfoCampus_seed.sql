-- NÃO roda com "db push". Cole no SQL Editor do Supabase quando quiser.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
where lower(email) = lower('matheusevangelista@acad.ifma.edu.br')
on conflict (user_id, role) do nothing;

-- 2) Categorias de exemplo (ajuste os nomes como quiser).
insert into public.categories (name, slug, description) values
  ('Notícias', 'noticias', 'Novidades do campus e do instituto'),
  ('Comunidades', 'comunidades', 'Cursos, interação estudantil, comunicação'),
  ('Oportunidades', 'oportunidades', 'Estágios, mercado de trabalho e dicas'),
  ('Eventos', 'eventos', 'Palestras, oficinas e competições')
on conflict (slug) do nothing;
