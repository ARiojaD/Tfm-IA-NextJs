import type { HistoricalEvent } from "@/core/domain/HistoricalEvent";
import { formatHistoricalDate, MONTHS } from "@/lib/formatHistoricalDate";
import { EraBadge, eraDotClass } from "./EraBadge";

export function Timeline({ events }: { events: HistoricalEvent[] }) {
  return (
    <ol className="relative space-y-6 before:absolute before:inset-y-2 before:left-[0.4375rem] before:w-px before:bg-border md:before:left-[9.4375rem]">
      {events.map((event) => (
        <li
          key={`${event.date.year}-${event.title}`}
          className="relative grid gap-2 pl-8 md:grid-cols-[8rem_1fr] md:gap-8 md:pl-0"
        >
          <span
            className={`absolute left-0 top-2 size-[0.9375rem] rounded-full border-[3px] border-background ${eraDotClass(event.era)} md:left-[9rem]`}
            aria-hidden="true"
          />
          <p className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-1 md:pt-1 md:text-right">
            {event.date.month && (
              <span className="order-2 text-xs uppercase tracking-wider text-muted md:order-1">
                {MONTHS[event.date.month - 1]}
              </span>
            )}
            <span className="order-1 font-serif text-2xl font-semibold leading-none text-accent md:order-2">
              {formatHistoricalDate({ year: event.date.year })}
            </span>
          </p>
          <article className="rounded-2xl border border-border bg-surface p-5 md:ml-4">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="font-serif text-xl font-semibold">{event.title}</h3>
              <EraBadge era={event.era} />
            </div>
            <p className="text-sm leading-6 text-muted">{event.description}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
