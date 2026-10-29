import { describe, expect, it } from "vitest";
import { DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MIN_LENGTH, DisplayNameSchema } from "@/domain/value-objects/DisplayName";

describe("DisplayNameSchema", () => {
  it("acepta un nombre visible y le quita los espacios de los extremos", () => {
    expect(DisplayNameSchema.parse("  Livia  ")).toBe("Livia");
  });

  it("acepta tildes, eñes y espacios intermedios", () => {
    expect(DisplayNameSchema.parse("Iñigo Núñez")).toBe("Iñigo Núñez");
  });

  it(`rechaza un nombre de menos de ${DISPLAY_NAME_MIN_LENGTH} caracteres`, () => {
    expect(DisplayNameSchema.safeParse("L").success).toBe(false);
    expect(DisplayNameSchema.safeParse("  L  ").success).toBe(false);
  });

  it(`rechaza un nombre de más de ${DISPLAY_NAME_MAX_LENGTH} caracteres`, () => {
    expect(DisplayNameSchema.safeParse("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1)).success).toBe(false);
  });

  it("es el mismo límite que el autor de un comentario (el nombre visible firma los comentarios)", () => {
    expect([DISPLAY_NAME_MIN_LENGTH, DISPLAY_NAME_MAX_LENGTH]).toEqual([2, 40]);
  });
});
