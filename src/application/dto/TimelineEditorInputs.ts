import { z } from "zod";
import { MILESTONE_DESCRIPTION_MAX_LENGTH, MILESTONE_TITLE_MAX_LENGTH } from "@/domain/entities/TimelineMilestone";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { calendarEra, optionalMonth, toDate, year } from "./TopicEditorInputs";

// Lo que envía el editor de la cronología de una civilización: la lista entera de hitos (como JSON en un
// campo oculto), igual que las listas de un tema. Los años llegan como texto y con a.C./d.C., y aquí pasan
// a la fecha del dominio. Es estricto: un campo de más en una fila se rechaza.

export const ERA_MILESTONES_MAX = 100;

const text = (missing: string, max: number, tooLong: string) =>
  z.string({ error: missing }).trim().min(1, { error: missing }).max(max, { error: tooLong });

// Un id o un tema vacío significan "nuevo" y "sin tema".
const optionalId = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

const milestoneRow = z
  .strictObject({
    id: optionalId,
    title: text("escribe el título", MILESTONE_TITLE_MAX_LENGTH, `el título no puede superar los ${MILESTONE_TITLE_MAX_LENGTH} caracteres`),
    year: year("escribe el año"),
    era: calendarEra,
    month: optionalMonth,
    description: text(
      "escribe una frase que lo resuma",
      MILESTONE_DESCRIPTION_MAX_LENGTH,
      `la descripción no puede superar los ${MILESTONE_DESCRIPTION_MAX_LENGTH} caracteres`,
    ),
    topicId: optionalId,
  })
  .transform(({ id, title, year: yearNumber, era, month, description, topicId }) => ({
    id,
    title,
    date: toDate(yearNumber, era, month),
    description,
    topicId,
  }));

export const UpdateEraMilestonesInputSchema = z.strictObject({
  era: z.enum(HISTORICAL_ERAS, { error: "Civilización desconocida" }),
  milestones: z
    .array(milestoneRow, { error: "La lista de hitos no es válida" })
    .max(ERA_MILESTONES_MAX, { error: `Como máximo ${ERA_MILESTONES_MAX} hitos por civilización` }),
});
