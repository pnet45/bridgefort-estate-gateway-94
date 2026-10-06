import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Existing Supabase/SDK response objects are intentionally dynamic. Keep `any` non-blocking while the codebase is progressively typed.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description", "ts-expect-error": "allow-with-description", "ts-nocheck": "allow-with-description" }],
      "no-var": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }],
    },
  }
);
