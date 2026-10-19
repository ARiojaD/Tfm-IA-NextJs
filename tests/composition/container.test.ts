import { describe, expect, it } from "vitest";
import { createContainer, getContainer } from "@/composition/container";

describe("container", () => {
  it("conecta GetTopicDetail con los datos de ejemplo de Julio César", async () => {
    const result = await createContainer().getTopicDetail.execute("julio-cesar");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topic.title).toBe("Julio César");
    expect(result.data.events).toHaveLength(9);
    expect(result.data.quiz?.questions).toHaveLength(5);
    expect(result.data.recommendations).toHaveLength(6);
  });

  it("AddComment y GetTopicDetail comparten el mismo repositorio de comentarios", async () => {
    const container = createContainer();

    const added = await container.addComment.execute({ topicSlug: "julio-cesar", author: "Livia", message: "Hola" });
    const detail = await container.getTopicDetail.execute("julio-cesar");

    expect(added.success).toBe(true);
    expect(detail.success && detail.data.comments[0]).toEqual(added.success && added.data);
  });

  it("cada container nuevo empieza con los datos de ejemplo, sin cambios de otros", async () => {
    await createContainer().addComment.execute({ topicSlug: "julio-cesar", author: "Livia", message: "Hola" });

    const detail = await createContainer().getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments).toHaveLength(3);
  });

  it("conecta AnswerQuizQuestion con el quiz de Julio César", async () => {
    const result = await createContainer().answerQuizQuestion.execute({
      topicSlug: "julio-cesar",
      questionId: "question-caesar-rubicon",
      optionIndex: 1,
    });

    expect(result.success && result.data.isCorrect).toBe(true);
  });

  it("getContainer comparte los mismos datos entre llamadas", async () => {
    const added = await getContainer().addComment.execute({ topicSlug: "julio-cesar", author: "Livia", message: "Hola" });

    const detail = await getContainer().getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments[0]).toEqual(added.success && added.data);
  });

  it("getContainer crea casos de uso nuevos en cada llamada (el código actualizado se aplica sin reiniciar)", () => {
    expect(getContainer().getTopicDetail).not.toBe(getContainer().getTopicDetail);
  });
});
