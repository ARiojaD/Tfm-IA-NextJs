import Link from "next/link";
import type { TimelineItem, TimelineTopicLink } from "@/application/use-cases/GetEraTimelineUseCase";
import type { HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import { eraDotClass } from "@/components/EraBadge";
import { formatHistoricalDate, MONTHS } from "@/lib/formatHistoricalDate";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { eventPath, topicPath } from "@/lib/routes";

// La cronología completa de una civilización: una línea vertical con las etapas como bandas, los hitos
// como puntos y, si se piden, los eventos de los temas como puntos huecos más discretos. Todo se pinta en
// el servidor: no necesita JavaScript.
export function EraTimelineView({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-5 before:absolute before:inset-y-2 before:left-[0.4375rem] before:w-px before:bg-border md:before:left-[9.4375rem]">
      {items.map((item) => {
        if (item.kind === "PERIOD") return <PeriodBand key={item.key} item={item} />;
        if (item.kind === "MILESTONE") return <Milestone key={item.key} item={item} />;
        return <TopicEvent key={item.key} item={item} />;
      })}
    </ol>
  );
}

const rowClass = "relative grid gap-2 pl-8 md:grid-cols-[8rem_1fr] md:gap-8 md:pl-0";

function DateLabel({ date, quiet = false }: { date: HistoricalDate; quiet?: boolean }) {
  return (
    <p className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-1 md:pt-1 md:text-right">
      {date.month && (
        <span className="order-2 text-xs uppercase tracking-wider text-muted md:order-1">{MONTHS[date.month - 1]}</span>
      )}
      <span
        className={`order-1 font-serif font-semibold leading-none md:order-2 ${quiet ? "text-lg text-muted" : "text-2xl text-accent"}`}
      >
        {formatHistoricalDate({ year: date.year })}
      </span>
    </p>
  );
}

// El inicio de una etapa abre una banda con su resumen, que ya está escrito en el tema de la etapa. Una
// subetapa (una etapa dentro de otra) se pinta más pequeña y metida hacia dentro, para que se lea como
// parte de la grande.
function PeriodBand({ item }: { item: Extract<TimelineItem, { kind: "PERIOD" }> }) {
  const Heading = item.nested ? "h3" : "h2";

  return (
    <li className={`relative pl-8 ${item.nested ? "md:pl-[13rem]" : "pt-4 md:pl-[11rem]"}`}>
      <span
        className={`absolute rounded-sm bg-accent ${
          item.nested
            ? "left-[0.1875rem] top-4 h-4 w-[0.5rem] opacity-60 md:left-[9.1875rem]"
            : "left-[0.0625rem] top-6 h-6 w-[0.75rem] md:left-[9.0625rem]"
        }`}
        aria-hidden="true"
      />
      <section
        className={
          item.nested
            ? "rounded-2xl border-l-2 border-accent/60 bg-surface p-4"
            : "rounded-2xl border-l-4 border-accent bg-accent-soft p-5"
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {item.nested ? "Subetapa" : "Etapa"} · {formatHistoricalPeriod(item.period)}
        </p>
        <Heading className={`mt-1 font-serif font-semibold ${item.nested ? "text-xl" : "text-2xl"}`}>{item.topic.title}</Heading>
        <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
        <Link href={topicPath(item.topic)} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
          Leer la {item.nested ? "subetapa" : "etapa"} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </li>
  );
}

function Milestone({ item }: { item: Extract<TimelineItem, { kind: "MILESTONE" }> }) {
  return (
    <li className={rowClass}>
      <span
        className={`absolute left-0 top-2 size-[0.9375rem] rounded-full border-[3px] border-background ${item.topic ? eraDotClass(item.topic.era) : "bg-muted"} md:left-[9rem]`}
        aria-hidden="true"
      />
      <DateLabel date={item.date} />
      <article className="rounded-2xl border border-border bg-surface p-5 md:ml-4">
        <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
        {item.topic ? <TopicLink topic={item.topic} /> : <NoTopicYet />}
      </article>
    </li>
  );
}

// El detalle de los temas: más discreto que un hito, y enlaza al evento exacto dentro de su tema. Es un
// <a> y no un Link para que el navegador active :target y el tema resalte el evento al llegar.
function TopicEvent({ item }: { item: Extract<TimelineItem, { kind: "EVENT" }> }) {
  return (
    <li className={rowClass}>
      <span
        className="absolute left-[0.1875rem] top-2.5 size-[0.5625rem] rounded-full border-2 border-muted bg-background md:left-[9.1875rem]"
        aria-hidden="true"
      />
      <DateLabel date={item.date} quiet />
      <article className="rounded-2xl border border-dashed border-border p-4 md:ml-4">
        <h3 className="font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
        <a href={eventPath(item.topic, item.eventId)} className="mt-2 inline-block text-sm text-accent hover:underline">
          En el tema «{item.topic.title}» <span aria-hidden="true">→</span>
        </a>
      </article>
    </li>
  );
}

function TopicLink({ topic }: { topic: TimelineTopicLink }) {
  return (
    <Link href={topicPath(topic)} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
      Leer el tema «{topic.title}» <span aria-hidden="true">→</span>
    </Link>
  );
}

// Un hito sin tema todavía: invita a proponerlo, y un administrador lo revisará.
function NoTopicYet() {
  return (
    <p className="mt-3 text-sm text-muted">
      Aún sin tema ·{" "}
      <Link href="/mi-biblioteca/propuestas?tipo=tema-nuevo" className="font-medium text-accent hover:underline">
        Proponerlo
      </Link>
    </p>
  );
}
