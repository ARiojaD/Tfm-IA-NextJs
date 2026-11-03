import { describe, expect, it } from "vitest";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { aTopic } from "../../fixtures/historicalTopics";

// Both ports are implemented by the same class, so the contract also checks that what the editor saves
// is what the public side shows.
type TopicRepositories = TopicEditorRepository & TopicRepository;

export function describeTopicEditorRepositoryContract(
  name: string,
  createRepository: (topics: HistoricalTopic[]) => TopicRepositories | Promise<TopicRepositories>,
) {
  describe(`${name} cumple el contrato de TopicEditorRepository`, () => {
    const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", relatedTopicIds: ["topic-alesia"] });
    const alesia = aTopic({ id: "topic-alesia", slug: "asedio-de-alesia", relatedTopicIds: ["topic-caesar"] });
    const draft = aTopic({ id: "topic-draft", slug: "augusto", title: "Augusto", status: "DRAFT", introduction: [], keyFacts: [] });

    it("encuentra un tema por su id, también si es un borrador", async () => {
      const repository = await createRepository([caesar, alesia, draft]);

      expect(await repository.findById("topic-draft")).toEqual(draft);
      expect(await repository.findById("topic-caesar")).toEqual(caesar);
    });

    it("devuelve null si no hay ningún tema con ese id", async () => {
      const repository = await createRepository([caesar, alesia]);

      expect(await repository.findById("topic-missing")).toBeNull();
    });

    it("lista todos los temas, borradores incluidos", async () => {
      const repository = await createRepository([caesar, alesia, draft]);

      const topics = await repository.listAll();

      expect(topics).toHaveLength(3);
      expect(topics).toEqual(expect.arrayContaining([caesar, alesia, draft]));
    });

    it("sabe si un slug ya está en uso, por un borrador o por un tema publicado", async () => {
      const repository = await createRepository([caesar, alesia, draft]);

      expect(await repository.slugExists("julio-cesar")).toBe(true);
      expect(await repository.slugExists("augusto")).toBe(true);
      expect(await repository.slugExists("pericles")).toBe(false);
    });

    it("guarda un tema nuevo como borrador, invisible para el público", async () => {
      const repository = await createRepository([caesar, alesia]);

      await repository.save(draft);

      expect(await repository.findById("topic-draft")).toEqual(draft);
      expect(await repository.findBySlug("augusto")).toBeNull();
    });

    it("al guardar los cambios de un tema, los sustituye y conserva sus relacionados", async () => {
      const repository = await createRepository([caesar, alesia]);
      const edited = { ...caesar, title: "Cayo Julio César", relatedTopicIds: [] };

      await repository.save(edited);

      expect(await repository.findById("topic-caesar")).toEqual({ ...edited, relatedTopicIds: ["topic-alesia"] });
    });

    it("al publicar un borrador pasa a ser visible para el público", async () => {
      const repository = await createRepository([caesar, alesia, draft]);
      const published = { ...draft, status: "PUBLISHED" as const, introduction: ["Texto."], keyFacts: caesar.keyFacts };

      await repository.save(published);

      expect(await repository.findBySlug("augusto")).toEqual(published);
    });

    it("borra un tema", async () => {
      const repository = await createRepository([caesar, alesia, draft]);

      await repository.delete("topic-draft");

      expect(await repository.findById("topic-draft")).toBeNull();
      expect(await repository.listAll()).toHaveLength(2);
    });

    describe("setRelatedTopics: los relacionados van en los dos sentidos", () => {
      it("relacionar un tema con otro lo añade también en el otro", async () => {
        const repository = await createRepository([caesar, alesia, draft]);

        await repository.setRelatedTopics("topic-draft", ["topic-caesar"]);

        expect((await repository.findById("topic-draft"))?.relatedTopicIds).toEqual(["topic-caesar"]);
        expect((await repository.findById("topic-caesar"))?.relatedTopicIds).toEqual(
          expect.arrayContaining(["topic-alesia", "topic-draft"]),
        );
      });

      it("quitar un relacionado lo quita también del otro tema", async () => {
        const repository = await createRepository([caesar, alesia, draft]);

        await repository.setRelatedTopics("topic-caesar", []);

        expect((await repository.findById("topic-caesar"))?.relatedTopicIds).toEqual([]);
        expect((await repository.findById("topic-alesia"))?.relatedTopicIds).toEqual([]);
      });

      it("sustituye la lista: lo que no se nombra deja de estar relacionado", async () => {
        const repository = await createRepository([caesar, alesia, draft]);

        await repository.setRelatedTopics("topic-caesar", ["topic-draft"]);

        expect((await repository.findById("topic-caesar"))?.relatedTopicIds).toEqual(["topic-draft"]);
        expect((await repository.findById("topic-alesia"))?.relatedTopicIds).toEqual([]);
        expect((await repository.findById("topic-draft"))?.relatedTopicIds).toEqual(["topic-caesar"]);
      });
    });

    it("guarda y devuelve copias: modificar los objetos no altera lo guardado", async () => {
      const repository = await createRepository([caesar, alesia]);
      const topic = structuredClone(draft);

      await repository.save(topic);
      topic.title = "Modificado";
      (await repository.findById("topic-draft"))!.summary = "Modificado";

      expect(await repository.findById("topic-draft")).toEqual(draft);
    });
  });
}
