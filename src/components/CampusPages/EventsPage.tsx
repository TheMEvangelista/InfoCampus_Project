import { AppShell } from "@/components/AppShell";
import { BackButton, Empty, EventRow, PageHeading } from "@/components/CampusContent";
import { EventDetailsDialog } from "@/components/CampusContent/EventDetailsDialog";
import { Calendar } from "@/components/UI/calendar";
import { useCampusData } from "@/hooks/useCampusData";
import { createCalendarEntries } from "@/lib/sample-events";
import { getEventCategory, eventCategoryStyles, type CategorizedEvent } from "@/lib/event-category";
import { isSameDay, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";

export function EventsPage() {
  const { events } = useCampusData();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<CategorizedEvent | null>(null);
  const sampleEntries = useMemo(() => createCalendarEntries(month), [month]);
  const eventList = useMemo(
    () =>
      [
        ...sampleEntries,
        ...(events.data ?? []).map((event) => ({ ...event, category: getEventCategory(event) })),
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
  const categoryDays = (category: CategorizedEvent["category"]) => eventList.filter((event) => event.category === category).map((event) => new Date(event.starts_at));

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

  function openEvent(event: CategorizedEvent) {
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
              weekStartsOn={1}
              modifiers={{ holidayDay: categoryDays("holiday"), deadlineDay: categoryDays("deadline"), startDay: categoryDays("start"), regularEventDay: categoryDays("event") }}
              modifiersClassNames={{
                holidayDay: "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-blue-500 [&>button]:after:content-['']",
                deadlineDay: "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-red-500 [&>button]:after:content-['']",
                startDay: "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-green-500 [&>button]:after:content-['']",
                regularEventDay: "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-amber-500 [&>button]:after:content-['']",
              }}
              classNames={{ today: "" }}
              className="mx-auto w-full max-w-97 bg-transparent p-2 [--cell-size:2rem]"
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 px-2 text-xs text-muted-foreground">
              {(["holiday", "event", "deadline", "start"] as const).map((category) => (
                <span key={category} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${category === "holiday" ? "bg-blue-500" : category === "event" ? "bg-amber-500" : category === "deadline" ? "bg-red-500" : "bg-green-500"}`} />{eventCategoryStyles[category].label}</span>
              ))}
            </div>
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
                    className={`block w-full rounded-xl border px-4 text-left transition-colors ${eventCategoryStyles[event.category].card} ${highlightedEventId && highlightedEventId !== event.id ? "opacity-55" : "opacity-100"}`}
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

      <EventDetailsDialog event={activeEvent} onClose={() => setActiveEvent(null)} />
    </AppShell>
  );
}
