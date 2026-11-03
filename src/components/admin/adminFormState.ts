// What every admin editor form shows after saving: a confirmation, or the errors next to each field and
// the ones that belong to the whole form (e.g. what is missing to publish).
export interface AdminFormState {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}

export const INITIAL_ADMIN_FORM_STATE: AdminFormState = { status: "idle" };
