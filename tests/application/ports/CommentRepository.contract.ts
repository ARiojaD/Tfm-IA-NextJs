import { describe, expect, it } from "vitest";
import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { Comment } from "@/domain/entities/Comment";
import { aComment } from "../../fixtures/historicalTopics";

export function describeCommentRepositoryContract(
  name: string,
  createRepository: (comments: Comment[]) => CommentRepository | Promise<CommentRepository>,
) {
  describe(`${name} cumple el contrato de CommentRepository`, () => {
    const livia = aComment({ id: "comment-livia", topicId: "topic-caesar", author: "Livia" });
    const marco = aComment({ id: "comment-marco", topicId: "topic-caesar", author: "Marco" });
    const aspasia = aComment({ id: "comment-aspasia", topicId: "topic-pericles", author: "Aspasia" });

    it("lista solo los comentarios del tema indicado", async () => {
      const repository = await createRepository([livia, aspasia, marco]);

      const comments = await repository.listByTopic("topic-caesar");

      expect(comments).toHaveLength(2);
      expect(comments).toEqual(expect.arrayContaining([livia, marco]));
    });

    it("devuelve una lista vacía si el tema no tiene comentarios", async () => {
      const repository = await createRepository([aspasia]);

      expect(await repository.listByTopic("topic-caesar")).toEqual([]);
    });

    it("guarda un comentario nuevo y lo devuelve al listar su tema", async () => {
      const repository = await createRepository([livia]);

      await repository.add(marco);

      expect(await repository.listByTopic("topic-caesar")).toEqual(expect.arrayContaining([livia, marco]));
    });

    it("un comentario nuevo no aparece en otros temas", async () => {
      const repository = await createRepository([aspasia]);

      await repository.add(livia);

      expect(await repository.listByTopic("topic-pericles")).toEqual([aspasia]);
    });

    it("guarda una copia: modificar el objeto después de añadirlo no altera lo guardado", async () => {
      const repository = await createRepository([]);
      const comment = aComment({ topicId: "topic-caesar", message: "Original" });

      await repository.add(comment);
      comment.message = "Modificado";

      expect((await repository.listByTopic("topic-caesar"))[0].message).toBe("Original");
    });

    it("conserva el usuario que escribió el comentario", async () => {
      const repository = await createRepository([]);
      const byUser = aComment({ id: "comment-by-user", topicId: "topic-caesar", userId: "user-1" });

      await repository.add(byUser);

      expect(await repository.listByTopic("topic-caesar")).toEqual([byUser]);
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([livia]);

      const [comment] = await repository.listByTopic("topic-caesar");
      comment.message = "Modificado";

      expect((await repository.listByTopic("topic-caesar"))[0].message).toBe(livia.message);
    });
  });
}
