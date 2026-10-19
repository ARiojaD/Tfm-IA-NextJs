import { describe, expect, it } from "vitest";
import { SystemClock } from "@/infrastructure/system/SystemClock";

describe("SystemClock", () => {
  it("devuelve la fecha y hora actuales", () => {
    const before = Date.now();
    const now = new SystemClock().now();
    const after = Date.now();

    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
    expect(now.getTime()).toBeLessThanOrEqual(after);
  });
});
