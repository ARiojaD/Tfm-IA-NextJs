import { z } from "zod";
import { HISTORICAL_ERAS } from "../value-objects/HistoricalEra";
import { TOPIC_CATEGORIES } from "../value-objects/TopicCategory";
import { yearAppearsIn } from "./TopicDrafts";

// What the language model may fill in a user's proposal from a pasted fragment. There is no `source` on
// purpose: a model would invent references, and the source is what lets an admin check the proposal.
// `found` is false when the fragment has nothing to propose. Years are 0 when the fragment does not say them.
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

// A year the fragment does not contain was invented: it stays empty, for the user to complete. So does
// its month, which means nothing without the year.
function dateFields(yearValue: number, monthValue: number, fragment: string): { year: string; month: string } {
  if (yearValue === 0 || !yearAppearsIn(yearValue, fragment)) return { year: "", month: "" };
  return { year: String(yearValue), month: monthValue === 0 ? "" : String(monthValue) };
}

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
