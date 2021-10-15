// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
