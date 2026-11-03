import { describe, expect, it } from "vitest";
import { TopicStatusSchema } from "@/domain/value-objects/TopicStatus";

describe("TopicStatusSchema", () => {
  it.each(["DRAFT", "PUBLISHED"])("acepta el estado %s", (status) => {
    expect(TopicStatusSchema.safeParse(status).success).toBe(true);
  });

  it.each(["draft", "ARCHIVED", ""])("rechaza un estado desconocido: %j", (status) => {
    expect(TopicStatusSchema.safeParse(status).success).toBe(false);
  });
});
