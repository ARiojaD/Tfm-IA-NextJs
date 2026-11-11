import type { HistoricalPeriod } from "@/domain/value-objects/HistoricalPeriod";
import { formatHistoricalDate } from "./formatHistoricalDate";

// Solo los años, como se leen en la cabecera de un tema: "52 a.C.", "100 – 44 a.C.", "63 a.C. – 14 d.C.".
export function formatHistoricalPeriod({ start, end }: HistoricalPeriod): string {
  const startLabel = formatHistoricalDate({ year: start.year });
  if (!end || end.year === start.year) {
    return startLabel;
  }

  const endLabel = formatHistoricalDate({ year: end.year });
  const sameEra = start.year < 0 === end.year < 0;
  return sameEra ? `${Math.abs(start.year)} – ${endLabel}` : `${startLabel} – ${endLabel}`;
}
