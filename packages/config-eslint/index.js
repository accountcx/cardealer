/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist/', '.next/', 'node_modules/'],
};
