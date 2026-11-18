// Lo que muestran los formularios de inicio de sesión y registro tras un intento fallido. Se devuelven los
// valores escritos para no tener que repetirlos, salvo la contraseña, que nunca vuelve al navegador.
export interface AuthFormState {
  status: "idle" | "error";
  fieldErrors?: { name?: string[]; email?: string[]; password?: string[] };
  formError?: string;
  values?: { name?: string; email?: string };
}

export const INITIAL_AUTH_FORM_STATE: AuthFormState = { status: "idle" };
