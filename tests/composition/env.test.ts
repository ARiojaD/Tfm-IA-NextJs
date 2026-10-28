import { describe, expect, it } from "vitest";
import { InvalidEnvironmentError, parseEnv } from "@/composition/env";

const DATABASE_URL = "postgresql://memnon:clave-secreta@localhost:5432/memnon";

describe("parseEnv", () => {
  it("acepta una URL de PostgreSQL válida", () => {
    expect(parseEnv({ DATABASE_URL })).toEqual({ DATABASE_URL });
  });

  it("acepta también el esquema corto postgres://", () => {
    const url = "postgres://memnon:clave@db.example.com:5432/memnon";

    expect(parseEnv({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
  });

  it("ignora el resto de variables del sistema", () => {
    expect(parseEnv({ DATABASE_URL, PATH: "/usr/bin", HOME: "/home/memnon" })).toEqual({ DATABASE_URL });
  });

  it("falla si falta DATABASE_URL y nombra la variable", () => {
    expect(() => parseEnv({})).toThrow(InvalidEnvironmentError);
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it.each(["mysql://memnon:clave@localhost:3306/memnon", "no-es-una-url", "", "https://localhost:5432/memnon"])(
    "falla si DATABASE_URL no es una URL de PostgreSQL: %j",
    (value) => {
      expect(() => parseEnv({ DATABASE_URL: value })).toThrow(InvalidEnvironmentError);
    },
  );

  it("el error nunca muestra el valor de la variable (puede contener la contraseña)", () => {
    const leakyValue = "mysql://memnon:clave-secreta@localhost:3306/memnon";

    try {
      parseEnv({ DATABASE_URL: leakyValue });
      expect.unreachable("parseEnv debería haber fallado");
    } catch (error) {
      expect(String(error)).not.toContain("clave-secreta");
      expect(JSON.stringify(error)).not.toContain("clave-secreta");
    }
  });
});
