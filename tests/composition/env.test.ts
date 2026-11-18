import { describe, expect, it } from "vitest";
import { InvalidEnvironmentError, parseAuthEnv, parseDatabaseEnv, parseLlmEnv } from "@/composition/env";

const DATABASE_URL = "postgresql://memnon:clave-secreta@localhost:5432/memnon";

describe("parseDatabaseEnv", () => {
  it("acepta una URL de PostgreSQL válida", () => {
    expect(parseDatabaseEnv({ DATABASE_URL })).toEqual({ DATABASE_URL });
  });

  it("acepta también el esquema corto postgres://", () => {
    const url = "postgres://memnon:clave@db.example.com:5432/memnon";

    expect(parseDatabaseEnv({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
  });

  it("ignora el resto de variables del sistema", () => {
    expect(parseDatabaseEnv({ DATABASE_URL, PATH: "/usr/bin", HOME: "/home/memnon" })).toEqual({ DATABASE_URL });
  });

  it("falla si falta DATABASE_URL y nombra la variable", () => {
    expect(() => parseDatabaseEnv({})).toThrow(InvalidEnvironmentError);
    expect(() => parseDatabaseEnv({})).toThrow(/DATABASE_URL/);
  });

  it.each(["mysql://memnon:clave@localhost:3306/memnon", "no-es-una-url", "", "https://localhost:5432/memnon"])(
    "falla si DATABASE_URL no es una URL de PostgreSQL: %j",
    (value) => {
      expect(() => parseDatabaseEnv({ DATABASE_URL: value })).toThrow(InvalidEnvironmentError);
    },
  );

  it("el error nunca muestra el valor de la variable (puede contener la contraseña)", () => {
    const leakyValue = "mysql://memnon:clave-secreta@localhost:3306/memnon";

    try {
      parseDatabaseEnv({ DATABASE_URL: leakyValue });
      expect.unreachable("parseDatabaseEnv debería haber fallado");
    } catch (error) {
      expect(String(error)).not.toContain("clave-secreta");
      expect(JSON.stringify(error)).not.toContain("clave-secreta");
    }
  });
});

describe("parseAuthEnv", () => {
  const BETTER_AUTH_SECRET = "s".repeat(32);
  const BETTER_AUTH_URL = "http://localhost:3000";

  it("acepta un secreto de al menos 32 caracteres y la URL de la aplicación", () => {
    expect(parseAuthEnv({ BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL })).toEqual({
      BETTER_AUTH_SECRET,
      BETTER_AUTH_URL,
    });
  });

  it("acepta una URL https (producción)", () => {
    const url = "https://memnon.example.com";

    expect(parseAuthEnv({ BETTER_AUTH_SECRET, BETTER_AUTH_URL: url }).BETTER_AUTH_URL).toBe(url);
  });

  it("falla si el secreto es demasiado corto (por ejemplo, el valor de la plantilla)", () => {
    expect(() => parseAuthEnv({ BETTER_AUTH_SECRET: "pon-aqui-un-secreto-generado", BETTER_AUTH_URL })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
  });

  it("falla si falta el secreto o la URL, y nombra cada variable", () => {
    expect(() => parseAuthEnv({})).toThrow(/BETTER_AUTH_SECRET, BETTER_AUTH_URL/);
  });

  it.each(["ftp://localhost:3000", "localhost:3000", ""])("falla si BETTER_AUTH_URL no es http(s): %j", (url) => {
    expect(() => parseAuthEnv({ BETTER_AUTH_SECRET, BETTER_AUTH_URL: url })).toThrow(InvalidEnvironmentError);
  });

  it("el error nunca muestra el secreto", () => {
    const shortSecret = "secreto-corto-que-no-debe-salir";

    try {
      parseAuthEnv({ BETTER_AUTH_SECRET: shortSecret, BETTER_AUTH_URL });
      expect.unreachable("parseAuthEnv debería haber fallado");
    } catch (error) {
      expect(String(error)).not.toContain(shortSecret);
      expect(JSON.stringify(error)).not.toContain(shortSecret);
    }
  });
});

describe("parseLlmEnv", () => {
  it("sin variables usa el Ollama local y no necesita clave", () => {
    expect(parseLlmEnv({})).toEqual({ LLM_BASE_URL: "http://127.0.0.1:11434/v1", LLM_MODEL: "qwen2.5:7b", LLM_DAILY_LIMIT: 50 });
  });

  it("acepta otro servidor con su clave", () => {
    const env = { LLM_BASE_URL: "https://api.groq.com/openai/v1", LLM_MODEL: "modelo", LLM_API_KEY: "clave" };

    expect(parseLlmEnv(env)).toEqual({ ...env, LLM_DAILY_LIMIT: 50 });
  });

  it("rechaza una dirección que no sea http o https y no muestra su valor", () => {
    expect(() => parseLlmEnv({ LLM_BASE_URL: "ftp://secreto.example.com" })).toThrow(/LLM_BASE_URL/);
    expect(() => parseLlmEnv({ LLM_BASE_URL: "ftp://secreto.example.com" })).not.toThrow(/secreto/);
  });

  it("acepta cuánto debe razonar el modelo, para los que razonan antes de responder (gpt-oss)", () => {
    expect(parseLlmEnv({ LLM_REASONING_EFFORT: "low" })).toMatchObject({ LLM_REASONING_EFFORT: "low" });
  });

  it("rechaza un nivel de razonamiento desconocido", () => {
    expect(() => parseLlmEnv({ LLM_REASONING_EFFORT: "máximo" })).toThrow(/LLM_REASONING_EFFORT/);
  });

  it("el tope diario de llamadas a la IA es 50 si no se indica otro", () => {
    expect(parseLlmEnv({}).LLM_DAILY_LIMIT).toBe(50);
    expect(parseLlmEnv({ LLM_DAILY_LIMIT: "120" }).LLM_DAILY_LIMIT).toBe(120);
  });

  it.each(["0", "-5", "muchas", "2.5"])("rechaza un tope diario no válido (%s)", (value) => {
    expect(() => parseLlmEnv({ LLM_DAILY_LIMIT: value })).toThrow(/LLM_DAILY_LIMIT/);
  });
});
