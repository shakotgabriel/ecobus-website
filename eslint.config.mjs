import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", ".open-next/**", "out/**", "node_modules/**", "next-env.d.ts", "cloudflare-env.d.ts"]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // Data loading in effects is the established pattern here; surface it without failing CI.
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
])
