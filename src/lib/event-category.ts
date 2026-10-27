import type { CampusEvent } from "@/lib/content";

export type EventCategory = "holiday" | "event" | "deadline" | "start";
export type CategorizedEvent = CampusEvent & { category: EventCategory };

export function getEventCategory(event: Pick<CampusEvent, "title" | "summary">): EventCategory {
  const text = `${event.title} ${event.summary ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/feriado|ponto facultativo|dia do servidor publico|dia de nossa senhora|consciencia negra/.test(text)) return "holiday";
  if (/prazo|data limite|encerramento|ultimo dia|fim das inscricoes|termino das inscricoes/.test(text)) return "deadline";
  if (/volta as aulas|inicio das aulas|inicio do semestre|rematricula|matricula|inicio do periodo/.test(text)) return "start";
  return "event";
}

export const eventCategoryStyles: Record<EventCategory, { label: string; card: string; day: string }> = {
  holiday: { label: "Feriado", card: "border-blue-200 bg-blue-50 text-blue-800", day: "bg-blue-100 text-blue-800 border-blue-400" },
  event: { label: "Evento", card: "border-amber-200 bg-amber-50 text-amber-900", day: "bg-amber-100 text-amber-900 border-amber-400" },
  deadline: { label: "Data limite", card: "border-red-200 bg-red-50 text-red-800", day: "bg-red-100 text-red-800 border-red-400" },
  start: { label: "Início", card: "border-green-200 bg-green-50 text-green-800", day: "bg-green-100 text-green-800 border-green-400" },
};
