"use client";

import { type FormEvent, startTransition, useActionState } from "react";
import type { AdminFormState } from "./adminFormState";

// Para formularios cuyos campos controla el estado de React. Con <form action={…}>, React 19 resetea el
// formulario tras una acción correcta (form.reset()): los campos de texto vuelven a su estado, pero los
// select, los radio y las casillas mostrarían su primer valor mientras el estado guarda el real. Enviar el
// formulario desde onSubmit ejecuta la misma acción sin ese reseteo. El botón que lo envía va también, así
// que un formulario con dos botones (aprobar / rechazar) sigue diciendo cuál se pulsó.
export function useFormAction(
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>,
  initialState: AdminFormState,
) {
  const [state, dispatch, isPending] = useActionState(action, initialState);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  };

  return { state, onSubmit, isPending };
}
