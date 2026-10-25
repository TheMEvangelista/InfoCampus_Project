import { AppShell } from "@/components/AppShell";
import { BackButton, Empty, EventRow, PageHeading } from "@/components/CampusContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Calendar } from "@/components/UI/calendar";
import { useCampusData } from "@/hooks/useCampusData";
import { dateLong } from "@/lib/format";
import { createCalendarEntries, type CalendarEntry } from "@/lib/sample-events";
import { format, isSameDay, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export function EventsPage() {
  const { events } = useCampusData();
  const [initialMonth] = useState(() => startOfMonth(new Date()));
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEntry | null>(null);
  const sampleEntries = useMemo(() => createCalendarEntries(initialMonth), [initialMonth]);
  const eventList = useMemo(
    () =>
      [
        ...sampleEntries,
        ...(events.data ?? []).map((event) => ({ ...event, category: "event" as const })),
      ].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [events.data, sampleEntries],
  );
  const prioritizedEvents = useMemo(() => {
    if (!highlightedEventId) return eventList;
    const highlighted = eventList.find((event) => event.id === highlightedEventId);
    return highlighted
      ? [highlighted, ...eventList.filter((event) => event.id !== highlightedEventId)]
      : eventList;
  }, [eventList, highlightedEventId]);
  const eventDays = eventList.map((event) => new Date(event.starts_at));

  function selectDay(day: Date | undefined) {
    setSelectedDay(day);
    const event = day ? eventList.find((item) => isSameDay(new Date(item.starts_at), day)) : null;
    setHighlightedEventId(event?.id ?? null);
  }

  function changeMonth(nextMonth: Date) {
    setMonth(nextMonth);
    if (selectedDay && !isSameMonth(selectedDay, nextMonth)) {
      setSelectedDay(undefined);
      setHighlightedEventId(null);
    }
  }

  function openEvent(event: CalendarEntry) {
    setHighlightedEventId(event.id);
    setSelectedDay(new Date(event.starts_at));
    setMonth(startOfMonth(new Date(event.starts_at)));
    setActiveEvent(event);
  }

  return (
    <AppShell immersive>
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 pt-4">
          <BackButton fallbackTo="/" />
          <PageHeading title="Eventos" subtitle="Encontros, oficinas e atividades do campus." />
        </div>

        <main className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden pb-4 xl:grid-cols-[minmax(27.25rem,0.85fr)_minmax(0,1.15fr)] xl:grid-rows-1">
          <section className="rounded-2xl border border-border bg-card p-3 shadow-card sm:p-5">
            <h2 className="mb-3 text-lg font-bold">Calendário</h2>
            <Calendar
              mode="single"
              showOutsideDays={false}
              month={month}
              onMonthChange={changeMonth}
              selected={selectedDay}
              onSelect={selectDay}
              locale={ptBR}
              modifiers={{ eventDay: eventDays }}
              modifiersClassNames={{
                eventDay:
                  "font-semibold text-primary [&>button]:rounded-md [&>button]:border [&>button]:border-primary/70",
              }}
              classNames={{ today: "" }}
              className="mx-auto w-full max-w-[24.25rem] bg-transparent p-2 [--cell-size:2.2rem]"
            />
          </section>

          <section
            aria-labelledby="events-list-title"
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <h2
              id="events-list-title"
              className="shrink-0 border-b border-border px-5 py-4 text-lg font-bold"
            >
              Eventos e feriados
            </h2>
            {events.isLoading ? (
              <p className="p-5 text-sm text-muted-foreground">Carregando eventos…</p>
            ) : events.isError ? (
              <p className="p-5 text-sm text-destructive">Não foi possível carregar os eventos.</p>
            ) : prioritizedEvents.length ? (
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scrollbar-none">
                {prioritizedEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => openEvent(event)}
                    className={`block w-full rounded-xl border border-border px-3 text-left transition-colors transition-opacity ${
                      highlightedEventId && highlightedEventId !== event.id
                        ? "bg-background opacity-50"
                        : "bg-warning/10 opacity-100"
                    }`}
                  >
                    <EventRow event={event} balanced />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <Empty text="Ainda não há eventos cadastrados." />
              </div>
            )}
          </section>
        </main>
      </div>

      <Dialog open={!!activeEvent} onOpenChange={(open) => !open && setActiveEvent(null)}>
        {activeEvent && (
          <DialogContent className="h-[60vh] w-[90vw] max-w-none overflow-y-auto sm:w-[60vw] sm:rounded-2xl">
            <DialogHeader className="pr-7 text-left">
              <DialogDescription>
                {activeEvent.category === "holiday" ? "Feriado · " : "Evento · "}
                {dateLong(activeEvent.starts_at)}
              </DialogDescription>
              <DialogTitle className="text-2xl">{activeEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {activeEvent.summary && (
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {activeEvent.summary}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{activeEvent.location ?? "IFMA"}</span>
              </div>
              {activeEvent.category === "event" && (
                <p className="text-sm font-medium">
                  {format(new Date(activeEvent.starts_at), "HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}
