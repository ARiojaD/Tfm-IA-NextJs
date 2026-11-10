import { describe, expect, it } from "vitest";
import { GeneratedAnswerSchema, parseCitations } from "@/domain/entities/EncyclopediaAnswer";

describe("parseCitations", () => {
  it("separa el texto de las citas y numera las fuentes por orden de aparición", () => {
    const { parts, citedSources } = parseCitations("Cruzó el Rubicón [3]. Murió en el 44 a.C. [1].", 5);

    expect(parts).toEqual([
      { type: "text", text: "Cruzó el Rubicón" },
      { type: "citation", number: 1 },
      { type: "text", text: ". Murió en el 44 a.C." },
      { type: "citation", number: 2 },
      { type: "text", text: "." },
    ]);
    expect(citedSources).toEqual([3, 1]);
  });

  it("una fuente citada dos veces conserva su número", () => {
    const { parts, citedSources } = parseCitations("Uno [2]. Dos [2].", 2);

    expect(parts.filter((part) => part.type === "citation")).toEqual([
      { type: "citation", number: 1 },
      { type: "citation", number: 1 },
    ]);
    expect(citedSources).toEqual([2]);
  });

  it("entiende varias fuentes en los mismos corchetes", () => {
    const { parts, citedSources } = parseCitations("Hecho [1, 2].", 2);

    expect(parts).toEqual([
      { type: "text", text: "Hecho" },
      { type: "citation", number: 1 },
      { type: "citation", number: 2 },
      { type: "text", text: "." },
    ]);
    expect(citedSources).toEqual([1, 2]);
  });

  it("quita las citas a fuentes que no existen: el modelo no puede inventarse una fuente", () => {
    const { parts, citedSources } = parseCitations("Inventado [9]. Real [1].", 2);

    expect(parts).toEqual([
      { type: "text", text: "Inventado. Real" },
      { type: "citation", number: 1 },
      { type: "text", text: "." },
    ]);
    expect(citedSources).toEqual([1]);
  });

  it("un texto sin citas no cita ninguna fuente", () => {
    expect(parseCitations("Sin fuentes.", 3)).toEqual({ parts: [{ type: "text", text: "Sin fuentes." }], citedSources: [] });
  });

  it("no confunde con citas los números que no van entre corchetes", () => {
    expect(parseCitations("En el año 44 a.C.", 50).citedSources).toEqual([]);
  });
});

describe("GeneratedAnswerSchema", () => {
  const valid = { coverage: "FULL", answer: "Respuesta [1].", missing: "" };

  it("acepta una respuesta válida", () => {
    expect(GeneratedAnswerSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza una cobertura desconocida y campos de más", () => {
    expect(GeneratedAnswerSchema.safeParse({ ...valid, coverage: "ALGO" }).success).toBe(false);
    expect(GeneratedAnswerSchema.safeParse({ ...valid, html: "<script>" }).success).toBe(false);
  });

  it("limita la longitud de la respuesta", () => {
    expect(GeneratedAnswerSchema.safeParse({ ...valid, answer: "a".repeat(3001) }).success).toBe(false);
  });
});
