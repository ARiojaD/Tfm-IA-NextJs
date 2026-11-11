import { z } from "zod";
import { HISTORICAL_ERAS } from "../value-objects/HistoricalEra";
import { TOPIC_CATEGORIES } from "../value-objects/TopicCategory";
import { yearAppearsIn } from "./TopicDrafts";

// Lo que el modelo de lenguaje puede rellenar en la propuesta de un usuario a partir de un fragmento
// pegado. No hay `source` a propósito: un modelo inventaría referencias, y la fuente es justo lo que
// permite a un administrador comprobar la propuesta. `found` es false cuando el fragmento no tiene nada
// que proponer. Los años valen 0 cuando el fragmento no los dice.
const calendarEra = z.enum(["BC", "AD"]);
const year = z.number().int().min(0).max(3000);
const month = z.number().int().min(0).max(12);

export const GeneratedEventProposalSchema = z.strictObject({
  found: z.boolean(),
  title: z.string().trim().max(120),
  year,
  era: calendarEra,
  month,
  description: z.string().trim().max(1000),
});

export const GeneratedNewTopicProposalSchema = z.strictObject({
  found: z.boolean(),
  title: z.string().trim().max(120),
  civilization: z.enum(HISTORICAL_ERAS),
  category: z.enum(TOPIC_CATEGORIES),
  summary: z.string().trim().max(300),
  startYear: year,
  startEra: calendarEra,
  startMonth: month,
  endYear: year,
  endEra: calendarEra,
  endMonth: month,
  description: z.string().trim().max(4000),
});

export type GeneratedEventProposal = z.infer<typeof GeneratedEventProposalSchema>;
export type GeneratedNewTopicProposal = z.infer<typeof GeneratedNewTopicProposalSchema>;

// Un año que no aparece en el fragmento es inventado: se deja vacío para que lo complete el usuario. Lo
// mismo su mes, que sin el año no significa nada.
function dateFields(yearValue: number, monthValue: number, fragment: string): { year: string; month: string } {
  if (yearValue === 0 || !yearAppearsIn(yearValue, fragment)) return { year: "", month: "" };
  return { year: String(yearValue), month: monthValue === 0 ? "" : String(monthValue) };
}

// Convierte lo que propuso el modelo en los valores del formulario de propuesta, que el usuario revisa.
export function eventProposalValues({ title, year: yearValue, era, month: monthValue, description }: GeneratedEventProposal, fragment: string) {
  return { title, ...dateFields(yearValue, monthValue, fragment), era, description };
}

export function newTopicProposalValues(generated: GeneratedNewTopicProposal, fragment: string) {
  const start = dateFields(generated.startYear, generated.startMonth, fragment);
  const end = dateFields(generated.endYear, generated.endMonth, fragment);

  return {
    title: generated.title,
    civilization: generated.civilization,
    category: generated.category,
    summary: generated.summary,
    startYear: start.year,
    startEra: generated.startEra,
    startMonth: start.month,
    endYear: end.year,
    endEra: generated.endEra,
    endMonth: end.month,
    description: generated.description,
  };
}

export type EventProposalValues = ReturnType<typeof eventProposalValues>;
export type NewTopicProposalValues = ReturnType<typeof newTopicProposalValues>;
