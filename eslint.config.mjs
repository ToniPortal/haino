import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended
});

export default [
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" }
  },
  { languageOptions: { globals: globals.browser } },
  ...compat.extends("airbnb-base"),
  // Règle pour le style de saut de ligne et désactivation de la règle no-param-reassign
  {
    rules: {
      "linebreak-style": ["error", "windows"],
      "no-param-reassign": "off", // Désactivation de la règle no-param-reassign
      "no-console": ["error", { allow: ["warn", "error"] }], // Ignorer uniquement les console.warn et console.error
      "no-plusplus": "off",
      "max-len": ["error", { "code": 150 }]
    }
  },
  // Règle pour exclure Electron des dépendances extraneous
  {
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
          bundledDependencies: false,
          // Spécifiez le chemin relatif vers Electron
          packageDir: ["./", "./node_modules/electron"]
        }
      ]
    }
  },
  // Exclure le dossier "build" de la configuration ESLint
  {
    files: ["build/**"],
    rules: {
      "import/no-extraneous-dependencies": "off"
    }
  }
];
