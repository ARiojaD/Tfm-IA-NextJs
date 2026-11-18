// Lo que muestra cada formulario del panel tras guardar: una confirmación, o los errores junto a cada campo
// y los que son del formulario entero (por ejemplo, lo que falta para publicar).
export interface AdminFormState {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
  // Información que conviene saber tras una acción correcta (por ejemplo, «publicado sin imagen»).
  notices?: string[];
}

export const INITIAL_ADMIN_FORM_STATE: AdminFormState = { status: "idle" };
