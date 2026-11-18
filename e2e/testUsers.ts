// Cuentas de prueba para los tests end-to-end. Solo existen en la base de datos de test (las crea
// globalSetup y se borran en cada ejecución): estos valores no son secretos.

// Inicia sesión una vez (auth.setup.ts) y los tests que publican comentarios reutilizan sus cookies.
export const AUTHOR = {
  name: "Autora E2E",
  email: "autora.e2e@example.com",
  password: "frase larga de la autora para los tests",
};

// La usan los tests de inicio de sesión (contraseña incorrecta, volver a un tema, redirección abierta).
export const READER = {
  name: "Lector E2E",
  email: "lector.e2e@example.com",
  password: "frase larga del lector para los tests",
};

// globalSetup la hace administradora; inicia sesión una vez (auth.setup.ts) para los tests del panel.
export const ADMIN = {
  name: "Admin E2E",
  email: "admin.e2e@example.com",
  password: "frase larga de la administradora para los tests",
};

// Dónde guarda Playwright las cookies de cada sesión entre la preparación y los tests (ignorado por Git).
export const AUTHOR_STORAGE_STATE = "e2e/.auth/autora.json";
export const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";
