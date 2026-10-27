import { describe, expect, it } from "vitest";
import { KeyFactSchema } from "@/domain/value-objects/KeyFact";

const validFact = { label: "Lugar", value: "Alesia, en la actual Borgoña (Francia)" };

describe("KeyFactSchema", () => {
  it("acepta un dato clave con etiqueta y valor", () => {
    expect(KeyFactSchema.parse(validFact)).toEqual(validFact);
  });

  it("rechaza una etiqueta vacía", () => {
    expect(KeyFactSchema.safeParse({ ...validFact, label: " " }).success).toBe(false);
  });

  it("rechaza un valor vacío", () => {
    expect(KeyFactSchema.safeParse({ ...validFact, value: "" }).success).toBe(false);
  });

  it("rechaza una etiqueta demasiado larga para mostrarse como título", () => {
    expect(KeyFactSchema.safeParse({ ...validFact, label: "x".repeat(41) }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(KeyFactSchema.safeParse({ ...validFact, icon: "⚔️" }).success).toBe(false);
  });
});
