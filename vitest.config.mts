import { defineConfig } from 'vitest/config';

/**
 * Vitest-only augmentation of the @angular/build unit-test pipeline (wired via
 * the `runnerConfig` test option in angular.json). Keep ng-cryptostore in
 * Vite's pipeline so its ESM dependency graph is transformed for the runner.
 */
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['ng-cryptostore'],
        interopDefault: true,
      },
    },
  },
});