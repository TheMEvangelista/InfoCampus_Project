import type { CampusEvent } from "@/lib/content";
import { format } from "date-fns";

export type CalendarEntry = CampusEvent & { category: "event" | "holiday" };

function makeDateInMonth(month: Date, day: number, hour = 9) {
  const year = month.getFullYear();
  const monthNumber = String(month.getMonth() + 1).padStart(2, "0");
  const dayNumber = String(day).padStart(2, "0");
  const hourNumber = String(hour).padStart(2, "0");
  return `${year}-${monthNumber}-${dayNumber}T${hourNumber}:00:00`;
}

export function createCalendarEntries(month: Date): CalendarEntry[] {
  const monthLabel = format(month, "MM");
  const year = month.getFullYear();
  const events: CalendarEntry[] = [
    {
      id: "sample-formacao-inclusiva",
      title:
        "I Ciclo de Formação Continuada do DAI/NAPNE em Educação Especial Inclusiva: fundamentos, orientações e práticas para uma atuação inclusiva e humanizada",
      summary: `15/${monthLabel} a 31/${monthLabel} · Formação e práticas para uma atuação inclusiva e humanizada.`,
      location: "DAI/NAPNE · IFMA",
      starts_at: makeDateInMonth(month, 15, 9),
      category: "event",
    },
    {
      id: "sample-concurso-raizes",
      title: "Concurso Cultural “Raízes em Movimento: Palavras e Traços da Consciência Negra”",
      summary: `21/${monthLabel} a 31/${monthLabel} · Concurso cultural de palavras e artes visuais.`,
      location: "IFMA",
      starts_at: makeDateInMonth(month, 21, 14),
      category: "event",
    },
    {
      id: "sample-semana-informatica",
      title: "SEMANA DE INFORMÁTICA 2026 - CAMPUS PORTO FRANCO",
      summary: `22/${monthLabel} a 31/${monthLabel} · Tecnologia, informática e comunidade acadêmica.`,
      location: "Campus Porto Franco",
      starts_at: makeDateInMonth(month, 22, 8),
      category: "event",
    },
    {
      id: "sample-oficina-projetos",
      title: "Oficina de elaboração de projetos PIBIC e PIBIT IFMA",
      summary: `29/${monthLabel} a 31/${monthLabel} · Oficina para elaboração de projetos de pesquisa.`,
      location: "IFMA",
      starts_at: makeDateInMonth(month, 29, 14),
      category: "event",
    },
    {
      id: "sample-workshop-informatica",
      title: "VII Workshop de Informática - Tecnologia, inovação e Segurança para o Futuro",
      summary: `29/${monthLabel} a 31/${monthLabel} · Tecnologia, inovação e segurança.`,
      location: "IFMA",
      starts_at: makeDateInMonth(month, 29, 9),
      category: "event",
    },
    {
      id: "sample-edifica",
      title: "VII EDIFICA - Projetos de Impacto: Responsabilidade Ambiental e Viabilidade de Obras",
      summary: `30/${monthLabel} a 31/${monthLabel} · Projetos de impacto e responsabilidade ambiental.`,
      location: "IFMA",
      starts_at: makeDateInMonth(month, 30, 9),
      category: "event",
    },
  ];
  const holidays: CalendarEntry[] = [
    {
      id: "holiday-nossa-senhora-aparecida",
      title: "Dia de Nossa Senhora Aparecida",
      summary: "Feriado",
      location: "Brasil",
      starts_at: makeDateInMonth(month, 12),
      category: "holiday",
    },
    {
      id: "holiday-dia-dos-professores",
      title: "Dia dos Professores",
      summary: "Data comemorativa da comunidade escolar.",
      location: "IFMA",
      starts_at: makeDateInMonth(month, 15),
      category: "holiday",
    },
    {
      id: "holiday-consciencia-negra",
      title: "Dia da Consciência Negra",
      summary: "Feriado",
      location: "Brasil",
      starts_at: makeDateInMonth(month, 20),
      category: "holiday",
    },
  ];

  return [...events, ...holidays].map((event) => ({ ...event, id: `${event.id}-${year}` }));
}
