import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Vitest-only augmentation of the @angular/build unit-test pipeline (wired via
 * the `runnerConfig` test option in angular.json).
 *
 * Why: ng-cryptostore's ESM bundle does `import * as CryptoJS from 'crypto-js'`
 * and crypto-js ships CommonJS whose members (AES/enc/mode/pad) are assigned
 * dynamically, so Node's CJS→ESM interop (which detects exports statically)
 * leaves the namespace without them — AES ends up undefined and every vault
 * call throws. The browser build is unaffected (esbuild's runtime interop
 * copies all CJS properties onto the namespace).
 *
 * Turning on `interopDefault` alone is not enough (members are still not
 * statically detectable), so ng-cryptostore is forced through Vite's pipeline
 * (`server.deps.inline`) and its bare `crypto-js` specifier is aliased to
 * `test/crypto-js-shim.ts`, which re-exports the members as real named exports
 * — the same shape the browser produces.
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
  resolve: {
    alias: [
      {
        find: /^crypto-js$/,
        replacement: fileURLToPath(new URL('test/crypto-js-shim.ts', import.meta.url)),
      },
    ],
  },
});