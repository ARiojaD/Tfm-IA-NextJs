import { describe, expect, it } from "vitest";
import type { LibraryRepository } from "@/application/ports/LibraryRepository";

// Users and topics the contract works with. In PostgreSQL they must exist (foreign keys): the
// integration test creates them before running the contract.
export const LIBRARY_CONTRACT_USERS = ["user-1", "user-2"] as const;
export const LIBRARY_CONTRACT_TOPICS = ["topic-caesar", "topic-alesia", "topic-pericles"] as const;

const [livia, marco] = LIBRARY_CONTRACT_USERS;
const [caesar, alesia, pericles] = LIBRARY_CONTRACT_TOPICS;
const MONDAY = new Date("2026-10-26T10:00:00Z");
const TUESDAY = new Date("2026-10-27T10:00:00Z");
const WEDNESDAY = new Date("2026-10-28T10:00:00Z");

export function describeLibraryRepositoryContract(
  name: string,
  createRepository: () => LibraryRepository | Promise<LibraryRepository>,
) {
  describe(`${name} cumple el contrato de LibraryRepository`, () => {
    describe("civilizaciones seguidas", () => {
      it("un usuario nuevo no sigue ninguna civilización", async () => {
        const repository = await createRepository();

        expect(await repository.listFollowedEras(livia)).toEqual([]);
      });

      it("guarda las civilizaciones que sigue el usuario", async () => {
        const repository = await createRepository();

        await repository.followEra(livia, "ROMAN");
        await repository.followEra(livia, "HISPANIA");

        expect(await repository.listFollowedEras(livia)).toEqual(expect.arrayContaining(["ROMAN", "HISPANIA"]));
        expect(await repository.listFollowedEras(livia)).toHaveLength(2);
      });

      it("seguir dos veces la misma civilización no la duplica", async () => {
        const repository = await createRepository();

        await repository.followEra(livia, "ROMAN");
        await repository.followEra(livia, "ROMAN");

        expect(await repository.listFollowedEras(livia)).toEqual(["ROMAN"]);
      });

      it("dejar de seguir quita solo esa civilización", async () => {
        const repository = await createRepository();
        await repository.followEra(livia, "ROMAN");
        await repository.followEra(livia, "HISPANIA");

        await repository.unfollowEra(livia, "ROMAN");

        expect(await repository.listFollowedEras(livia)).toEqual(["HISPANIA"]);
      });

      it("dejar de seguir una civilización que no se seguía no falla", async () => {
        const repository = await createRepository();

        await expect(repository.unfollowEra(livia, "ROMAN")).resolves.toBeUndefined();
      });

      it("cada usuario tiene su propia lista: seguir o dejar de seguir no afecta a otros", async () => {
        const repository = await createRepository();
        await repository.followEra(livia, "ROMAN");
        await repository.followEra(marco, "ROMAN");

        await repository.unfollowEra(marco, "ROMAN");

        expect(await repository.listFollowedEras(livia)).toEqual(["ROMAN"]);
        expect(await repository.listFollowedEras(marco)).toEqual([]);
      });
    });

    describe("temas guardados", () => {
      it("un usuario nuevo no tiene temas guardados", async () => {
        const repository = await createRepository();

        expect(await repository.listSavedTopicIds(livia)).toEqual([]);
      });

      it("devuelve los temas guardados del más reciente al más antiguo", async () => {
        const repository = await createRepository();

        await repository.saveTopic(livia, alesia, TUESDAY);
        await repository.saveTopic(livia, caesar, MONDAY);
        await repository.saveTopic(livia, pericles, WEDNESDAY);

        expect(await repository.listSavedTopicIds(livia)).toEqual([pericles, alesia, caesar]);
      });

      it("guardar dos veces el mismo tema no lo duplica y conserva la fecha original", async () => {
        const repository = await createRepository();
        await repository.saveTopic(livia, caesar, MONDAY);
        await repository.saveTopic(livia, alesia, TUESDAY);

        await repository.saveTopic(livia, caesar, WEDNESDAY);

        expect(await repository.listSavedTopicIds(livia)).toEqual([alesia, caesar]);
      });

      it("quitar un tema deja los demás", async () => {
        const repository = await createRepository();
        await repository.saveTopic(livia, caesar, MONDAY);
        await repository.saveTopic(livia, alesia, TUESDAY);

        await repository.removeSavedTopic(livia, caesar);

        expect(await repository.listSavedTopicIds(livia)).toEqual([alesia]);
      });

      it("quitar un tema que no estaba guardado no falla", async () => {
        const repository = await createRepository();

        await expect(repository.removeSavedTopic(livia, caesar)).resolves.toBeUndefined();
      });

      it("cada usuario tiene sus propios temas: guardar o quitar no afecta a otros", async () => {
        const repository = await createRepository();
        await repository.saveTopic(livia, caesar, MONDAY);
        await repository.saveTopic(marco, caesar, MONDAY);

        await repository.removeSavedTopic(marco, caesar);

        expect(await repository.listSavedTopicIds(livia)).toEqual([caesar]);
        expect(await repository.listSavedTopicIds(marco)).toEqual([]);
      });
    });
  });
}
