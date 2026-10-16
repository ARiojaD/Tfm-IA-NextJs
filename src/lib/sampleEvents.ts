import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

export const ERA_LABELS: Record<HistoricalEra, string> = {
  ANCIENT_GREECE: "Grecia Antigua",
  ROMAN: "Roma",
  HISPANIA: "Hispania",
};

// Demo data for the landing page until the database exists. Parsing with the domain
// schema means invalid sample data fails loudly instead of rendering silently.
export const SAMPLE_EVENTS = HistoricalEventSchema.array().parse([
  {
    title: "Fundación de Roma",
    date: { year: -753, month: 4 },
    era: "ROMAN",
    description:
      "Según la tradición, Rómulo traza el pomerium sobre el Palatino el 21 de abril, fecha que los romanos celebraban como el nacimiento de la Urbe.",
  },
  {
    title: "Batalla de Maratón",
    date: { year: -490, month: 9 },
    era: "ANCIENT_GREECE",
    description:
      "Atenienses y plateos, al mando de Milcíades, frenan el desembarco persa enviado por Darío I en la Primera Guerra Médica.",
  },
  {
    title: "Batalla de las Termópilas",
    date: { year: -480 },
    era: "ANCIENT_GREECE",
    description:
      "Leónidas y sus aliados griegos resisten durante tres días al ejército de Jerjes en el estrecho paso entre la montaña y el mar.",
  },
  {
    title: "Caída de Numancia",
    date: { year: -133 },
    era: "HISPANIA",
    description:
      "Tras un largo asedio dirigido por Escipión Emiliano, la ciudad celtíbera cae y se convierte en símbolo de resistencia frente a Roma.",
  },
  {
    title: "Idus de marzo",
    date: { year: -44, month: 3 },
    era: "ROMAN",
    description:
      "Julio César es asesinado en la Curia de Pompeyo por un grupo de senadores encabezados por Bruto y Casio.",
  },
  {
    title: "Fundación de Emerita Augusta",
    date: { year: -25 },
    era: "HISPANIA",
    description:
      "Augusto funda la colonia para asentar a los veteranos de las Guerras Cántabras; con el tiempo será capital de Lusitania.",
  },
]);
