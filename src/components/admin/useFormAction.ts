"use client";

import { type FormEvent, startTransition, useActionState } from "react";
import type { AdminFormState } from "./adminFormState";

// For forms whose fields are controlled by React state. With <form action={…}>, React 19 resets the form
// after a successful action (form.reset()): text inputs come back from their state, but selects, radio
// buttons and checkboxes would show their first value while the state still holds the real one. Sending
// the form from onSubmit runs the same action without that reset. The submitter goes along, so a form
// with two submit buttons (approve / reject) still says which one was pressed.
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
