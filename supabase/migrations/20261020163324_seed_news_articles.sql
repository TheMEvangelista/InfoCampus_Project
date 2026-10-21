insert into public.articles (
  slug,
  title,
  subtitle,
  content,
  tags,
  published,
  created_at
)
values
  (
    'ciclo-formacao-continuada-dai-anapne',
    'I Ciclo de Formação Continuada do DAI/ANAPNE em Educação Especial Inclusiva: fundamentos, orientações e práticas para uma atuação inclusiva e humanizada',
    'De 15/5 a 15/12',
    'I Ciclo de Formação Continuada do DAI/ANAPNE em Educação Especial Inclusiva. Período: de 15/5 a 15/12.',
    array['formação', 'inclusão'],
    true,
    now() - interval '1 second'
  ),
  (
    'concurso-cultural-raizes-em-movimento',
    'Concurso Cultural “Raízes em Movimento: Palavras e Traços da Consciência Negra”',
    'De 21/9 a 19/11',
    'Concurso Cultural “Raízes em Movimento: Palavras e Traços da Consciência Negra”. Período: de 21/9 a 19/11.',
    array['cultura', 'consciência negra'],
    true,
    now() - interval '2 seconds'
  ),
  (
    'semana-informatica-2026-porto-franco',
    'SEMANA DE INFORMÁTICA 2026 - CAMPUS PORTO FRANCO',
    'De 22/9 a 2/10',
    'Semana de Informática 2026 do Campus Porto Franco. Período: de 22/9 a 2/10.',
    array['informática', 'evento'],
    true,
    now() - interval '3 seconds'
  ),
  (
    'oficina-projetos-pibic-pibit-ifma',
    'Oficina de elaboração de projetos PIBIC e PIBIT IFMA',
    'De 29/9 a 6/10',
    'Oficina de elaboração de projetos PIBIC e PIBIT IFMA. Período: de 29/9 a 6/10.',
    array['pesquisa', 'oficina'],
    true,
    now() - interval '4 seconds'
  ),
  (
    'vii-workshop-informatica-ifma',
    'VII Workshop de Informática - Tecnologia, inovação e Segurança para o Futuro',
    'De 29/9 a 1/10',
    'VII Workshop de Informática: Tecnologia, inovação e Segurança para o Futuro. Período: de 29/9 a 1/10.',
    array['informática', 'tecnologia'],
    true,
    now() - interval '5 seconds'
  ),
  (
    'vii-edifica-projetos-de-impacto',
    'VII EDIFICA - Projetos de Impacto: Responsabilidade Ambiental e Viabilidade de Obras',
    'De 30/9 a 1/10',
    'VII EDIFICA - Projetos de Impacto: Responsabilidade Ambiental e Viabilidade de Obras. Período: de 30/9 a 1/10.',
    array['edificação', 'sustentabilidade'],
    true,
    now() - interval '6 seconds'
  )
on conflict (slug) do nothing;
