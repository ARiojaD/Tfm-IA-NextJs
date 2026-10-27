import { z } from "zod";

// Only raster files served from public/images: no external hosts, no "..", no SVG (it can carry scripts).
const LOCAL_IMAGE_PATH = /^\/images\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:jpe?g|png|webp|avif)$/;

// The main image of a topic. `credit` is required because the images come from Wikimedia Commons
// and other free-licence sources that require attribution. The intrinsic size lets the page show a
// portrait bust or a landscape painting at its real proportions, without cropping or layout shift.
export const TopicImageSchema = z.strictObject({
  src: z.string().regex(LOCAL_IMAGE_PATH, { message: "La imagen debe ser un archivo local de /images" }),
  alt: z.string().trim().min(1),
  // Short on purpose: a one-line caption under the image, not a second introduction.
  caption: z.string().trim().min(1).max(100),
  credit: z.string().trim().min(1).max(60),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type TopicImage = z.infer<typeof TopicImageSchema>;
