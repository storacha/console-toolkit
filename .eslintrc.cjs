/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
    '*.config.ts',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    'react-hooks/exhaustive-deps': 'warn',
  },
}
