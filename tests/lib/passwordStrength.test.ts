import { describe, expect, it } from "vitest";
import { estimatePasswordStrength } from "@/lib/passwordStrength";

describe("estimatePasswordStrength (guía visual del formulario de registro)", () => {
  it("sin contraseña no muestra nada", () => {
    expect(estimatePasswordStrength("")).toEqual({ score: 0, label: "" });
  });

  it("por debajo de 12 caracteres avisa de que es demasiado corta", () => {
    expect(estimatePasswordStrength("Alesia2026!")).toEqual({ score: 0, label: "Demasiado corta (mínimo 12)" });
  });

  it("muchos caracteres repetidos es débil aunque sea larga", () => {
    expect(estimatePasswordStrength("aaaaaaaaaaaaaaaa")).toEqual({ score: 1, label: "Débil: demasiado repetitiva" });
  });

  it("12 caracteres variados es aceptable", () => {
    expect(estimatePasswordStrength("cesarrubicon").label).toBe("Aceptable");
  });

  it("la longitud es lo que más suma: una frase larga es muy fuerte aunque sea toda en minúsculas", () => {
    expect(estimatePasswordStrength("la batalla de alesia")).toEqual({ score: 4, label: "Muy fuerte" });
  });

  it("mezclar tipos de caracteres también suma", () => {
    expect(estimatePasswordStrength("Cesar-Rubicon").score).toBeGreaterThan(estimatePasswordStrength("cesarrubicon").score);
  });

  it("la puntuación nunca pasa de 4", () => {
    expect(estimatePasswordStrength("Una Frase Muy Larga Con 2026 Y Símbolos!").score).toBe(4);
  });
});
