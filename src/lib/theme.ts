// El tema claro u oscuro de la web, que elige el visitante y se recuerda en su navegador.
export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "memnon-theme";

// Se ejecuta antes del primer pintado para que un tema guardado nunca muestre un instante el contrario.
// Es un texto fijo, sin nada que venga del usuario; el almacenamiento puede no estar disponible (modo
// privado), así que falla en silencio y la página usa la preferencia del sistema mediante CSS.
export const THEME_INIT_SCRIPT = `(function () {
  try {
    var theme = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (theme !== "light" && theme !== "dark") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.theme = theme;
  } catch (error) {}
})();`;
