import { headers } from "next/headers";
import { requesterIdFromHeaders } from "./requesterId";

// El visitante que llama a la Server Action en curso, para los límites de peticiones (ver `requesterId.ts`).
export async function currentRequesterId(): Promise<string> {
  return requesterIdFromHeaders(await headers());
}
