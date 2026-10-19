import { describe, expect, it } from "vitest";
import { SlugSchema } from "@/domain/value-objects/Slug";

describe("SlugSchema", () => {
  it.each(["julio-cesar", "roma", "batalla-de-alesia-52"])("acepta el slug %s", (slug) => {
    expect(SlugSchema.safeParse(slug).success).toBe(true);
  });

  it.each([
    ["vacío", ""],
    ["con mayúsculas", "Julio-Cesar"],
    ["con tildes", "julio-césar"],
    ["con espacios", "julio cesar"],
    ["con guiones dobles", "julio--cesar"],
    ["empezando por guion", "-julio"],
    ["acabando en guion", "julio-"],
    ["con barras", "roma/julio-cesar"],
  ])("rechaza un slug %s", (_case, slug) => {
    expect(SlugSchema.safeParse(slug).success).toBe(false);
  });
});
