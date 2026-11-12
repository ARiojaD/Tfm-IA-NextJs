import { describe, expect, it } from "vitest";
import { GetEraTimelineUseCase } from "@/application/use-cases/GetEraTimelineUseCase";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryTimelineMilestoneRepository } from "@/infrastructure/persistence/in-memory/InMemoryTimelineMilestoneRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { aTopic, anEvent } from "../../fixtures/historicalTopics";
import { aMilestone } from "../../fixtures/timeline";

function timeline({
  milestones = [],
  topics = [],
  events = [],
}: { milestones?: TimelineMilestone[]; topics?: HistoricalTopic[]; events?: HistoricalEvent[] }) {
  return new GetEraTimelineUseCase({
    milestones: new InMemoryTimelineMilestoneRepository(milestones),
    topics: new InMemoryTopicRepository(topics),
    events: new InMemoryHistoricalEventRepository(events),
  });
}

const romulus = aTopic({
  id: "t-romulus",
  slug: "romulo",
  title: "Rómulo y la fundación de Roma",
  category: "PEOPLE",
  period: { start: { year: -771 }, end: { year: -716 } },
});
const monarchy = aTopic({
  id: "t-monarchy",
  slug: "monarquia-romana",
  title: "La Monarquía romana",
  category: "PERIODS",
  summary: "Siete reyes, de Rómulo a Tarquinio el Soberbio.",
  period: { start: { year: -753 }, end: { year: -509 } },
});
const foundation = aMilestone({ id: "m-foundation", date: { year: -753, month: 4 }, title: "Fundación de Roma", topicId: "t-romulus" });
const punicWar = aMilestone({ id: "m-punic", date: { year: -264 }, title: "Primera guerra púnica" });
const kingsExpelled = aMilestone({ id: "m-kings", date: { year: -509 }, title: "Expulsión de los reyes", topicId: "t-monarchy" });

describe("GetEraTimelineUseCase", () => {
  it("ordena los hitos de la civilización por fecha", async () => {
    const result = await timeline({ milestones: [punicWar, foundation, kingsExpelled] }).execute({ era: "ROMAN" });

    expect(result.items.map((item) => item.key)).toEqual(["milestone-m-foundation", "milestone-m-kings", "milestone-m-punic"]);
    expect(result.milestoneCount).toBe(3);
  });

  it("no incluye los hitos de otras civilizaciones", async () => {
    const marathon = aMilestone({ id: "m-marathon", era: "ANCIENT_GREECE", title: "Batalla de Maratón" });

    const result = await timeline({ milestones: [punicWar, marathon] }).execute({ era: "ROMAN" });

    expect(result.items.map((item) => item.key)).toEqual(["milestone-m-punic"]);
  });

  it("enlaza el hito a su tema publicado", async () => {
    const result = await timeline({ milestones: [foundation], topics: [romulus] }).execute({ era: "ROMAN" });

    expect(result.items[0]).toMatchObject({
      kind: "MILESTONE",
      title: "Fundación de Roma",
      date: { year: -753, month: 4 },
      topic: { title: "Rómulo y la fundación de Roma", slug: "romulo", era: "ROMAN", category: "PEOPLE" },
    });
  });

  it("muestra sin enlace el hito sin tema, y el de un tema que es borrador o ya no existe", async () => {
    const draft = aTopic({ id: "t-draft", slug: "borrador", status: "DRAFT" });
    const toDraft = aMilestone({ id: "m-draft", date: { year: -100 }, topicId: "t-draft" });
    const toDeleted = aMilestone({ id: "m-deleted", date: { year: -50 }, topicId: "t-deleted" });

    const result = await timeline({ milestones: [punicWar, toDraft, toDeleted], topics: [draft] }).execute({ era: "ROMAN" });

    expect(result.items.map((item) => item.kind === "MILESTONE" && item.topic)).toEqual([null, null, null]);
  });

  it("abre una banda en el inicio de cada etapa publicada, con su resumen, antes del hito de esa misma fecha", async () => {
    const republicDraft = aTopic({ id: "t-rep", slug: "republica", category: "PERIODS", status: "DRAFT", period: { start: { year: -509 } } });

    const result = await timeline({
      milestones: [foundation, kingsExpelled],
      topics: [romulus, monarchy, republicDraft],
    }).execute({ era: "ROMAN" });

    expect(result.items.map((item) => item.key)).toEqual(["period-t-monarchy", "milestone-m-foundation", "milestone-m-kings"]);
    expect(result.items[0]).toMatchObject({
      kind: "PERIOD",
      period: { start: { year: -753 }, end: { year: -509 } },
      summary: "Siete reyes, de Rómulo a Tarquinio el Soberbio.",
      topic: { title: "La Monarquía romana", slug: "monarquia-romana" },
    });
  });

  it("una etapa que cae dentro de otra es una subetapa, y va después de la grande que empieza el mismo año", async () => {
    const republic = aTopic({ id: "t-republic", slug: "republica", category: "PERIODS", period: { start: { year: -509 }, end: { year: -27 } } });
    const republicBirth = aTopic({
      id: "t-birth",
      slug: "nacimiento-republica",
      category: "PERIODS",
      period: { start: { year: -509 }, end: { year: -450 } },
    });

    const result = await timeline({ topics: [republicBirth, monarchy, republic] }).execute({ era: "ROMAN" });

    expect(result.items.map((item) => item.kind === "PERIOD" && [item.key, item.nested])).toEqual([
      ["period-t-monarchy", false],
      ["period-t-republic", false],
      ["period-t-birth", true],
    ]);
  });

  it("dos etapas que solo comparten el año de cambio no se anidan", async () => {
    const republic = aTopic({ id: "t-republic", slug: "republica", category: "PERIODS", period: { start: { year: -509 }, end: { year: -27 } } });

    const result = await timeline({ topics: [monarchy, republic] }).execute({ era: "ROMAN" });

    expect(result.items.every((item) => item.kind === "PERIOD" && !item.nested)).toBe(true);
  });

  it("solo muestra los eventos de los temas cuando se piden, intercalados por fecha y enlazados a su tema", async () => {
    // La misma fecha que el hito de la fundación: en un empate, primero el hito y después el detalle.
    const remus = anEvent({ id: "e-remus", topicId: "t-romulus", title: "Muerte de Remo", date: { year: -753, month: 4 } });
    const sabines = anEvent({ id: "e-sabines", topicId: "t-romulus", title: "Rapto de las sabinas", date: { year: -750 } });
    const data = { milestones: [foundation, kingsExpelled], topics: [romulus], events: [sabines, remus] };

    const withoutEvents = await timeline(data).execute({ era: "ROMAN" });
    const withEvents = await timeline(data).execute({ era: "ROMAN", includeTopicEvents: true });

    expect(withoutEvents.items.map((item) => item.key)).toEqual(["milestone-m-foundation", "milestone-m-kings"]);
    expect(withEvents.items.map((item) => item.key)).toEqual([
      "milestone-m-foundation",
      "event-e-remus",
      "event-e-sabines",
      "milestone-m-kings",
    ]);
    expect(withEvents.items[1]).toMatchObject({ kind: "EVENT", eventId: "e-remus", topic: { slug: "romulo" } });
    expect(withEvents.topicEventCount).toBe(2);
  });

  it("no muestra los eventos de los borradores ni los de otras civilizaciones", async () => {
    const draft = aTopic({ id: "t-draft", slug: "borrador", status: "DRAFT" });
    const pericles = aTopic({ id: "t-pericles", slug: "pericles", era: "ANCIENT_GREECE" });
    const events = [anEvent({ id: "e-draft", topicId: "t-draft" }), anEvent({ id: "e-pericles", topicId: "t-pericles", era: "ANCIENT_GREECE" })];

    const result = await timeline({ topics: [draft, pericles], events }).execute({ era: "ROMAN", includeTopicEvents: true });

    expect(result.items).toEqual([]);
  });

  it("cuenta los eventos de los temas aunque no se muestren, para ofrecer el interruptor", async () => {
    const remus = anEvent({ id: "e-remus", topicId: "t-romulus", date: { year: -753 } });

    const result = await timeline({ topics: [romulus], events: [remus] }).execute({ era: "ROMAN" });

    expect(result.topicEventCount).toBe(1);
  });
});
