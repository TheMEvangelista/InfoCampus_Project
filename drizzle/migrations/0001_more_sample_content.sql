insert into public.communities (id, slug, name, description, created_by) values
 ('aaaaaaa1-0000-4000-8000-000000000004','design-ux','Design & UX','Interfaces, prototipagem e experiência do usuário.','11111111-1111-1111-1111-111111111111'),
 ('aaaaaaa1-0000-4000-8000-000000000005','games','Games IFMA','Desenvolvimento de jogos e game jams.','22222222-2222-2222-2222-222222222222'),
 ('aaaaaaa1-0000-4000-8000-000000000006','empreendedorismo','Empreendedorismo','Startups, pitch e inovação no campus.','33333333-3333-3333-3333-333333333333')
on conflict do nothing;

insert into public.posts (author_id, community_id, content, link_url) values
 ('22222222-2222-2222-2222-222222222222','aaaaaaa1-0000-4000-8000-000000000005','Game jam neste fim de semana! Tema será revelado na sexta às 19h.',null),
 ('11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-4000-8000-000000000004','Compartilhando um guia ótimo de acessibilidade para quem está fazendo o TCC.','https://www.w3.org/WAI/'),
 ('33333333-3333-3333-3333-333333333333',null,'A biblioteca terá horário estendido durante a semana de provas: até 22h.',null),
 ('11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-4000-8000-000000000003','Fui aprovada no PIBIC! Obrigada a todos que ajudaram na revisão do projeto.',null),
 ('22222222-2222-2222-2222-222222222222','aaaaaaa1-0000-4000-8000-000000000001','Alguém recomenda um curso de Docker em português?',null);

insert into public.articles (slug, title, subtitle, content, author_id, category_id, tags, featured) values
 ('restaurante-estudantil','Restaurante estudantil amplia cardápio','Novas opções vegetarianas a partir deste mês','O restaurante estudantil passa a oferecer opções vegetarianas diárias e amplia o horário de atendimento no jantar.','33333333-3333-3333-3333-333333333333','47a8475b-dc61-4bd7-9cbd-89d7ad69ab6d',array['campus','alimentação'],true),
 ('edital-monitoria-2026','Edital de monitoria 2026.2 publicado','Vagas para 18 disciplinas técnicas','Estão abertas as inscrições para monitoria remunerada e voluntária em 18 disciplinas. A seleção inclui prova escrita e entrevista.','33333333-3333-3333-3333-333333333333','4ce69941-5724-42da-8a86-0ba592ea5688',array['edital','monitoria'],false),
 ('hackathon-cidades','Hackathon Cidades Inteligentes','48 horas para criar soluções para São Luís','Equipes de até cinco pessoas terão 48 horas para criar protótipos voltados à mobilidade e sustentabilidade urbana. Premiação para os três primeiros lugares.','22222222-2222-2222-2222-222222222222','1e662fa9-344e-46b5-8865-fcb05411e3b8',array['hackathon','inovação'],true),
 ('vagas-trainee-ti','Empresas locais abrem vagas de trainee em TI','Oportunidades para recém-formados e concluintes','Três empresas parceiras do IFMA abriram programas de trainee com foco em desenvolvimento, suporte e dados.','11111111-1111-1111-1111-111111111111','46dfb0b2-cc04-4e7d-978e-d7178a315b8c',array['emprego','ti'],false),
 ('git-para-iniciantes','Git para iniciantes: o guia do calouro','Versionamento sem medo','Aprender Git cedo evita muita dor de cabeça. Neste guia mostramos commits, branches e pull requests com exemplos simples.','11111111-1111-1111-1111-111111111111','47a8475b-dc61-4bd7-9cbd-89d7ad69ab6d',array['git','tutorial'],false);

insert into public.events (title, summary, location, starts_at, created_by) values
 ('Palestra: Carreira em Dados','Bate-papo com ex-alunos que trabalham com ciência de dados.','Sala 204', now() + interval '3 days','33333333-3333-3333-3333-333333333333'),
 ('Game Jam IFMA','48 horas criando jogos em equipe.','Laboratório 5', now() + interval '8 days','22222222-2222-2222-2222-222222222222'),
 ('Mostra de Iniciação Científica','Apresentação dos projetos PIBIC do ano.','Auditório Central', now() + interval '30 days','33333333-3333-3333-3333-333333333333');

insert into public.opportunities (title, type, description, author_id, deadline) values
 ('Desenvolvedor(a) júnior','emprego','Vaga CLT em empresa de software de São Luís. Conhecimentos em React e Node.','33333333-3333-3333-3333-333333333333', current_date + 25),
 ('Pesquisa em energias renováveis','pesquisa','Grupo de pesquisa busca estudantes para projeto de energia solar.','22222222-2222-2222-2222-222222222222', current_date + 20),
 ('Estágio em suporte de redes','estagio','Estágio de 30h semanais no setor de TI do campus.','22222222-2222-2222-2222-222222222222', current_date + 12);