import Link from "next/link";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { scaleTicks, type TimelineDomain, yearToPercent } from "@/lib/antiquityScale";
import { eraDotClass } from "@/components/EraBadge";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalDate } from "@/lib/formatHistoricalDate";
import { eraTimelinePath } from "@/lib/routes";

export interface AntiquityRow {
  era: HistoricalEra;
  periods: { key: string; title: string; start: number; end: number; href: string }[];
  milestones: { key: string; title: string; year: number; href: string }[];
}

// Por debajo de este ancho (en % de la línea) el nombre de la etapa no cabe: se ve al pasar el ratón.
const MIN_LABELLED_BAND = 8;

// Las clases tienen que estar escritas enteras para que Tailwind las genere.
const BAND_CLASS: Record<HistoricalEra, string> = {
  ROMAN: "border-era-rome/60 bg-era-rome/10 text-era-rome",
  ANCIENT_GREECE: "border-era-greece/60 bg-era-greece/10 text-era-greece",
  HISPANIA: "border-era-hispania/60 bg-era-hispania/10 text-era-hispania",
};

// La Línea de la Antigüedad: una sola escala de tiempo con una franja por civilización, sus etapas como
// bandas y sus hitos como puntos, para ver que todo ocurre a la vez (Maratón y la República romana son del
// mismo siglo). Cada punto lleva a su tema, o a la cronología completa si aún no tiene tema. Se pinta en el
// servidor; en pantallas estrechas se desliza en horizontal para que los siglos no se aplasten.
export function AntiquityTimeline({ rows, domain }: { rows: AntiquityRow[]; domain: TimelineDomain }) {
  const ticks = scaleTicks(domain, 200);
  const left = (year: number) => `${yearToPercent(year, domain)}%`;

  return (
    <div>
      <p className="mb-3 text-xs text-muted sm:hidden">Desliza para recorrer los siglos.</p>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[44rem]">
          {rows.map((row) => (
            <div key={row.era} className="grid grid-cols-[7.5rem_1fr] items-center gap-4 border-b border-border py-4">
              <div>
                <Link href={eraTimelinePath(row.era)} className="font-display text-sm font-semibold tracking-wide hover:text-accent">
                  {ERA_LABELS[row.era]}
                </Link>
                <p className="text-xs text-muted">{row.milestones.length} hitos</p>
              </div>

              <div className="relative h-14">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden="true" />
                {row.periods.map((period) => (
                  <Link
                    key={period.key}
                    href={period.href}
                    style={{ left: left(period.start), width: `calc(${left(period.end)} - ${left(period.start)})` }}
                    className={`absolute inset-y-0 overflow-hidden rounded-md border-l-2 px-1.5 pt-0.5 text-[11px] font-medium leading-tight whitespace-nowrap hover:opacity-80 ${BAND_CLASS[row.era]}`}
                    title={period.title}
                    aria-label={period.title}
                  >
                    {yearToPercent(period.end, domain) - yearToPercent(period.start, domain) >= MIN_LABELLED_BAND && period.title}
                  </Link>
                ))}
                {row.milestones.map((milestone) => (
                  <Link
                    key={milestone.key}
                    href={milestone.href}
                    style={{ left: left(milestone.year) }}
                    aria-label={`${formatHistoricalDate({ year: milestone.year })}: ${milestone.title}`}
                    className="group absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 p-1"
                  >
                    <span
                      className={`block size-2.5 rounded-full ring-2 ring-background transition-transform group-hover:scale-150 group-focus-visible:scale-150 ${eraDotClass(row.era)}`}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden w-max max-w-56 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block group-focus-visible:block"
                    >
                      {formatHistoricalDate({ year: milestone.year })} · {milestone.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-[7.5rem_1fr] gap-4 pt-2" aria-hidden="true">
            <span />
            <div className="relative h-5">
              {ticks.map((tick) => (
                <span
                  key={tick.year}
                  style={{ left: left(tick.year) }}
                  className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] text-muted"
                >
                  {tick.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
