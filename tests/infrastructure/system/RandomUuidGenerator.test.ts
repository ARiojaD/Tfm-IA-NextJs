import { describe, expect, it } from "vitest";
import { RandomUuidGenerator } from "@/infrastructure/system/RandomUuidGenerator";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("RandomUuidGenerator", () => {
  it("genera identificadores con formato UUID v4", () => {
    expect(new RandomUuidGenerator().generate()).toMatch(UUID_V4);
  });

  it("no repite identificadores", () => {
    const generator = new RandomUuidGenerator();
    const ids = Array.from({ length: 1000 }, () => generator.generate());

    expect(new Set(ids).size).toBe(1000);
  });
});
