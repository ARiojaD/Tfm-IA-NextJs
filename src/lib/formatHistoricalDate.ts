import type { HistoricalDate } from "@/domain/value-objects/HistoricalDate";

export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export function formatHistoricalDate({ year, month }: HistoricalDate): string {
  const yearLabel = year < 0 ? `${-year} a.C.` : `${year} d.C.`;

  return month ? `${MONTHS[month - 1]} de ${yearLabel}` : yearLabel;
}
