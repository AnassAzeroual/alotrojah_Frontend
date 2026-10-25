import * as i0 from '@angular/core';
import { InjectionToken, ModuleWithProviders, EnvironmentProviders } from '@angular/core';

/** Every backend supported by the library. */
type StorageType = 'localStorage' | 'sessionStorage' | 'IndexedDB' | 'cookies' | 'memory';
/** Fine tuning of the encryption layer. */
interface EncryptionOptions {
    /**
     * Payload format written by the library.
     *
     * - `v2` (default): random salt + random IV per value, PBKDF2 key derivation and an
     *   HMAC-SHA256 authentication tag (tamper detection).
     * - `legacy`: the historical format (static IV derived from the secret, no authentication).
     *   Only use it to stay interoperable with data written by ng-cryptostore <= 21.0.x while an
     *   older version of the library is still deployed somewhere. Values written in `legacy`
     *   format can always be *read* by `v2` builds, so migration is automatic on next write.
     */
    format?: 'v2' | 'legacy';
    /**
     * PBKDF2 iteration count used by the `v2` format. Defaults to `2500`.
     *
     * The key derivation is only paid when a value is encrypted or decrypted;
     * repeated reads are served by the in-memory cache unless it is disabled.
     * Raise it for stronger protection against brute force of a weak secret.
     */
    iterations?: number;
}
/** IndexedDB specific options. */
interface IndexedDBOptions {
    /** Database name. Defaults to `myDatabase` (kept for backward compatibility). */
    databaseName?: string;
    /** Object store name. Defaults to `myObjectStore`. */
    storeName?: string;
    /** Database schema version. Defaults to `2`. */
    version?: number;
}
/** Cookie specific options. */
interface CookieOptions {
    /** Cookie path. Defaults to `/`. */
    path?: string;
    /** Cookie domain. Defaults to the current host. */
    domain?: string;
    /** Cookie SameSite attribute. Defaults to `Lax`. */
    sameSite?: 'Lax' | 'Strict' | 'None';
    /** Write the `Secure` attribute. Defaults to `true` when served over HTTPS. */
    secure?: boolean;
    /** Lifetime in days. `null` creates a session cookie. Defaults to `1` day. */
    expiresInDays?: number | null;
    /** Maximum number of characters per cookie before values are split. Defaults to `3800`. */
    maxCookieSize?: number;
}
/** Configuration of the library, passed to `provideNgCryptoStore()`. */
interface StorageConfig {
    /** Backend used to persist the values. */
    storageType: StorageType;
    /** Fallback secret used when no secret is passed to an API call. */
    secret?: string;
    /** Encryption tuning. */
    encryption?: EncryptionOptions;
    /**
     * Cache decrypted values in memory to avoid re-running PBKDF2/AES on every read.
     * The cache is invalidated on every write and when another browser tab changes the storage.
     * Defaults to `true`.
     */
    cache?: boolean;
    /**
     * Prefix applied to every key written by the library.
     * Useful to namespace the storage inside a shared backend or to scope `clearAll()`.
     */
    keyPrefix?: string;
    /** IndexedDB tuning. */
    indexedDB?: IndexedDBOptions;
    /** Cookie tuning. */
    cookies?: CookieOptions;
}
/** Default configuration used when the token is injected without `provideNgCryptoStore()`. */
declare const DEFAULT_STORAGE_CONFIG: Readonly<StorageConfig>;
declare const STORAGE_CONFIG: InjectionToken<StorageConfig>;

/**
 * Encrypted key/value storage for Angular applications.
 *
 * Values are serialized with a rich JSON codec (dates, maps, sets, bigints survive the
 * round trip), encrypted (AES-256-CBC, PBKDF2 derivation, HMAC-SHA256 integrity tag) and
 * handed over to the configured backend: `localStorage`, `sessionStorage`, `IndexedDB`,
 * `cookies` or `memory`.
 *
 * ### Synchronous vs asynchronous
 *
 * `localStorage`, `sessionStorage`, `cookies` and `memory` are synchronous: use `get()`,
 * `getEncrypted()` and `check()`. `IndexedDB` is asynchronous: only the async APIs
 * (`asyncGet()`, `asyncGetEncrypted()`, `asyncCheck()`) work with it, everything else throws
 * {@link AsyncStorageError}. Mutating operations (`set`, `remove`, `clearAll`) are always
 * asynchronous so the same code works with every backend.
 */
declare class StorageService {
    private readonly adapter;
    private readonly crypto;
    private readonly config;
    private readonly prefix;
    private readonly cacheEnabled;
    private readonly plaintextCache;
    private readonly syncAdapter;
    private readonly asyncAdapter;
    constructor();
    /** Backend currently in use. */
    get storageType(): StorageType;
    /** `true` when the backend is asynchronous (IndexedDB or a custom async adapter). */
    get isAsyncStorage(): boolean;
    /**
     * Encrypts and stores a value.
     *
     * ```ts
     * await store.set('fruits', [{ name: 'fraise', icons: '🍓' }]);
     * await store.set('session', user, 'my-own-secret');
     * ```
     */
    set<T>(name: string, data: T, secret?: string): Promise<void>;
    /**
     * Reads and decrypts a value (synchronous backends only).
     *
     * Returns `''` when the key does not exist and throws {@link DecryptionError} when the
     * payload cannot be decrypted (wrong secret) or was tampered with.
     */
    get<T = unknown>(name: string, secret?: string): T | '' | null;
    /** Asynchronous counterpart of {@link get}, required for asynchronous backends. */
    asyncGet<T = unknown>(name: string, secret?: string): Promise<T | '' | null>;
    /** Returns the raw encrypted payload (synchronous backends only). `''` when missing. */
    getEncrypted(name: string): string | '' | null;
    /** Asynchronous counterpart of {@link getEncrypted}. */
    asyncGetEncrypted(name: string): Promise<string | '' | null>;
    /** `true` when a (non empty) value exists for `name` (synchronous backends only). */
    check(name: string): boolean;
    /** Asynchronous counterpart of {@link check}. */
    asyncCheck(name: string): Promise<boolean>;
    /** Removes one entry. */
    remove(name: string): Promise<void>;
    /** Removes every entry owned by the configured backend (respecting `keyPrefix` when set). */
    clearAll(): Promise<void>;
    /** Names of the entries currently stored (the configured `keyPrefix` is stripped). */
    keys(): Promise<string[]>;
    /**
     * Decrypts a value and measures its size: character count for strings, item count for
     * arrays / maps / sets, own key count for plain objects. `0` for primitives.
     */
    getItemLength(name: string, secret?: string): Promise<number>;
    /** Encrypts any value without storing it. */
    crypt(data: unknown, secret?: string): Promise<string>;
    /** Decrypts any payload produced by {@link crypt} or {@link getEncrypted}. */
    decrypt<T = unknown>(payload: string, secret?: string): Promise<T | ''>;
    private requireSync;
    private decode;
    private toKey;
    private toSecret;
    private cacheKey;
    private invalidateKey;
    private normalizePayload;
    /** Another tab changed the storage: drop the affected decrypted values. */
    private handleStorageEvent;
    static ɵfac: i0.ɵɵFactoryDeclaration<StorageService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<StorageService>;
}

/**
 * Provides the ng-cryptostore services with the given configuration.
 * This is the recommended way to configure the library in standalone applications.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgCryptoStore({ storageType: 'localStorage' })
 *   ]
 * });
 * ```
 */
declare function provideNgCryptoStore(config?: StorageConfig): EnvironmentProviders;
/**
 * @deprecated Use `provideNgCryptoStore()` instead. This module is kept for backward compatibility.
 */
declare class StorageModule {
    constructor(parentModule?: StorageModule);
    /**
     * @deprecated Use `provideNgCryptoStore()` instead.
     */
    static withConfig(config: StorageConfig): ModuleWithProviders<StorageModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<StorageModule, [{ optional: true; skipSelf: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<StorageModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<StorageModule>;
}

/**
 * Passphrase used when neither the API call nor the configuration provides one.
 * Kept identical to previous versions so existing data stays readable.
 */
declare const DEFAULT_SECRET = "kQ-ND4EZF421S@DF84FQZ634\u00A7/4FSQ1C6\u00A7!Q5Q4F@E1SDQ!F84G68TH451BBF3SFD64R9!EG6DG";
/**
 * Handles every cryptographic operation of the library.
 *
 * ### Payload formats
 *
 * `v2` (written by default since 21.1) is a five part string:
 *
 * ```
 * v2.<salt>.<iv>.<ciphertext>.<mac>
 * ```
 *
 * - `salt` (16 bytes, random per value) feeds PBKDF2-SHA256 to derive a 256 bit AES key
 *   and a 256 bit HMAC key from the secret.
 * - `iv` (16 bytes, random per value) feeds AES-256-CBC.
 * - `mac` is HMAC-SHA256 over `salt.iv.ciphertext` so tampering is detected before decryption.
 *
 * Parts are base64url encoded, which makes payloads safe for any storage backend
 * (cookies, URLs, JSON) without escaping.
 *
 * `legacy` payloads (anything not starting with `v2.`) written by older versions are still
 * readable; they are re-encrypted with the modern format on the next write.
 *
 * The primitives (AES, HMAC, PBKDF2, MD5, CSPRNG) are provided by the audited
 * `@noble/ciphers` and `@noble/hashes` packages; the byte layout is unchanged, so payloads
 * written by previous versions remain readable in both directions.
 */
declare class CryptoService {
    private readonly config;
    /** PBKDF2 iteration count of the `v2` format. */
    get iterations(): number;
    /** True when new payloads are written with the authenticated `v2` format. */
    get usesModernFormat(): boolean;
    /** Encrypts a string and returns the serialized payload. */
    encryptString(plainText: string, secret?: string): string;
    /** Decrypts a payload produced by {@link encryptString} (any format). */
    decryptString(payload: string, secret?: string): string;
    /** Serializes and encrypts any value. */
    encrypt(value: unknown, secret?: string): string;
    /** Decrypts and deserializes any value. Throws {@link DecryptionError} on failure. */
    decrypt<T = unknown>(payload: string, secret?: string): T;
    private encryptV2;
    private decryptV2;
    /**
     * Historical format: the OpenSSL `Salted__` envelope with a random 8 byte salt and keys
     * derived through EVP_BytesToKey (MD5). Kept only to read data written by
     * ng-cryptostore <= 21.0.x (and to write it when `encryption.format` is set to `'legacy'`).
     */
    private encryptLegacy;
    private decryptLegacy;
    private deriveKeys;
    static ɵfac: i0.ɵɵFactoryDeclaration<CryptoService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CryptoService>;
}

/** Serializes any value to a JSON string. Always returns a string, even for `undefined`. */
declare function encodeJson(value: unknown): string;
/** Parses a JSON string produced by {@link encodeJson}. Plain JSON is fully supported. */
declare function decodeJson<T = unknown>(text: string): T;

/** Minimal shape shared by the browser `Storage` interface and in-memory implementations. */
interface StorageLike {
    readonly length: number;
    key(index: number): string | null;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
/**
 * Backend contract used internally by `StorageService`.
 *
 * Values are always strings (already encrypted). Implement this interface and provide it
 * through `STORAGE_ADAPTER` to plug a custom backend (React Native AsyncStorage, Capacitor
 * Preferences, a remote API...). Adapters that are inherently asynchronous
 * (IndexedDB, network, native bridges) must set `isAsync: true` and return promises.
 */
interface SyncStorageAdapter {
    readonly isAsync: false;
    readonly kind: StorageType;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    /** All logical keys currently held by the backend. */
    keys(): string[];
    /** Removes every entry owned by the backend (or only the ones matching the key prefix). */
    clear(): void;
}
/** Asynchronous flavour of {@link SyncStorageAdapter}. */
interface AsyncStorageAdapter {
    readonly isAsync: true;
    readonly kind: StorageType;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
}
type StorageAdapter = SyncStorageAdapter | AsyncStorageAdapter;
/**
 * In-memory key/value store.
 *
 * Used automatically when the application runs outside a browser (SSR, unit tests) and
 * available as the `memory` storage type for short lived data.
 */
declare class MemoryStorageAdapter implements SyncStorageAdapter, StorageLike {
    readonly isAsync: false;
    readonly kind: StorageType;
    private readonly store;
    get length(): number;
    key(index: number): string | null;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    keys(): string[];
    clear(): void;
}

/**
 * Injection token of the backend used by `StorageService`.
 *
 * Override it to plug a custom implementation:
 *
 * ```ts
 * providers: [
 *   { provide: STORAGE_ADAPTER, useValue: myAsyncAdapter }
 * ]
 * ```
 */
declare const STORAGE_ADAPTER: InjectionToken<StorageAdapter>;

/**
 * Adapter for the synchronous Web Storage APIs (`localStorage` / `sessionStorage`).
 *
 * Every access is guarded because some environments (Safari private mode, storage disabled
 * by policy) throw on read as well as on write. `clear()` deletes the whole storage when no
 * key prefix is configured (historical behaviour) and only the prefixed keys otherwise.
 */
declare class WebStorageAdapter implements SyncStorageAdapter, StorageLike {
    private readonly target;
    readonly kind: StorageType;
    private readonly prefix;
    readonly isAsync: false;
    constructor(target: StorageLike, kind: StorageType, prefix?: string);
    get length(): number;
    key(index: number): string | null;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    keys(): string[];
    clear(): void;
    private guard;
}

/**
 * Cookie backend.
 *
 * Fixes and improvements over the historical implementation:
 * - values are URI encoded and decoded (cookie-safe),
 * - large values are transparently split into chunks (cookies are limited to ~4 KB),
 *   up to {@link MAX_CHUNKS} chunks, and reassembled on read,
 * - the `Path`, `Domain`, `SameSite` and `Secure` attributes are always written so that
 *   reading and deleting a cookie works from any route of the application,
 * - `clear()` only removes the cookies owned by the configured `keyPrefix`
 *   (every cookie of the application when no prefix is configured, the historical behaviour),
 * - safe on the server: reads return `null`, writes throw {@link StorageUnavailableError}.
 */
declare class CookieService implements SyncStorageAdapter {
    readonly isAsync: false;
    readonly kind: "cookies";
    private readonly config;
    private get options();
    private get prefix();
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    keys(): string[];
    clear(): void;
    /**
     * @deprecated Use `setItem(key, value)` instead. Kept for backward compatibility.
     * `expires` accepts a number of days or an absolute `Date`.
     */
    create(key: string, value: string, expires?: number | Date): void;
    /** @deprecated Use `getItem(key)` instead. Returns `''` when the cookie is missing. */
    read(key: string): string;
    /** @deprecated Use `setItem(key, value)` instead. */
    update(key: string, value: string, expires?: number | Date): void;
    /** @deprecated Use `removeItem(key)` instead. */
    delete(key: string): void;
    /** @deprecated Use `clear()` instead. */
    deleteAll(): void;
    private write;
    private readRaw;
    private writeRaw;
    private deleteRaw;
    private cookieNames;
    private chunkKey;
    private chunkCount;
    private deleteChunks;
    private assertAvailable;
    static ɵfac: i0.ɵɵFactoryDeclaration<CookieService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CookieService>;
}

/**
 * IndexedDB backend.
 *
 * Rewritten from scratch: the historical implementation created an auto-incrementing store
 * (`keyPath`) and then called `add(value, key)`, which always throws a `DataError`, so
 * nothing could ever be stored. This version is a plain asynchronous key/value store:
 *
 * - the database is opened once, lazily, and the connection is shared by every call
 *   (concurrent calls during startup wait on the same promise),
 * - writes are `put()` (upsert) instead of `add()` so updating a key works,
 * - opening a database created by an old version re-creates the incompatible object store,
 * - `onblocked` / `onversionchange` are handled so other tabs can upgrade the schema.
 */
declare class IndexedDBService implements AsyncStorageAdapter {
    readonly isAsync: true;
    readonly kind: "IndexedDB";
    private readonly config;
    private database;
    private get options();
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    /**
     * Closes the underlying connection (it is reopened lazily on the next call).
     * Useful in tests and before deleting the database.
     */
    close(): void;
    /** @deprecated Use `setItem(key, value)` instead. */
    create(key: string, value: string): Promise<void>;
    /** @deprecated Use `getItem(key)` instead. */
    read(key: string): Promise<string | null>;
    /** @deprecated Use `setItem(key, value)` instead. */
    update(key: string, value: string): Promise<void>;
    /** @deprecated Use `removeItem(key)` instead. */
    delete(key: string): Promise<void>;
    /** @deprecated Use `clear()` instead. */
    deleteAll(): Promise<void>;
    private openDatabase;
    private run;
    static ɵfac: i0.ɵɵFactoryDeclaration<IndexedDBService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IndexedDBService>;
}

/**
 * Base class for every error thrown by ng-cryptostore.
 *
 * Catch this type to handle any library failure:
 *
 * ```ts
 * try {
 *   await store.asyncGet('fruits');
 * } catch (error) {
 *   if (error instanceof NgCryptoStoreError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
declare class NgCryptoStoreError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/** Thrown when the configured storage type is unknown or not provided. */
declare class UnsupportedStorageTypeError extends NgCryptoStoreError {
    constructor(storageType: unknown);
}
/** Thrown when the underlying storage is unavailable (private mode, disabled cookies, no IndexedDB support, SSR...). */
declare class StorageUnavailableError extends NgCryptoStoreError {
    constructor(message: string, options?: ErrorOptions);
}
/** Thrown when a synchronous method is used while an asynchronous backend (IndexedDB) is configured. */
declare class AsyncStorageError extends NgCryptoStoreError {
    constructor(method: string, storageType: string);
}
/** Thrown when writing to a storage backend fails (quota exceeded, storage disabled...). */
declare class StorageWriteError extends NgCryptoStoreError {
    constructor(message: string, options?: ErrorOptions);
}
/** Thrown when data is too large for a single cookie and exceeds the chunk limit. */
declare class CookieLimitError extends NgCryptoStoreError {
    constructor(key: string, size: number, limit: number);
}
/** Thrown when a payload cannot be decrypted (wrong secret or corrupted data). */
declare class DecryptionError extends NgCryptoStoreError {
    constructor(message: string, options?: ErrorOptions);
}
/** Thrown when the payload was tampered with: the authentication tag does not match. */
declare class IntegrityError extends DecryptionError {
    constructor(message?: string);
}

export { AsyncStorageError, CookieLimitError, CookieService, CryptoService, DEFAULT_SECRET, DEFAULT_STORAGE_CONFIG, DecryptionError, IndexedDBService, IntegrityError, MemoryStorageAdapter, NgCryptoStoreError, STORAGE_ADAPTER, STORAGE_CONFIG, StorageModule, StorageService, StorageUnavailableError, StorageWriteError, UnsupportedStorageTypeError, WebStorageAdapter, decodeJson, encodeJson, provideNgCryptoStore };
export type { AsyncStorageAdapter, CookieOptions, EncryptionOptions, IndexedDBOptions, StorageAdapter, StorageConfig, StorageLike, StorageType, SyncStorageAdapter };
