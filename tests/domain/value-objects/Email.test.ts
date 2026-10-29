import { describe, expect, it } from "vitest";
import { EmailSchema } from "@/domain/value-objects/Email";

describe("EmailSchema", () => {
  it("acepta un email válido", () => {
    expect(EmailSchema.parse("livia@example.com")).toBe("livia@example.com");
  });

  it("lo normaliza: sin espacios en los extremos y en minúsculas (Livia@Example.com es la misma cuenta)", () => {
    expect(EmailSchema.parse("  Livia@Example.COM ")).toBe("livia@example.com");
  });

  it.each(["livia", "livia@", "@example.com", "livia @example.com", ""])("rechaza un email mal formado: %j", (email) => {
    expect(EmailSchema.safeParse(email).success).toBe(false);
  });

  it("rechaza un email de más de 254 caracteres (el máximo de una dirección)", () => {
    expect(EmailSchema.safeParse(`${"a".repeat(250)}@example.com`).success).toBe(false);
  });
});
