// ESLint flat config for API (TypeScript + Node)
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      curly: ["error", "all"],
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
    ignores: ["dist/**"],
  },
];
