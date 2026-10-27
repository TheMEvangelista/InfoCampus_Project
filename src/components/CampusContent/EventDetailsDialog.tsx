import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";
import type { CategorizedEvent } from "@/lib/event-category";
import { eventCategoryStyles } from "@/lib/event-category";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/UI/dialog";

export function EventDetailsDialog({ event, onClose }: { event: CategorizedEvent | null; onClose: () => void }) {
  const category = event ? eventCategoryStyles[event.category] : null;
  const date = event ? new Date(event.starts_at) : null;
  const informationTone = event?.category === "holiday"
    ? "bg-blue-100/80 text-blue-950"
    : event?.category === "deadline"
      ? "bg-red-100/80 text-red-950"
      : event?.category === "start"
        ? "bg-green-100/80 text-green-950"
        : "bg-amber-100/80 text-amber-950";

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      {event && date && category && (
        <DialogContent className="max-h-[85vh] w-[92vw] max-w-3xl overflow-y-auto rounded-2xl p-0">
          <DialogHeader className="border-b border-border px-6 pb-5 pt-6 pr-12 text-left sm:px-8 sm:pt-8">
            <DialogDescription className="font-medium">{category.label} · {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</DialogDescription>
            <DialogTitle className="text-2xl leading-tight sm:text-3xl">{event.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 pb-7 sm:px-8 sm:pb-8">
            {event.summary && (
              <section className={`rounded-2xl p-5 sm:p-6 ${informationTone}`}>
                <h3 className="mb-2 font-bold">Informações importantes</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.summary}</p>
              </section>
            )}
            {event.category !== "holiday" && <section className="rounded-2xl border border-border p-5 sm:p-6">
              <h3 className="mb-4 font-semibold">Dados do evento</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted-foreground">Data e horário</dt><dd className="mt-1 flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4 text-primary" />{format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Local</dt><dd className="mt-1 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" />{event.location ?? "IFMA"}</dd></div>
              </dl>
            </section>}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
