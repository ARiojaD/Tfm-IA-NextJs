"use client";

import { useActionState } from "react";
import { PASSWORD_MAX_LENGTH } from "@/domain/value-objects/Password";
import { AuthField } from "./AuthField";
import { type AuthFormState, INITIAL_AUTH_FORM_STATE } from "./authFormState";

export function SignInForm({
  action,
  volver,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  volver: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_AUTH_FORM_STATE);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="volver" value={volver} />
      <AuthField
        id="signin-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
      />
      <AuthField
        id="signin-password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        maxLength={PASSWORD_MAX_LENGTH}
      />
      {state.formError && (
        <p role="alert" className="text-sm text-danger">
          {state.formError}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
