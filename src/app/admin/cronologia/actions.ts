"use server";

import type { AdminFormState } from "@/components/admin/adminFormState";
import { getContainer } from "@/composition/container";
import { adminSaveState, jsonField } from "../adminActionResults";

// Server Action fina para el editor de la cronología de una civilización: el caso de uso comprueba el rol
// ADMIN, limita, valida y guarda; esta solo lee el formulario y traduce el `Result`.
export async function updateEraMilestones(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return adminSaveState(
    await getContainer().updateEraMilestones.execute({
      era: formData.get("era"),
      milestones: jsonField(formData, "milestones"),
    }),
  );
}
