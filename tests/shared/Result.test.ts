import { describe, expect, it } from "vitest";
import { failure, success } from "@/shared/Result";

describe("Result", () => {
  it("success envuelve un valor correcto", () => {
    expect(success(42)).toEqual({ success: true, data: 42 });
  });

  it("failure envuelve un error", () => {
    const error = new Error("algo falló");

    expect(failure(error)).toEqual({ success: false, error });
  });
});
