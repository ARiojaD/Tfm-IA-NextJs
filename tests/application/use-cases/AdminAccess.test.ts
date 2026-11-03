import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import type { AuthenticatedUser } from "@/application/ports/AuthService";
import { GetAdminAccessUseCase } from "@/application/use-cases/GetAdminAccessUseCase";
import { GetCurrentUserUseCase } from "@/application/use-cases/GetCurrentUserUseCase";
import { ListTopicsForAdminUseCase } from "@/application/use-cases/ListTopicsForAdminUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", period: { start: { year: -100 } } });
const alesia = aTopic({ id: "topic-alesia", slug: "asedio-de-alesia", title: "Asedio de Alesia", period: { start: { year: -52 } } });
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

describe("Acceso al panel de administración", () => {
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let user: AuthenticatedUser;

  beforeEach(async () => {
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    const registered = await auth.register(livia);
    user = registered.ok ? registered.user : { id: "", name: "" };
  });

  describe("GetAdminAccessUseCase", () => {
    it("deja pasar a una administradora y devuelve quién es", async () => {
      await roles.setRole(user.id, "ADMIN");

      expect(await new GetAdminAccessUseCase({ auth, roles }).execute()).toEqual({ success: true, data: user });
    });

    it("sin sesión pide iniciar sesión", async () => {
      await auth.signOut();

      const result = await new GetAdminAccessUseCase({ auth, roles }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });

    it("con sesión pero sin ser administradora, se rechaza (OWASP A01: escalada de privilegios)", async () => {
      const result = await new GetAdminAccessUseCase({ auth, roles }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });

    it("quitar el rol surte efecto al momento, sin esperar a que caduque la sesión", async () => {
      await roles.setRole(user.id, "ADMIN");
      await roles.setRole(user.id, "USER");

      const result = await new GetAdminAccessUseCase({ auth, roles }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });
  });

  describe("ListTopicsForAdminUseCase", () => {
    const topics = new InMemoryTopicRepository([alesia, pericles, caesar]);

    it("una administradora ve todos los temas, por civilización y en orden cronológico", async () => {
      await roles.setRole(user.id, "ADMIN");

      const result = await new ListTopicsForAdminUseCase({ topicEditor: topics, auth, roles }).execute();

      expect(result.success && result.data).toEqual([
        { era: "ANCIENT_GREECE", topics: [pericles] },
        { era: "ROMAN", topics: [caesar, alesia] },
        { era: "HISPANIA", topics: [] },
      ]);
    });

    it("un usuario normal no puede listarlos", async () => {
      const result = await new ListTopicsForAdminUseCase({ topicEditor: topics, auth, roles }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });
  });

  describe("GetCurrentUserUseCase", () => {
    it("indica si el usuario es administrador, para mostrarle el enlace al panel", async () => {
      await roles.setRole(user.id, "ADMIN");

      expect(await new GetCurrentUserUseCase({ auth, roles }).execute()).toEqual({ ...user, isAdmin: true });
    });

    it("un usuario normal no es administrador", async () => {
      expect(await new GetCurrentUserUseCase({ auth, roles }).execute()).toEqual({ ...user, isAdmin: false });
    });
  });
});
