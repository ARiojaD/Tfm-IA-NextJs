import { describe, expect, it } from "vitest";
import type { AuthService } from "@/application/ports/AuthService";

// Contrato que tiene que cumplir cada implementación de AuthService (en memoria y Better Auth + PostgreSQL).
// createAuthService devuelve un servicio sin cuentas y sin nadie con sesión.
export function describeAuthServiceContract(name: string, createAuthService: () => AuthService | Promise<AuthService>) {
  describe(`${name} cumple el contrato de AuthService`, () => {
    const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

    it("sin nadie con la sesión iniciada, no hay usuario actual", async () => {
      const auth = await createAuthService();

      expect(await auth.getCurrentUser()).toBeNull();
    });

    it("registra una cuenta y deja la sesión iniciada", async () => {
      const auth = await createAuthService();

      const result = await auth.register(livia);

      expect(result.ok).toBe(true);
      expect(await auth.getCurrentUser()).toEqual(result.ok && result.user);
    });

    it("el usuario expone solo id y nombre visible (nunca el email ni la contraseña)", async () => {
      const auth = await createAuthService();

      const result = await auth.register(livia);

      expect(result.ok && Object.keys(result.user).sort()).toEqual(["id", "name"]);
      expect(result.ok && result.user.name).toBe("Livia");
    });

    it("no registra dos cuentas con el mismo email", async () => {
      const auth = await createAuthService();
      await auth.register(livia);

      const second = await auth.register({ ...livia, name: "Otra Livia" });

      expect(second).toEqual({ ok: false, reason: "EMAIL_ALREADY_REGISTERED" });
    });

    it("cerrar la sesión deja sin usuario actual", async () => {
      const auth = await createAuthService();
      await auth.register(livia);

      await auth.signOut();

      expect(await auth.getCurrentUser()).toBeNull();
    });

    it("inicia sesión con el email y la contraseña correctos", async () => {
      const auth = await createAuthService();
      const registered = await auth.register(livia);
      await auth.signOut();

      const result = await auth.signIn({ email: livia.email, password: livia.password });

      expect(result).toEqual({ ok: true, user: registered.ok && registered.user });
      expect(await auth.getCurrentUser()).toEqual(registered.ok && registered.user);
    });

    it("rechaza una contraseña incorrecta y no inicia sesión", async () => {
      const auth = await createAuthService();
      await auth.register(livia);
      await auth.signOut();

      const result = await auth.signIn({ email: livia.email, password: "no es la contraseña" });

      expect(result).toEqual({ ok: false, reason: "INVALID_CREDENTIALS" });
      expect(await auth.getCurrentUser()).toBeNull();
    });

    it("un email que no existe da exactamente la misma respuesta que una contraseña incorrecta", async () => {
      const auth = await createAuthService();

      const result = await auth.signIn({ email: "nadie@example.com", password: livia.password });

      expect(result).toEqual({ ok: false, reason: "INVALID_CREDENTIALS" });
    });
  });
}
