import { AppShell } from "@/components/AppShell";
import { BackButton, Empty, PageHeading } from "@/components/CampusContent";
import { EventDetailsDialog } from "@/components/CampusContent/EventDetailsDialog";
import { Calendar } from "@/components/UI/calendar";
import { useCampusData } from "@/hooks/useCampusData";
import { createCalendarEntries } from "@/lib/sample-events";
import { getEventCategory, eventCategoryStyles, type CategorizedEvent } from "@/lib/event-category";
import { isSameDay, isSameMonth, startOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { safeUrl } from "@/lib/url";

const filters = ["Todos", "Feriados", "Formação & Oficinas", "Comemorativos"] as const;

const registrationUrl = safeUrl("https://prpgi.ifma.edu.br/inscricoes/edital-223-2026");

export function EventsPage() {
  const { events } = useCampusData();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<CategorizedEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [pendingScrollEventId, setPendingScrollEventId] = useState<string | null>(null);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const eventCardRefs = useRef(new Map<string, HTMLElement>());
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
    const filtered = eventList.filter((event) => {
      if (activeFilter === "Feriados") return event.category === "holiday";
      if (activeFilter === "Formação & Oficinas") return event.category === "event";
      if (activeFilter === "Comemorativos")
        return event.category === "start" || event.category === "deadline";
      return true;
    });
    if (!highlightedEventId) return filtered;
    const highlighted = filtered.find((event) => event.id === highlightedEventId);
    return highlighted
      ? [highlighted, ...filtered.filter((event) => event.id !== highlightedEventId)]
      : filtered;
  }, [eventList, highlightedEventId, activeFilter]);
  useEffect(() => {
    if (!pendingScrollEventId) return;
    eventCardRefs.current
      .get(pendingScrollEventId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingScrollEventId(null);
  }, [pendingScrollEventId, prioritizedEvents]);
  const categoryDays = (category: CategorizedEvent["category"]) =>
    eventList
      .filter((event) => event.category === category)
      .map((event) => new Date(event.starts_at));

  function selectDay(day: Date | undefined) {
    setSelectedDay(day);
    const event = day ? eventList.find((item) => isSameDay(new Date(item.starts_at), day)) : null;
    setHighlightedEventId(event?.id ?? null);
    if (event && pageScrollRef.current && pageScrollRef.current.scrollTop > 0) {
      setActiveFilter("Todos");
      setPendingScrollEventId(event.id);
    }
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
      <div
        ref={pageScrollRef}
        className="h-full min-h-0 overflow-y-auto pb-20 scrollbar-none lg:pb-4"
      >
        <div className="pt-4 lg:pt-4">
          <BackButton fallbackTo="/" />
          <PageHeading title="Eventos" />
        </div>

        <main className="grid gap-4 pb-5 xl:grid-cols-[minmax(27.25rem,0.85fr)_minmax(0,1.15fr)] xl:pb-4">
          <div className="space-y-4">
            <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              <section className="rounded-2xl border border-border bg-card p-2 shadow-card sm:p-3.5">
                <h2 className="mb-1.5 text-sm font-bold sm:text-base">Calendário</h2>
                <Calendar
                  mode="single"
                  showOutsideDays={false}
                  month={month}
                  onMonthChange={changeMonth}
                  selected={selectedDay}
                  onSelect={selectDay}
                  locale={ptBR}
                  weekStartsOn={1}
                  modifiers={{
                    holidayDay: categoryDays("holiday"),
                    deadlineDay: categoryDays("deadline"),
                    startDay: categoryDays("start"),
                    regularEventDay: categoryDays("event"),
                  }}
                  modifiersClassNames={{
                    holidayDay:
                      "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-blue-500 [&>button]:after:content-['']",
                    deadlineDay:
                      "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-red-500 [&>button]:after:content-['']",
                    startDay:
                      "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-green-500 [&>button]:after:content-['']",
                    regularEventDay:
                      "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-amber-500 [&>button]:after:content-['']",
                  }}
                  classNames={{ today: "" }}
                  className="mx-auto w-full max-w-none bg-transparent p-0.5 [--cell-size:1.8rem] [--cell-height:1.51rem] xl:[--cell-size:2.5rem] xl:[--cell-height:2.1rem]"
                />
                <div className="mt-1.5 flex flex-wrap justify-between gap-x-2.5 gap-y-1 border-t border-border px-1 pt-1.5 text-[10px] text-muted-foreground sm:text-[11px]">
                  {(["holiday", "event", "deadline", "start"] as const).map((category) => (
                    <span key={category} className="flex items-center gap-1.5">
                      <i
                        className={`h-2 w-2 rounded-full ${category === "holiday" ? "bg-blue-500" : category === "event" ? "bg-amber-500" : category === "deadline" ? "bg-red-500" : "bg-green-500"}`}
                      />
                      {eventCategoryStyles[category].label}
                    </span>
                  ))}
                </div>
              </section>

              <aside className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-foreground">
                <div className="mb-2 flex items-center justify-between font-bold">
                  <span>Destaque do Campus</span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-emerald-700">
                    IFMA
                  </span>
                </div>
                <p className="leading-6 text-muted-foreground">
                  As inscrições para atividades com certificação acadêmica encerram 48 horas antes
                  do início da sessão. Dúvidas pelo DAI/NAPNE.
                </p>
              </aside>
            </div>
          </div>

          <section aria-labelledby="events-list-title" className="min-w-0 xl:pr-1">
            <div className="z-10 mb-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:px-5 xl:sticky xl:top-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h2 id="events-list-title" className="text-lg font-bold">
                    Eventos e feriados
                  </h2>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {format(month, "MMMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Exibindo programação oficial
                </span>
              </div>
              <div
                className="flex gap-2 overflow-x-auto border-t border-border pt-3 scrollbar-none"
                role="tablist"
                aria-label="Filtrar eventos"
              >
                {filters.map((filter) => (
                  <button
                    key={filter}
                    role="tab"
                    aria-selected={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {events.isLoading ? (
              <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground">
                Carregando eventos…
              </p>
            ) : events.isError ? (
              <p className="rounded-2xl bg-card p-5 text-sm text-destructive">
                Não foi possível carregar os eventos.
              </p>
            ) : prioritizedEvents.length ? (
              <div className="space-y-3">
                {prioritizedEvents.map((event) => {
                  const date = new Date(event.starts_at);
                  const category = eventCategoryStyles[event.category];
                  const isHoliday = event.category === "holiday";
                  return (
                    <article
                      key={event.id}
                      ref={(element) => {
                        if (element) eventCardRefs.current.set(event.id, element);
                        else eventCardRefs.current.delete(event.id);
                      }}
                      className={`scroll-mt-32 rounded-2xl border p-4 shadow-card transition-shadow sm:p-5 xl:scroll-mt-36 ${category.card} ${highlightedEventId && highlightedEventId !== event.id ? "opacity-60" : ""} ${highlightedEventId === event.id ? "ring-2 ring-primary shadow-md" : ""}`}
                    >
                      <div className="flex w-full gap-3 text-left sm:gap-5">
                        <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-current/20 bg-white/70 text-center">
                          <b className="text-2xl leading-7">{format(date, "dd")}</b>
                          <span className="text-xs font-bold uppercase">
                            {format(date, "MMM", { locale: ptBR })}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md bg-white/70 px-2 py-1 font-semibold text-foreground">
                              {isHoliday
                                ? "Feriado Nacional"
                                : event.category === "event"
                                  ? "Formação Continuada"
                                  : event.category === "deadline"
                                    ? "Data Comemorativa"
                                    : "Semana Acadêmica"}
                            </span>
                            <span>• {isHoliday ? "Dia todo" : format(date, "dd/MM")}</span>
                          </span>
                          <span className="block text-base font-bold leading-snug text-foreground">
                            {event.title}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                            {event.summary}
                          </span>
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-3 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {event.location ?? (isHoliday ? "Feriado" : "IFMA · Campus Central")}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEvent(event)}
                            className="rounded-lg border-2 border-primary bg-white/70 px-3 py-1.5 font-semibold text-primary hover:bg-primary/5"
                          >
                            Ver detalhes
                          </button>
                          {!isHoliday &&
                            event.category === "event" &&
                            (registrationUrl ? (
                              <a
                                href={registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground"
                              >
                                Inscrever-se <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground opacity-50"
                              >
                                Inscrição indisponível
                              </button>
                            ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-4">
                <Empty text="Ainda não há eventos nesta categoria." />
              </div>
            )}
          </section>
        </main>
      </div>

      <EventDetailsDialog event={activeEvent} onClose={() => setActiveEvent(null)} />
    </AppShell>
  );
}
