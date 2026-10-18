-- Inserção dos editais extraídos e das oportunidades de referência
insert into public.opportunities (id, title, type, description, deadline, link, edital_url, attachment_urls, registration_url) values
  (
    'd1000001-0000-4000-8000-000000000001',
    'EDITAL PRPGI Nº 223/2026 - BOLSA DE DESENVOLVIMENTO INSTITUCIONAL',
    'bolsa',
    'A Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação, no uso das atribuições que lhe são conferidas pelo Art. 19, inciso II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão, torna público o presente edital contendo as normas para a inscrição, seleção e classificação dos candidatos à Bolsa de Desenvolvimento Institucional, vigência 2026/2027.',
    '2026-09-16',
    'https://prpgi.ifma.edu.br/editais/edital-223-2026',
    'https://prpgi.ifma.edu.br/editais/edital-prpgi-223-2026.pdf',
    array['https://prpgi.ifma.edu.br/editais/223-2026/anexos.zip'],
    'https://prpgi.ifma.edu.br/inscricoes/edital-223-2026'
  ),
  (
    'd1000001-0000-4000-8000-000000000002',
    'EDITAL PRPGI Nº 98/2026 - INTERCÂMBIO NACIONAL',
    'pesquisa',
    'A Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação (PRPGI), no uso das atribuições que lhe são conferidas pelo Artigo 19, inciso II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão (IFMA), torna público o presente edital, de fluxo contínuo, aos interessados em submeter suas solicitações (na forma de propostas) de auxílio individual para a participação em viagens nacionais de estudos e pesquisas de natureza científica/tecnológica de curta duração.',
    '2026-09-21',
    'https://prpgi.ifma.edu.br/editais/edital-98-2026',
    'https://prpgi.ifma.edu.br/editais/edital-prpgi-98-2026.pdf',
    array['https://prpgi.ifma.edu.br/editais/98-2026/anexos.zip'],
    'https://prpgi.ifma.edu.br/inscricoes/edital-98-2026'
  ),
  (
    'd1000001-0000-4000-8000-000000000003',
    'EDITAL PRPGI Nº 21/2026 - PIBIC ENSINO SUPERIOR 2026/2027',
    'pesquisa',
    'A Pró-reitoria de Pesquisa, Pós-Graduação e Inovação - PRPGI, no uso das atribuições que lhe são conferidas pelo Art. 19, II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão - IFMA, torna público aos interessados o presente edital contendo as normas para a inscrição, seleção e classificação de projetos de pesquisa, com vigência no biênio 2026/2027, no âmbito do Programa Institucional de Bolsas de Iniciação Científica – PIBIC, Ensino Superior.',
    '2026-04-13',
    'https://prpgi.ifma.edu.br/editais/edital-21-2026',
    'https://prpgi.ifma.edu.br/editais/edital-prpgi-21-2026.pdf',
    array['https://prpgi.ifma.edu.br/editais/21-2026/anexos.zip'],
    'https://prpgi.ifma.edu.br/inscricoes/edital-21-2026'
  ),
  (
    'd1000001-0000-4000-8000-000000000004',
    'Desenvolvedor(a) júnior',
    'emprego',
    'Vaga CLT em empresa de software de São Luís. Conhecimentos em React e Node.',
    '2026-10-23',
    null,
    null,
    '{}',
    null
  ),
  (
    'd1000001-0000-4000-8000-000000000005',
    'Pesquisa em energias renováveis',
    'pesquisa',
    'Grupo de pesquisa busca estudantes para projeto de energia solar.',
    '2026-10-18',
    null,
    null,
    '{}',
    null
  ),
  (
    'd1000001-0000-4000-8000-000000000006',
    'Estágio em suporte de redes',
    'estagio',
    'Estágio de 30h semanais no setor de TI do campus.',
    '2026-10-10',
    null,
    null,
    '{}',
    null
  ),
  (
    'd1000001-0000-4000-8000-000000000007',
    'Estágio em desenvolvimento web',
    'estagio',
    'Vaga de estágio para estudantes a partir do 4º período. 20h semanais, bolsa + auxílio transporte.',
    '2026-10-24',
    null,
    null,
    '{}',
    null
  ),
  (
    'd1000001-0000-4000-8000-000000000008',
    'Bolsa de Iniciação científica em IA',
    'bolsa',
    'Projeto de pesquisa sobre visão computacional aplicada à agricultura.',
    '2026-11-15',
    null,
    null,
    '{}',
    null
  ),
  (
    'd1000001-0000-4000-8000-000000000009',
    'Monitoria de Banco de Dados',
    'monitoria',
    'Seleção de monitores para a disciplina de Banco de Dados.',
    '2026-10-30',
    null,
    null,
    '{}',
    null
  )
on conflict (id) do nothing;

