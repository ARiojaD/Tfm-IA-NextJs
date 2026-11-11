import { z } from "zod";

// Solo imágenes de mapa de bits servidas desde public/images: sin servidores externos, sin ".." y sin SVG
// (un SVG puede llevar scripts).
const LOCAL_IMAGE_PATH = /^\/images\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:jpe?g|png|webp|avif)$/;

// La imagen principal de un tema. `credit` es obligatorio porque las imágenes vienen de Wikimedia Commons
// y de otras fuentes con licencia libre que exigen citar al autor. El tamaño real permite mostrar un busto
// en vertical o un cuadro apaisado con sus proporciones, sin recortes ni saltos al cargar la página.
export const TopicImageSchema = z.strictObject({
  src: z.string().regex(LOCAL_IMAGE_PATH, { message: "La imagen debe ser un archivo local de /images" }),
  alt: z.string().trim().min(1),
  // Corto a propósito: una línea bajo la imagen, no una segunda introducción.
  caption: z.string().trim().min(1).max(100),
  credit: z.string().trim().min(1).max(60),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type TopicImage = z.infer<typeof TopicImageSchema>;
