import { describe, expect, it } from "vitest";
import {
  eventDraftRows,
  GeneratedEventsSchema,
  GeneratedQuizSchema,
  quizDraftRows,
  topicSourceText,
} from "@/domain/entities/TopicDrafts";

const SOURCE = "Cruzó el Rubicón en el 49 a.C. Murió el 15 de marzo del 44 a.C. Gobernó hasta el año 14 d.C.";

const rubicon = { title: "Cruce del Rubicón", year: 49, era: "BC", month: 1, description: "Desafía al Senado." } as const;

describe("topicSourceText", () => {
  it("une la introducción y los datos clave, que es lo único que puede usar la IA", () => {
    const text = topicSourceText({
      introduction: ["Primer párrafo.", "Segundo párrafo."],
      keyFacts: [{ label: "Nacimiento", value: "100 a.C." }],
    });

    expect(text).toBe("Primer párrafo.\nSegundo párrafo.\nNacimiento: 100 a.C.");
  });
});

describe("eventDraftRows", () => {
  it("convierte cada evento en una fila del formulario, sin guardar nada y sin id", () => {
    expect(eventDraftRows({ events: [rubicon] }, SOURCE)).toEqual([
      { id: "", title: "Cruce del Rubicón", year: "49", era: "BC", month: "1", description: "Desafía al Senado." },
    ]);
  });

  it("sin mes conocido deja el mes vacío", () => {
    expect(eventDraftRows({ events: [{ ...rubicon, month: 0 }] }, SOURCE)[0].month).toBe("");
  });

  it("descarta los eventos cuyo año no aparece en el texto: la IA no puede inventarse fechas", () => {
    const invented = { ...rubicon, title: "Inventado", year: 77 };

    expect(eventDraftRows({ events: [invented, rubicon] }, SOURCE).map((row) => row.title)).toEqual(["Cruce del Rubicón"]);
  });

  it("compara el número entero: el 4 no vale porque aparezca el 44", () => {
    expect(eventDraftRows({ events: [{ ...rubicon, year: 4 }] }, SOURCE)).toEqual([]);
  });

  it("acepta los años después de Cristo", () => {
    expect(eventDraftRows({ events: [{ ...rubicon, year: 14, era: "AD", month: 0 }] }, SOURCE)[0]).toMatchObject({ year: "14", era: "AD" });
  });
});

describe("quizDraftRows", () => {
  const question = {
    question: "¿Qué río cruzó César?",
    options: ["Rubicón", "Tíber", "Ebro"],
    correctOptionIndex: 0,
    explanation: "Lo cruzó en el 49 a.C.",
  };

  it("convierte cada pregunta en una fila del formulario, sin id", () => {
    expect(quizDraftRows({ questions: [question] })).toEqual([{ ...question, id: "" }]);
  });

  it("rota las opciones para que la correcta no sea siempre la primera, y la sigue marcando", () => {
    const rows = quizDraftRows({ questions: [question, question, question] });

    expect(rows.map((row) => row.correctOptionIndex)).toEqual([0, 1, 2]);
    for (const row of rows) {
      expect(row.options[row.correctOptionIndex]).toBe("Rubicón");
      expect([...row.options].sort()).toEqual([...question.options].sort());
    }
  });

  it("descarta las preguntas con opciones repetidas", () => {
    expect(quizDraftRows({ questions: [{ ...question, options: ["Rubicón", "Rubicón"] }] })).toEqual([]);
  });

  it("descarta las preguntas cuya respuesta correcta no es una de las opciones", () => {
    expect(quizDraftRows({ questions: [{ ...question, correctOptionIndex: 3 }] })).toEqual([]);
  });

  it("una descartada no deja hueco en la rotación", () => {
    const repeated = { ...question, options: ["Igual", "Igual"] };

    expect(quizDraftRows({ questions: [repeated, question] }).map((row) => row.correctOptionIndex)).toEqual([0]);
  });
});

describe("esquemas de lo que devuelve el modelo", () => {
  it("rechazan campos de más", () => {
    expect(GeneratedEventsSchema.safeParse({ events: [{ ...rubicon, html: "<b>" }] }).success).toBe(false);
  });

  it("no aceptan años negativos ni el año 0: la era va aparte", () => {
    expect(GeneratedEventsSchema.safeParse({ events: [{ ...rubicon, year: -49 }] }).success).toBe(false);
    expect(GeneratedEventsSchema.safeParse({ events: [{ ...rubicon, year: 0 }] }).success).toBe(false);
  });

  it("limitan cuántos eventos y preguntas se pueden proponer", () => {
    expect(GeneratedEventsSchema.safeParse({ events: Array.from({ length: 9 }, () => rubicon) }).success).toBe(false);
    const question = { question: "¿?", options: ["a", "b"], correctOptionIndex: 0, explanation: "" };
    expect(GeneratedQuizSchema.safeParse({ questions: Array.from({ length: 6 }, () => question) }).success).toBe(false);
  });

  it("una pregunta tiene de 2 a 4 opciones", () => {
    const question = { question: "¿?", correctOptionIndex: 0, explanation: "" };

    expect(GeneratedQuizSchema.safeParse({ questions: [{ ...question, options: ["a"] }] }).success).toBe(false);
    expect(GeneratedQuizSchema.safeParse({ questions: [{ ...question, options: ["a", "b", "c", "d", "e"] }] }).success).toBe(false);
  });
});
