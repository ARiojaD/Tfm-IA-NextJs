import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createBetterAuth } from "@/infrastructure/auth/createBetterAuth";
import { BetterAuthService } from "@/infrastructure/auth/BetterAuthService";
import { accounts, sessions, users } from "@/infrastructure/persistence/postgres/schema";
import { describeAuthServiceContract } from "../../application/ports/AuthService.contract";
import { resetDatabase, testDb } from "../persistence/postgres/testDatabase";
import { InMemorySessionCookies } from "./InMemorySessionCookies";

const TEST_AUTH_ENV = { BETTER_AUTH_SECRET: "secreto-de-test-con-mas-de-32-caracteres", BETTER_AUTH_URL: "http://localhost:3000" };
const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

async function createService() {
  await resetDatabase();
  const cookies = new InMemorySessionCookies();
  return { service: new BetterAuthService(createBetterAuth(testDb, TEST_AUTH_ENV), cookies), cookies };
}

// The same contract as the in-memory double, now with Better Auth writing to the test PostgreSQL.
describeAuthServiceContract("BetterAuthService", async () => (await createService()).service);

describe("BetterAuthService (seguridad)", () => {
  it("guarda la contraseña cifrada en accounts, nunca en texto plano ni en users", async () => {
    const { service } = await createService();

    const result = await service.register(livia);

    const [account] = await testDb.select().from(accounts).where(eq(accounts.userId, result.ok ? result.user.id : ""));
    expect(account.providerId).toBe("credential");
    expect(account.password).not.toContain(livia.password);
    expect(account.password).toMatch(/^[0-9a-f]+:[0-9a-f]+$/); // scrypt: salt:hash
    const [user] = await testDb.select().from(users).where(eq(users.email, livia.email));
    expect(Object.keys(user)).not.toContain("password");
  });

  it("la cookie de sesión es httpOnly (JavaScript no puede leerla) y SameSite=Lax (frena el CSRF)", async () => {
    const { service, cookies } = await createService();

    await service.register(livia);

    const sessionCookie = cookies.get("better-auth.session_token");
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe("lax");
  });

  it("cerrar la sesión la borra también de la base de datos", async () => {
    const { service } = await createService();
    await service.register(livia);

    await service.signOut();

    expect(await testDb.select().from(sessions)).toEqual([]);
  });

  it("rechaza por sí mismo una contraseña de menos de 12 caracteres (defensa en profundidad)", async () => {
    const { service } = await createService();

    await expect(service.register({ ...livia, password: "corta123456" })).rejects.toThrow();
    expect(await testDb.select().from(users).where(eq(users.email, livia.email))).toEqual([]);
  });
});
