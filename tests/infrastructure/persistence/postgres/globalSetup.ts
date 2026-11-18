import { prepareTestDatabase } from "./prepareTestDatabase";

// Se ejecuta una vez antes de los tests de integración, para que siempre vean el esquema actual.
export default async function setup() {
  await prepareTestDatabase();
}
