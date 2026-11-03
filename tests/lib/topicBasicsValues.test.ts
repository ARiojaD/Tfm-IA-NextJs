import { describe, expect, it } from "vitest";
import { emptyTopicBasicsValues, toTopicBasicsValues } from "@/lib/topicBasicsValues";
import { aTopic } from "../fixtures/historicalTopics";

describe("toTopicBasicsValues", () => {
  it("convierte los años negativos en años a.C. y los meses en texto", () => {
    const topic = aTopic({
      title: "Augusto",
      summary: "El primer emperador.",
      period: { start: { year: -63, month: 9 }, end: { year: 14, month: 8 } },
    });

    expect(toTopicBasicsValues(topic)).toEqual({
      title: "Augusto",
      era: "ROMAN",
      category: "PEOPLE",
      summary: "El primer emperador.",
      startYear: "63",
      startEra: "BC",
      startMonth: "9",
      endYear: "14",
      endEra: "AD",
      endMonth: "8",
    });
  });

  it("un periodo sin fin deja vacíos los campos del fin", () => {
    const values = toTopicBasicsValues(aTopic({ period: { start: { year: -52 } } }));

    expect([values.startMonth, values.endYear, values.endEra, values.endMonth]).toEqual(["", "", "BC", ""]);
  });
});

describe("emptyTopicBasicsValues", () => {
  it("empieza vacío, en la civilización indicada y con fechas a.C.", () => {
    expect(emptyTopicBasicsValues("HISPANIA")).toMatchObject({ title: "", era: "HISPANIA", category: "PEOPLE", startEra: "BC" });
  });
});
