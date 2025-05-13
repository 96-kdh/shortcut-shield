import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
   baseDirectory: __dirname, // optional; default: process.cwd()
   resolvePluginsRelativeTo: __dirname, // optional
   recommendedConfig: js.configs.recommended, // optional unless you're using "eslint:recommended"
   allConfig: js.configs.all, // optional unless you're using "eslint:all"
});

export default [
   // mimic ESLintRC-style extends
   ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
   {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
         parser: tsParser,
         parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            project: "./tsconfig.json",
         },
      },
      plugins: {
         "@typescript-eslint": tsPlugin,
      },
      rules: {
         // your TS-specific rules here…
         "@typescript-eslint/no-unused-vars": "warn",
         "@typescript-eslint/no-non-null-assertion": "off",
         // etc.
      },
   },
   {
      // a JavaScript override if you need one
      files: ["**/*.js"],
      languageOptions: {
         ecmaVersion: 2022,
         sourceType: "module",
      },
      rules: {
         // JS rules…
      },
   },
];
