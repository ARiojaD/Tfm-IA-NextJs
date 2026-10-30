import { describe, expect, it } from "vitest";
import { compareTopicsChronologically, HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";

const validTopic = {
  id: "topic-julius-caesar",
  slug: "julio-cesar",
  title: "Julio César",
  era: "ROMAN",
  category: "PEOPLE",
  summary: "Del cruce del Rubicón a los Idus de marzo: el general que acabó con la República romana.",
  period: { start: { year: -100, month: 7 }, end: { year: -44, month: 3 } },
  introduction: [
    "Cayo Julio César nació en una familia patricia de Roma.",
    "Conquistó la Galia y cruzó el Rubicón, desencadenando la guerra civil.",
  ],
  keyFacts: [
    { label: "Nacimiento", value: "100 a.C., Roma" },
    { label: "Muerte", value: "44 a.C., Roma" },
  ],
  relatedTopicIds: ["topic-siege-of-alesia"],
};

const image = {
  src: "/images/topics/julio-cesar.jpg",
  alt: "Busto de Julio César",
  caption: "El César de Túsculo.",
  credit: "Dominio público, vía Wikimedia Commons",
  width: 800,
  height: 1000,
};

describe("HistoricalTopicSchema", () => {
  it("acepta un tema histórico válido", () => {
    const result = HistoricalTopicSchema.safeParse(validTopic);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validTopic);
  });

  it("rechaza un id vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, id: " " }).success).toBe(false);
  });

  it("rechaza un slug que no sirve para una URL", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, slug: "Julio César" }).success).toBe(false);
  });

  it("rechaza un título vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, title: "" }).success).toBe(false);
  });

  it("rechaza una época desconocida", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, era: "ATLANTIS" }).success).toBe(false);
  });

  it.each(["PEOPLE", "WARS_AND_BATTLES", "PERIODS", "CITIES"])("acepta la categoría %s", (category) => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, category }).success).toBe(true);
  });

  it("rechaza una categoría desconocida", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, category: "MYTHS" }).success).toBe(false);
  });

  it("rechaza un tema sin categoría", () => {
    const topicWithoutCategory: Partial<typeof validTopic> = { ...validTopic };
    delete topicWithoutCategory.category;

    expect(HistoricalTopicSchema.safeParse(topicWithoutCategory).success).toBe(false);
  });

  it("rechaza un resumen vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, summary: "  " }).success).toBe(false);
  });

  describe("periodo", () => {
    it("rechaza un tema sin periodo", () => {
      const topicWithoutPeriod: Partial<typeof validTopic> = { ...validTopic };
      delete topicWithoutPeriod.period;

      expect(HistoricalTopicSchema.safeParse(topicWithoutPeriod).success).toBe(false);
    });

    it("rechaza un periodo que acaba antes de empezar", () => {
      const period = { start: { year: -44 }, end: { year: -100 } };

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, period }).success).toBe(false);
    });
  });

  describe("contenido", () => {
    it("rechaza un tema sin introducción", () => {
      expect(HistoricalTopicSchema.safeParse({ ...validTopic, introduction: [] }).success).toBe(false);
    });

    it("rechaza párrafos vacíos en la introducción", () => {
      const introduction = ["Primer párrafo.", " "];

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, introduction }).success).toBe(false);
    });

    it("rechaza un tema sin datos clave", () => {
      expect(HistoricalTopicSchema.safeParse({ ...validTopic, keyFacts: [] }).success).toBe(false);
    });

    it("rechaza datos clave mal formados", () => {
      const keyFacts = [{ label: "Lugar" }];

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, keyFacts }).success).toBe(false);
    });

    it("acepta un tema sin imagen (es opcional)", () => {
      expect(HistoricalTopicSchema.safeParse(validTopic).success).toBe(true);
    });

    it("acepta un tema con imagen", () => {
      expect(HistoricalTopicSchema.parse({ ...validTopic, image }).image).toEqual(image);
    });

    it("rechaza una imagen externa", () => {
      const externalImage = { ...image, src: "https://example.com/cesar.jpg" };

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, image: externalImage }).success).toBe(false);
    });
  });

  describe("temas relacionados", () => {
    it("acepta un tema sin temas relacionados", () => {
      expect(HistoricalTopicSchema.safeParse({ ...validTopic, relatedTopicIds: [] }).success).toBe(true);
    });

    it("rechaza temas relacionados repetidos", () => {
      const relatedTopicIds = ["topic-siege-of-alesia", "topic-siege-of-alesia"];

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, relatedTopicIds }).success).toBe(false);
    });

    it("rechaza un tema relacionado consigo mismo", () => {
      const relatedTopicIds = [validTopic.id];

      expect(HistoricalTopicSchema.safeParse({ ...validTopic, relatedTopicIds }).success).toBe(false);
    });
  });

  it("rechaza propiedades no permitidas", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, isAdmin: true }).success).toBe(false);
  });
});

describe("compareTopicsChronologically", () => {
  const topic = (title: string, startYear: number) => ({ title, period: { start: { year: startYear } } });

  it("ordena los temas por su fecha de inicio", () => {
    const topics = [topic("Imperio", -27), topic("Monarquía", -753), topic("República", -509)];

    expect(topics.toSorted(compareTopicsChronologically).map((t) => t.title)).toEqual(["Monarquía", "República", "Imperio"]);
  });

  it("si empiezan a la vez, ordena por título según el español (las tildes no van al final)", () => {
    const topics = [topic("Zama", -202), topic("Ávila", -202), topic("Cannas", -202)];

    expect(topics.toSorted(compareTopicsChronologically).map((t) => t.title)).toEqual(["Ávila", "Cannas", "Zama"]);
  });
});
