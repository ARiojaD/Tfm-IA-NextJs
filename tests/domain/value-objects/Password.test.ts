import { describe, expect, it } from "vitest";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PasswordSchema } from "@/domain/value-objects/Password";

describe("PasswordSchema", () => {
  it("sigue la longitud que recomienda OWASP ASVS: de 12 a 128 caracteres", () => {
    expect([PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]).toEqual([12, 128]);
  });

  it("acepta una contraseña de 12 caracteres", () => {
    expect(PasswordSchema.safeParse("abcdefghijkl").success).toBe(true);
  });

  it("rechaza una contraseña de 11 caracteres", () => {
    expect(PasswordSchema.safeParse("abcdefghijk").success).toBe(false);
  });

  it("rechaza una contraseña de más de 128 caracteres (cifrar textos enormes es caro: denegación de servicio)", () => {
    expect(PasswordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("no exige mezclar mayúsculas, números o símbolos: una frase larga es más segura y fácil de recordar", () => {
    expect(PasswordSchema.safeParse("la batalla de alesia").success).toBe(true);
  });

  it("no recorta los espacios: forman parte de la contraseña", () => {
    expect(PasswordSchema.parse("  con espacios  ")).toBe("  con espacios  ");
  });
});
