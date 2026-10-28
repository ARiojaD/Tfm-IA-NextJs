import { prepareTestDatabase } from "./prepareTestDatabase";

// Runs once before the integration tests, so they always see the current schema.
export default async function setup() {
  await prepareTestDatabase();
}
