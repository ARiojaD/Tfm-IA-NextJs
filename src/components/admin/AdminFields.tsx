import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { AdminFormState } from "./adminFormState";

// Campos del editor del panel. Como AuthField: etiqueta, ayuda y error enlazados para los lectores de pantalla.

const CONTROL_CLASS =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent aria-invalid:border-danger";

function describedBy(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </>
  );
}

export function SelectField({
  id,
  label,
  hint,
  errors,
  children,
  ...select
}: { id: string; label: string; hint?: string; errors?: string[]; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const error = errors?.[0];
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, hint, error)} className={CONTROL_CLASS} {...select}>
        {children}
      </select>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  errors,
  ...textarea
}: { id: string; label: string; hint?: string; errors?: string[] } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const error = errors?.[0];
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL_CLASS} resize-y leading-6`}
        {...textarea}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

// El botón de guardar de una sección y, a su lado, el resultado del último guardado.
export function SaveBar({ state, isPending, label = "Guardar" }: { state: AdminFormState; isPending: boolean; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {isPending ? "Guardando…" : label}
      </button>
      <div aria-live="polite" className="text-sm">
        {state.status === "success" && <p className="text-success">Guardado ✓</p>}
        {state.formErrors?.map((message) => (
          <p key={message} className="text-danger">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
