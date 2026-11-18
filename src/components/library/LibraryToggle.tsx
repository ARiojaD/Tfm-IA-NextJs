"use client";

import { useActionState } from "react";

export interface LibraryActionState {
  status: "idle" | "error";
  message?: string;
}

const INITIAL_STATE: LibraryActionState = { status: "idle" };

// Un formulario pequeño con un botón que añade algo a «Mi biblioteca» o lo quita. Envía el estado deseado
// (`intent`), nunca un «cambiar», así que un doble clic deja el mismo resultado. Tras un cambio, la acción
// refresca la página, que vuelve a pintar el botón con su estado nuevo.
export function LibraryToggle({
  action,
  fields,
  active,
  activeIntent,
  inactiveIntent,
  activeLabel,
  inactiveLabel,
  activeTitle,
}: {
  action: (state: LibraryActionState, formData: FormData) => Promise<LibraryActionState>;
  fields: Record<string, string>;
  active: boolean;
  activeIntent: string;
  inactiveIntent: string;
  activeLabel: string;
  inactiveLabel: string;
  // El texto emergente del botón activo, que dice qué hace un clic (por ejemplo, «Dejar de seguir»).
  activeTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {/* Un clic pide el estado contrario: activo → quitarlo, inactivo → añadirlo. */}
      <input type="hidden" name="intent" value={active ? inactiveIntent : activeIntent} />
      <button
        type="submit"
        disabled={isPending}
        aria-pressed={active}
        title={active ? activeTitle : undefined}
        className={
          active
            ? "inline-flex h-10 items-center justify-center rounded-full border border-accent bg-accent-soft px-5 text-sm font-medium text-accent transition-opacity hover:opacity-85 disabled:opacity-60"
            : "inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
        }
      >
        {active ? activeLabel : inactiveLabel}
      </button>
      <p aria-live="polite" className="text-sm">
        {state.status === "error" && <span className="text-danger">{state.message}</span>}
      </p>
    </form>
  );
}
