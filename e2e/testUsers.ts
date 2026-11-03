// Test accounts for the end-to-end tests. They only ever exist in the test database (created by
// globalSetup, wiped on every run): these values are not secrets.

// Signs in once (auth.setup.ts) and its cookies are reused by the tests that post comments.
export const AUTHOR = {
  name: "Autora E2E",
  email: "autora.e2e@example.com",
  password: "frase larga de la autora para los tests",
};

// Used by the sign-in tests (wrong password, return to a topic, open redirect).
export const READER = {
  name: "Lector E2E",
  email: "lector.e2e@example.com",
  password: "frase larga del lector para los tests",
};

// Made an administrator by globalSetup; signs in once (auth.setup.ts) for the admin panel tests.
export const ADMIN = {
  name: "Admin E2E",
  email: "admin.e2e@example.com",
  password: "frase larga de la administradora para los tests",
};

// Where Playwright keeps each session's cookies between the setup and the tests (git-ignored).
export const AUTHOR_STORAGE_STATE = "e2e/.auth/autora.json";
export const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";
