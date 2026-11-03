import type { TopicBasicsValues } from "@/components/admin/TopicBasicsForm";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// The editor's form shows years without sign plus a.C./d.C., as people write them; the domain stores BC
// years as negative numbers. TopicEditorInputs does the opposite conversion on the server.

function dateValues(date: HistoricalDate | undefined) {
  if (!date) return { year: "", era: "BC", month: "" };
  return { year: String(Math.abs(date.year)), era: date.year < 0 ? "BC" : "AD", month: date.month ? String(date.month) : "" };
}

export function toTopicBasicsValues(topic: HistoricalTopic): TopicBasicsValues {
  const start = dateValues(topic.period.start);
  const end = dateValues(topic.period.end);

  return {
    title: topic.title,
    era: topic.era,
    category: topic.category,
    summary: topic.summary,
    startYear: start.year,
    startEra: start.era,
    startMonth: start.month,
    endYear: end.year,
    endEra: end.era,
    endMonth: end.month,
  };
}

// Most topics of this site are BC, so that is the default.
export function emptyTopicBasicsValues(era: HistoricalEra): TopicBasicsValues {
  return {
    title: "",
    era,
    category: "PEOPLE",
    summary: "",
    startYear: "",
    startEra: "BC",
    startMonth: "",
    endYear: "",
    endEra: "BC",
    endMonth: "",
  };
}
