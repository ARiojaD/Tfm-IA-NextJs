import { headers } from "next/headers";
import { requesterIdFromHeaders } from "./requesterId";

// The visitor calling the current Server Action, for rate limiting (see requesterId.ts).
export async function currentRequesterId(): Promise<string> {
  return requesterIdFromHeaders(await headers());
}
