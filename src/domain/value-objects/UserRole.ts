import { z } from "zod";

// Lo que puede hacer una cuenta. Todas son USER; ADMIN además gestiona el contenido desde el panel.
// Solo un operador concede ADMIN (`npm run admin:grant`): nadie puede convertirse en administrador desde la web.
export const USER_ROLES = ["USER", "ADMIN"] as const;

export const UserRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof UserRoleSchema>;
