import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Una función async sin await suele ser un await olvidado. Los ports devuelven Promise incluso en los
      // adaptadores en memoria: ahí, return Promise.resolve(...) en lugar de un async inútil.
      "require-await": "error",
    },
  },
  // Sustituye los archivos ignorados por defecto de eslint-config-next.
  globalIgnores([
    // Los ignorados por defecto de eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
