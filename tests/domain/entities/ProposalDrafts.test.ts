import { describe, expect, it } from "vitest";
import {
  eventProposalValues,
  GeneratedEventProposalSchema,
  GeneratedNewTopicProposalSchema,
  newTopicProposalValues,
} from "@/domain/entities/ProposalDrafts";

const FRAGMENT = "En el año 216 a.C., en agosto, Aníbal aplastó a los romanos en Cannas. Murió en el 183 a.C.";

const cannae = { found: true, title: "Batalla de Cannas", year: 216, era: "BC", month: 8, description: "Aníbal vence a Roma." } as const;

const hannibal = {
  found: true,
  title: "Aníbal",
  civilization: "ROMAN",
  category: "PEOPLE",
  summary: "General cartaginés.",
  startYear: 247,
  startEra: "BC",
  startMonth: 0,
  endYear: 183,
  endEra: "BC",
  endMonth: 0,
  description: "Venció a Roma en Cannas.",
} as const;

describe("eventProposalValues", () => {
  it("convierte el evento en los campos del formulario", () => {
    expect(eventProposalValues(cannae, FRAGMENT)).toEqual({
      title: "Batalla de Cannas",
      year: "216",
      era: "BC",
      month: "8",
      description: "Aníbal vence a Roma.",
    });
  });

  it("sin mes conocido deja el mes vacío", () => {
    expect(eventProposalValues({ ...cannae, month: 0 }, FRAGMENT).month).toBe("");
  });

  it("deja vacíos el año y el mes si el año no está en el fragmento, y conserva el resto", () => {
    expect(eventProposalValues({ ...cannae, year: 300 }, FRAGMENT)).toMatchObject({ title: "Batalla de Cannas", year: "", month: "" });
  });

  it("sin año conocido deja el año vacío", () => {
    expect(eventProposalValues({ ...cannae, year: 0 }, FRAGMENT).year).toBe("");
  });
});

describe("newTopicProposalValues", () => {
  it("convierte el tema en los campos del formulario y vacía el año que no está en el fragmento", () => {
    expect(newTopicProposalValues(hannibal, FRAGMENT)).toEqual({
      title: "Aníbal",
      civilization: "ROMAN",
      category: "PEOPLE",
      summary: "General cartaginés.",
      startYear: "",
      startEra: "BC",
      startMonth: "",
      endYear: "183",
      endEra: "BC",
      endMonth: "",
      description: "Venció a Roma en Cannas.",
    });
  });

  it("sin fecha de fin deja el fin vacío", () => {
    expect(newTopicProposalValues({ ...hannibal, endYear: 0 }, FRAGMENT).endYear).toBe("");
  });
});

describe("esquemas de lo que devuelve el modelo", () => {
  it("rechazan campos de más: la fuente nunca la propone la IA", () => {
    expect(GeneratedEventProposalSchema.safeParse({ ...cannae, source: "Inventada" }).success).toBe(false);
    expect(GeneratedNewTopicProposalSchema.safeParse({ ...hannibal, source: "Inventada" }).success).toBe(false);
  });

  it("solo admiten civilizaciones y categorías de la enciclopedia", () => {
    expect(GeneratedNewTopicProposalSchema.safeParse({ ...hannibal, civilization: "EGYPT" }).success).toBe(false);
    expect(GeneratedNewTopicProposalSchema.safeParse({ ...hannibal, category: "OTRA" }).success).toBe(false);
  });

  it("limitan las longitudes a las del formulario", () => {
    expect(GeneratedEventProposalSchema.safeParse({ ...cannae, description: "a".repeat(1001) }).success).toBe(false);
    expect(GeneratedNewTopicProposalSchema.safeParse({ ...hannibal, description: "a".repeat(4001) }).success).toBe(false);
  });

  it("no aceptan años negativos: la era va aparte", () => {
    expect(GeneratedEventProposalSchema.safeParse({ ...cannae, year: -216 }).success).toBe(false);
  });
});
