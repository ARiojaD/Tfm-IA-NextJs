import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// Los nombres de las civilizaciones tal como los lee el visitante.
export const ERA_LABELS: Record<HistoricalEra, string> = {
  ANCIENT_GREECE: "Antigua Grecia",
  ROMAN: "Roma",
  HISPANIA: "Hispania",
};

// La frase que presenta cada civilización en su página (y en su descripción para los buscadores).
export const ERA_DESCRIPTIONS: Record<HistoricalEra, string> = {
  ROMAN: "De la fundación de la Urbe a la caída del Imperio de Occidente: monarquía, república e imperio.",
  ANCIENT_GREECE: "Las polis, las Guerras Médicas, la Atenas de Pericles y el mundo helenístico de Alejandro.",
  HISPANIA: "Pueblos prerromanos, resistencia frente a Roma y la romanización de la Península.",
};
