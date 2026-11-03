import { z } from "zod";

// What an account may do. Every account is a USER; ADMIN can also manage the content from the panel.
// Only an operator grants ADMIN (npm run admin:grant): nobody can become one from the web.
export const USER_ROLES = ["USER", "ADMIN"] as const;

export const UserRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof UserRoleSchema>;
