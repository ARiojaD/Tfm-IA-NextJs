import { describe, expect, it } from "vitest";
import { CommentSchema } from "@/domain/entities/Comment";

const validComment = {
  id: "comment-1",
  topicId: "topic-julius-caesar",
  author: "Livia",
  message: "Nunca había pensado en lo arriesgado que fue cruzar el Rubicón.",
  createdAt: new Date("2026-10-19T10:00:00Z"),
};

describe("CommentSchema", () => {
  it("acepta un comentario válido", () => {
    const result = CommentSchema.safeParse(validComment);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validComment);
  });

  it("recorta los espacios del autor y del mensaje", () => {
    const result = CommentSchema.safeParse({ ...validComment, author: "  Livia ", message: "  Hola  " });

    expect(result.data?.author).toBe("Livia");
    expect(result.data?.message).toBe("Hola");
  });

  it("rechaza un mensaje vacío", () => {
    expect(CommentSchema.safeParse({ ...validComment, message: "   " }).success).toBe(false);
  });

  it("acepta un mensaje de 500 caracteres", () => {
    expect(CommentSchema.safeParse({ ...validComment, message: "a".repeat(500) }).success).toBe(true);
  });

  it("rechaza un mensaje de más de 500 caracteres", () => {
    expect(CommentSchema.safeParse({ ...validComment, message: "a".repeat(501) }).success).toBe(false);
  });

  it("rechaza un autor de menos de 2 caracteres", () => {
    expect(CommentSchema.safeParse({ ...validComment, author: "L" }).success).toBe(false);
  });

  it("rechaza un autor de más de 40 caracteres", () => {
    expect(CommentSchema.safeParse({ ...validComment, author: "a".repeat(41) }).success).toBe(false);
  });

  it("rechaza una fecha de creación que no es una fecha", () => {
    expect(CommentSchema.safeParse({ ...validComment, createdAt: "ayer" }).success).toBe(false);
  });

  it("rechaza un comentario sin tema asociado", () => {
    expect(CommentSchema.safeParse({ ...validComment, topicId: "" }).success).toBe(false);
  });

  it("acepta el usuario que lo escribió", () => {
    expect(CommentSchema.parse({ ...validComment, userId: "user-livia" }).userId).toBe("user-livia");
  });

  it("acepta un comentario sin usuario (los del seed, anteriores a las cuentas)", () => {
    expect(CommentSchema.parse(validComment)).not.toHaveProperty("userId");
  });

  it("rechaza un usuario vacío", () => {
    expect(CommentSchema.safeParse({ ...validComment, userId: " " }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(CommentSchema.safeParse({ ...validComment, isApproved: true }).success).toBe(false);
  });
});
