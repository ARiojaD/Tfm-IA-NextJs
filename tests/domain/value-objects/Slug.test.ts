import { describe, expect, it } from "vitest";
import { slugify, SlugSchema } from "@/domain/value-objects/Slug";

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

describe("slugify", () => {
  it.each([
    ["Julio César", "julio-cesar"],
    ["Asedio de Alesia", "asedio-de-alesia"],
    ["  Ávila: la ciudad amurallada  ", "avila-la-ciudad-amurallada"],
    ["Guerra Púnica (II)", "guerra-punica-ii"],
    ["Año 1000 — ¿el fin?", "ano-1000-el-fin"],
  ])("convierte %j en %j", (title, slug) => {
    expect(slugify(title)).toBe(slug);
  });

  it("siempre da un slug válido, aunque el título no tenga letras ni números", () => {
    expect(SlugSchema.safeParse(slugify("¿¡…!?")).success).toBe(true);
  });
});
