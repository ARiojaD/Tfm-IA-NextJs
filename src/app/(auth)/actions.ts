"use server";

import { redirect } from "next/navigation";
import { InvalidRegistrationError } from "@/application/errors/InvalidRegistrationError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { AuthFormState } from "@/components/auth/authFormState";
import { getContainer } from "@/composition/container";
import { currentRequesterId } from "@/lib/currentRequesterId";
import { safeRedirectPath } from "@/lib/safeRedirectPath";

// Thin Server Actions for the account pages: the use cases validate, rate-limit and talk to Better Auth;
// these only read the form, translate the Result and redirect. The destination after signing in comes
// from the form (?volver=…) and goes through safeRedirectPath: only paths inside this site.

function rateLimitMessage(error: RateLimitExceededError): string {
  return `Demasiados intentos seguidos. Espera ${error.retryAfterSeconds} s y vuelve a intentarlo.`;
}

function typedValue(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  return typeof value === "string" ? value : undefined;
}

export async function registerUser(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { name: typedValue(formData, "name"), email: typedValue(formData, "email") };
  const result = await getContainer().registerUser.execute(
    { name: formData.get("name"), email: formData.get("email"), password: formData.get("password") },
    await currentRequesterId(),
  );

  if (result.success) {
    redirect(safeRedirectPath(formData.get("volver")));
  }
  if (result.error instanceof RateLimitExceededError) {
    return { status: "error", formError: rateLimitMessage(result.error), values };
  }
  if (result.error instanceof InvalidRegistrationError) {
    const { name, email, password } = result.error.fieldErrors;
    return { status: "error", fieldErrors: { name, email, password }, formError: result.error.formErrors[0], values };
  }
  return { status: "error", formError: result.error.message, values };
}

export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: typedValue(formData, "email") };
  const result = await getContainer().signIn.execute(
    { email: formData.get("email"), password: formData.get("password") },
    await currentRequesterId(),
  );

  if (result.success) {
    redirect(safeRedirectPath(formData.get("volver")));
  }
  if (result.error instanceof RateLimitExceededError) {
    return { status: "error", formError: rateLimitMessage(result.error), values };
  }
  return { status: "error", formError: result.error.message, values };
}

export async function signOut(): Promise<void> {
  await getContainer().signOut.execute();
  redirect("/");
}
