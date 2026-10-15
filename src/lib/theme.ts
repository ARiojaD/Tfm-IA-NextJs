export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "memnon-theme";

// Runs before the first paint so a stored choice never flashes the wrong theme.
// Static string with no user input; storage may be unavailable (private mode), so it fails silently
// and the page falls back to the system preference through CSS.
export const THEME_INIT_SCRIPT = `(function () {
  try {
    var theme = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (theme !== "light" && theme !== "dark") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.theme = theme;
  } catch (error) {}
})();`;
