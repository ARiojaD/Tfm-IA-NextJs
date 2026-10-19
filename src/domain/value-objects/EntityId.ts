import { z } from "zod";

// Opaque, storage-agnostic identifier: works with readable seed ids today and UUIDs from a database later.
export const EntityIdSchema = z.string().trim().min(1);

export type EntityId = z.infer<typeof EntityIdSchema>;
