import type { TopicBasicsValues } from "@/components/admin/TopicBasicsForm";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// El formulario del editor muestra los años sin signo y con a.C./d.C., como los escribe la gente; el
// dominio guarda los años antes de Cristo como números negativos. `TopicEditorInputs` hace la conversión
// contraria en el servidor.

export function toDateFields(date: HistoricalDate | undefined) {
  if (!date) return { year: "", era: "BC", month: "" };
  return { year: String(Math.abs(date.year)), era: date.year < 0 ? "BC" : "AD", month: date.month ? String(date.month) : "" };
}

export function toTopicBasicsValues(topic: HistoricalTopic): TopicBasicsValues {
  const start = toDateFields(topic.period.start);
  const end = toDateFields(topic.period.end);

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

// La mayoría de los temas de este sitio son antes de Cristo, así que es el valor por defecto.
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
