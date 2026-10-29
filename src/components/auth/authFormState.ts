// What the sign-in and sign-up forms show after a failed attempt. The values the visitor typed are sent
// back so they do not have to retype them, except the password, which never travels back to the browser.
export interface AuthFormState {
  status: "idle" | "error";
  fieldErrors?: { name?: string[]; email?: string[]; password?: string[] };
  formError?: string;
  values?: { name?: string; email?: string };
}

export const INITIAL_AUTH_FORM_STATE: AuthFormState = { status: "idle" };
