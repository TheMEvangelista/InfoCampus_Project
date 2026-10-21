import { MapPin } from "lucide-react";
import { CampusEvent } from "@/lib/content";
import { dayMonth } from "@/lib/format";

export function EventRow({ event }: { event: CampusEvent }) {
  const date = dayMonth(event.starts_at);
  return (
    <div className="flex gap-3 border-b border-border py-3 last:border-0">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-primary-soft text-primary-deep">
        <b className="text-lg leading-5">{date.day}</b>
        <span className="text-[10px] font-bold">{date.month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold">{event.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{event.summary}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {event.location ?? "IFMA"}
        </p>
      </div>
    </div>
  );
}
