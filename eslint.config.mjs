// Audit P2 toolchain: angular-eslint baseline config (2026-10-12).
// Scoped rules: recommended TS + Angular template checks. Pre-existing
// violations are NOT fixed in bulk — gate new/changed files only.
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', '.angular/**', 'node_modules/**', 'test-results/**', 'src/app/core/api/models/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {},
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
