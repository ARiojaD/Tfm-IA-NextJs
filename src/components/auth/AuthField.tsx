import type { InputHTMLAttributes } from "react";

// Un campo con su etiqueta y su mensaje de error, enlazados para los lectores de pantalla (aria-invalid, aria-describedby).
export function AuthField({
  id,
  label,
  hint,
  errors,
  ...input
}: { id: string; label: string; hint?: string; errors?: string[] } & InputHTMLAttributes<HTMLInputElement>) {
  const error = errors?.[0];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent aria-invalid:border-danger"
        {...input}
      />
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
    </div>
  );
}
