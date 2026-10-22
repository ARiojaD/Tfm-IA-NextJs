import { describe, expect, it } from "vitest";
import { ANONYMOUS_REQUESTER, requesterIdFromHeaders } from "@/lib/requesterId";

describe("requesterIdFromHeaders", () => {
  it("usa la primera IP de x-forwarded-for (la del cliente; las siguientes son proxies)", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" });

    expect(requesterIdFromHeaders(headers)).toBe("ip:203.0.113.7");
  });

  it("acepta direcciones IPv6", () => {
    const headers = new Headers({ "x-forwarded-for": "2001:db8::1" });

    expect(requesterIdFromHeaders(headers)).toBe("ip:2001:db8::1");
  });

  it("usa x-real-ip si no hay x-forwarded-for", () => {
    expect(requesterIdFromHeaders(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("ip:198.51.100.4");
  });

  it("agrupa como anónimo a quien no trae IP", () => {
    expect(requesterIdFromHeaders(new Headers())).toBe(ANONYMOUS_REQUESTER);
  });

  it.each([
    ["texto que no es una IP", "<script>"],
    ["un valor gigante (llenaría la memoria de claves)", "1".repeat(1000)],
    ["vacío", "   "],
  ])("trata como anónimo %s", (_case, value) => {
    expect(requesterIdFromHeaders(new Headers({ "x-forwarded-for": value }))).toBe(ANONYMOUS_REQUESTER);
  });
});
