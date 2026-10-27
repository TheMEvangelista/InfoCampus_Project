insert into public.events (title, summary, location, starts_at)
select
  'Ponto facultativo — Dia do Servidor Público Federal',
  'Informo que, conforme a Portaria MGI nº 8.821, de 26 de outubro de 2026, o ponto facultativo alusivo ao Dia do Servidor Público Federal, originalmente previsto para 28 de outubro, foi transferido para sexta-feira (30/10).'
    || E'\n\n' || 'Considerando também a realização do evento em homenagem ao Dia do Professor e ao Dia do Servidor Público do IFMA – Campus Caxias, informamos que as atividades ocorrerão da seguinte forma:'
    || E'\n\n' || '📌 Quarta-feira (28/10): aulas e atividades normais em todos os turnos.'
    || E'\n\n' || '📌 Quinta-feira (29/10): aulas e atividades até às 17h, com suspensão das aulas no turno noturno em razão do evento institucional.'
    || E'\n\n' || '📌 Sexta-feira (30/10): ponto facultativo, sem aulas e atividades regulares durante todo o dia.',
  null,
  timestamptz '2026-10-30 00:00:00-03'
where not exists (
  select 1
  from public.events
  where title = 'Ponto facultativo — Dia do Servidor Público Federal'
    and starts_at >= timestamptz '2026-10-30 00:00:00-03'
    and starts_at < timestamptz '2026-10-31 00:00:00-03'
);
