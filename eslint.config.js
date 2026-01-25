const js = require("@eslint/js")
const next = require("eslint-config-next")
const prettier = require("eslint-config-prettier")
const jest = require("eslint-plugin-jest")
const globals = require("globals")

module.exports = [
  js.configs.recommended,
  ...next,
  {
    plugins: {
      jest,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
  prettier,
]
