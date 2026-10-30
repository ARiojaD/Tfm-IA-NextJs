"use client";

import { useActionState } from "react";

export interface LibraryActionState {
  status: "idle" | "error";
  message?: string;
}

const INITIAL_STATE: LibraryActionState = { status: "idle" };

// A small form with one button that adds something to "Mi biblioteca" or takes it out. It sends the state
// wanted (`intent`), never a toggle, so a double click leaves the same result. After a change the action
// refreshes the page, which redraws the button with its new state.
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
  // Tooltip of the active button, telling what a click does (e.g. "Dejar de seguir").
  activeTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {/* Clicking asks for the opposite state: active → take it out, inactive → add it. */}
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
