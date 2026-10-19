import { z } from "zod";

// URL-safe identifier ("julio-cesar"): lowercase ASCII words joined by single hyphens.
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type Slug = z.infer<typeof SlugSchema>;
