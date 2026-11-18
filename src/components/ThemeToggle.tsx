"use client";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Almacenamiento no disponible (por ejemplo, modo privado): la elección dura solo esta visita.
    }
  }

  // El tema actual vive en data-theme, así que iconos y textos cambian con la variante dark: en lugar de
  // con estado de React; así el HTML del servidor y el del navegador son idénticos.
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-foreground/30"
    >
      <span className="sr-only dark:hidden">Activar modo oscuro</span>
      <span className="sr-only hidden dark:inline">Activar modo claro</span>
      <svg
        className="size-[1.125rem] dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        className="hidden size-[1.125rem] dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}
