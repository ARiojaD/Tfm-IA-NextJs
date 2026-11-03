import { z } from "zod";

// URL-safe identifier ("julio-cesar"): lowercase ASCII words joined by single hyphens.
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type Slug = z.infer<typeof SlugSchema>;

// A slug from a title: "Ávila: la ciudad amurallada" → "avila-la-ciudad-amurallada". Accents are dropped
// (NFD splits "á" into "a" + accent), anything else becomes a hyphen. Always valid, even for "¿…?".
export function slugify(text: string): Slug {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "tema";
}
