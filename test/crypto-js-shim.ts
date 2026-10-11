import CryptoJS from 'crypto-js/index.js';

/**
 * Crypto-js namespace shim for the Vitest runner (see vitest.config.mts).
 *
 * crypto-js assigns its members (AES, enc, mode, pad…) dynamically onto the
 * CommonJS export, so neither Node's CJS→ESM interop nor cjs-module-lexer can
 * produce a namespace with them — `import * as CryptoJS from 'crypto-js'`
 * inside ng-cryptostore's bundle would see `AES === undefined` and throw.
 * The browser build is unaffected (esbuild copies every CJS property onto the
 * namespace at runtime); this shim restores that shape for the test run by
 * re-exporting the members as real named exports.
 *
 * The import uses `crypto-js/index.js` (not the bare specifier) so the alias
 * below does not rewrite this module onto itself.
 */
export const AES = CryptoJS.AES;
export const enc = CryptoJS.enc;
export const mode = CryptoJS.mode;
export const pad = CryptoJS.pad;
export const lib = CryptoJS.lib;
export const algo = CryptoJS.algo;
export const format = CryptoJS.format;
export const kdf = CryptoJS.kdf;
export const x64 = CryptoJS.x64;

export default CryptoJS;