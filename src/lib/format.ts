import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function dateLong(date: string | Date) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function dateShort(date: string | Date) {
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

export function dayMonth(date: string | Date) {
  return {
    day: format(new Date(date), "dd"),
    month: format(new Date(date), "MMM", { locale: ptBR }).toUpperCase(),
  };
}
