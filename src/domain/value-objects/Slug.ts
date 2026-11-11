import { z } from "zod";

// Identificador apto para URL ("julio-cesar"): palabras en minúsculas ASCII unidas por un solo guion.
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type Slug = z.infer<typeof SlugSchema>;

// El slug de un título: "Ávila: la ciudad amurallada" → "avila-la-ciudad-amurallada". Se quitan las
// tildes (NFD separa "á" en "a" + tilde) y todo lo demás pasa a ser un guion. Siempre es válido: si no
// queda nada (un título como "¿…?"), devuelve "tema".
export function slugify(text: string): Slug {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "tema";
}
