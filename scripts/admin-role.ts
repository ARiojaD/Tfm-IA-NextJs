import { existsSync } from "node:fs";
import { parseDatabaseEnv } from "@/composition/env";
import { EmailSchema } from "@/domain/value-objects/Email";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { PostgresUserRoleRepository } from "@/infrastructure/persistence/postgres/PostgresUserRoleRepository";

// npm run admin:grant -- tu@email.com   → the account becomes an administrator
// npm run admin:revoke -- tu@email.com  → back to a normal user
// The only way to change a role: it needs access to the server and its database, never the web.
// The account must exist first (sign up in the web). It applies on the next request.
async function main() {
  const [action, rawEmail] = process.argv.slice(2);
  const email = EmailSchema.safeParse(rawEmail);
  if ((action !== "grant" && action !== "revoke") || !email.success) {
    console.error("Uso: npm run admin:grant -- tu@email.com  (o admin:revoke)");
    process.exitCode = 1;
    return;
  }

  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const { db, close } = createDatabase(parseDatabaseEnv(process.env).DATABASE_URL, { maxConnections: 1 });

  try {
    const roles = new PostgresUserRoleRepository(db);
    const userId = await roles.findUserIdByEmail(email.data);
    if (!userId) {
      console.error(`No hay ninguna cuenta con el email ${email.data}. Regístrate primero en la web.`);
      process.exitCode = 1;
      return;
    }

    await roles.setRole(userId, action === "grant" ? "ADMIN" : "USER");
    console.log(
      action === "grant"
        ? `${email.data} ya es administrador. Verá el enlace "Panel" en la cabecera.`
        : `${email.data} vuelve a ser un usuario normal.`,
    );
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  // Only the message: a driver error could otherwise print connection details.
  console.error(`No se pudo cambiar el rol: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
