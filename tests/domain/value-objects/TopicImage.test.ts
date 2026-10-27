import { describe, expect, it } from "vitest";
import { TopicImageSchema } from "@/domain/value-objects/TopicImage";

const validImage = {
  src: "/images/topics/julio-cesar.jpg",
  alt: "Busto de mármol de Julio César",
  caption: "Retrato de Túsculo. Museo de Antigüedades de Turín.",
  credit: "Dominio público · Wikimedia Commons",
  width: 800,
  height: 1000,
};

describe("TopicImageSchema", () => {
  it("acepta una imagen local con texto alternativo, pie y crédito", () => {
    expect(TopicImageSchema.parse(validImage)).toEqual(validImage);
  });

  it.each(["/images/julio-cesar.webp", "/images/topics/roma/alesia.png", "/images/foro.jpeg"])(
    "acepta la ruta local %s",
    (src) => {
      expect(TopicImageSchema.safeParse({ ...validImage, src }).success).toBe(true);
    },
  );

  it.each([
    "https://example.com/cesar.jpg",
    "//example.com/cesar.jpg",
    "/images/../secret.jpg",
    "/uploads/cesar.jpg",
    "/images/cesar.svg",
    "javascript:alert(1)",
  ])("rechaza una ruta que no es una imagen local de /images: %s", (src) => {
    expect(TopicImageSchema.safeParse({ ...validImage, src }).success).toBe(false);
  });

  it("rechaza una imagen sin texto alternativo (accesibilidad)", () => {
    expect(TopicImageSchema.safeParse({ ...validImage, alt: " " }).success).toBe(false);
  });

  it("rechaza una imagen sin crédito (licencia)", () => {
    expect(TopicImageSchema.safeParse({ ...validImage, credit: "" }).success).toBe(false);
  });

  it("rechaza un pie de foto de más de 100 caracteres (debe caber en una línea corta)", () => {
    expect(TopicImageSchema.safeParse({ ...validImage, caption: "x".repeat(100) }).success).toBe(true);
    expect(TopicImageSchema.safeParse({ ...validImage, caption: "x".repeat(101) }).success).toBe(false);
  });

  it("rechaza un crédito de más de 60 caracteres", () => {
    expect(TopicImageSchema.safeParse({ ...validImage, credit: "x".repeat(60) }).success).toBe(true);
    expect(TopicImageSchema.safeParse({ ...validImage, credit: "x".repeat(61) }).success).toBe(false);
  });

  it("rechaza una imagen sin dimensiones (hacen falta para mostrarla sin recortes ni saltos)", () => {
    const imageWithoutSize: Partial<typeof validImage> = { ...validImage };
    delete imageWithoutSize.width;

    expect(TopicImageSchema.safeParse(imageWithoutSize).success).toBe(false);
  });

  it.each([0, -800, 800.5])("rechaza un ancho o alto que no es un entero positivo: %s", (size) => {
    expect(TopicImageSchema.safeParse({ ...validImage, width: size }).success).toBe(false);
    expect(TopicImageSchema.safeParse({ ...validImage, height: size }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(TopicImageSchema.safeParse({ ...validImage, onerror: "alert(1)" }).success).toBe(false);
  });
});
