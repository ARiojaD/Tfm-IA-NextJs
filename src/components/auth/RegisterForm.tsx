"use client";

import { useActionState } from "react";
import { DISPLAY_NAME_MAX_LENGTH } from "@/domain/value-objects/DisplayName";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";
import { AuthField } from "./AuthField";
import { type AuthFormState, INITIAL_AUTH_FORM_STATE } from "./authFormState";

// The browser limits (maxLength, type="email") only help the visitor; the server validates everything.
export function RegisterForm({
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
        id="register-name"
        name="name"
        label="Nombre visible"
        hint="Es el nombre con el que firmarás tus comentarios. Tu email nunca se muestra."
        autoComplete="nickname"
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        defaultValue={state.values?.name}
        errors={state.fieldErrors?.name}
      />
      <AuthField
        id="register-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <AuthField
        id="register-password"
        name="password"
        type="password"
        label="Contraseña"
        hint={`Al menos ${PASSWORD_MIN_LENGTH} caracteres. Una frase larga es más segura y fácil de recordar.`}
        autoComplete="new-password"
        maxLength={PASSWORD_MAX_LENGTH}
        errors={state.fieldErrors?.password}
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
        {isPending ? "Creando la cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
