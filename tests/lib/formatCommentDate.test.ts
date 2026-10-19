import { describe, expect, it } from "vitest";
import { formatCommentDate } from "@/lib/formatCommentDate";

describe("formatCommentDate", () => {
  it("muestra fecha y hora en español", () => {
    expect(formatCommentDate(new Date("2026-10-18T07:15:00Z"))).toBe("18 oct 2026, 9:15");
  });

  it("usa la hora de España aunque el servidor esté en otra zona horaria", () => {
    // 23:30 UTC del día 18 ya es día 19 en Madrid (UTC+2 en octubre).
    expect(formatCommentDate(new Date("2026-10-18T23:30:00Z"))).toBe("19 oct 2026, 1:30");
  });
});
