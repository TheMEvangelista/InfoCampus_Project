insert into public.communities (name, slug, description)
values
  ('Design & UX', 'design-ux', 'Interfaces, prototipagem e experiência do usuário.'),
  ('Empreendedorismo', 'empreendedorismo', 'Startups, pitch e inovação no campus.'),
  ('Games IFMA', 'games-ifma', 'Desenvolvimento de jogos e game jams.'),
  ('InfoDev', 'infodev', 'Comunidade de desenvolvimento de software do campus.'),
  ('Iniciação Científica', 'iniciacao-cientifica', 'Grupos de pesquisa e bolsas PIBIC.'),
  ('Robótica IFMA', 'robotica-ifma', 'Projetos de robótica e automação.')
on conflict (slug) do nothing;
