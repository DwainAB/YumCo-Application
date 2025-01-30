import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser"; // Importer le parser correctement

export default [
  js.configs.recommended,
  {
    plugins: {
      react: react,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: babelParser,  // Utiliser le parser comme objet
    },
    rules: {
      "no-unused-vars": "warn",
    },
    ignores: ["node_modules/**"], // Utiliser 'ignores' au lieu de 'ignorePatterns'
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // Appliquer les règles aux fichiers .js, .jsx, .ts, .tsx
  },
];
