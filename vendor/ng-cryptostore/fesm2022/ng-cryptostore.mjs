import * as i0 from '@angular/core';
import { InjectionToken, inject, Injectable, PLATFORM_ID, DestroyRef, makeEnvironmentProviders, Optional, SkipSelf, NgModule } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { cbc } from '@noble/ciphers/aes.js';
import { hmac } from '@noble/hashes/hmac.js';
import { md5 } from '@noble/hashes/legacy.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes, utf8ToBytes, concatBytes } from '@noble/hashes/utils.js';

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
class NgCryptoStoreError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = new.target.name;
    }
}
/** Thrown when the configured storage type is unknown or not provided. */
class UnsupportedStorageTypeError extends NgCryptoStoreError {
    constructor(storageType) {
        super(`Unsupported storage type: "${String(storageType)}". ` +
            `Expected one of "localStorage", "sessionStorage", "IndexedDB", "cookies" or "memory".`);
    }
}
/** Thrown when the underlying storage is unavailable (private mode, disabled cookies, no IndexedDB support, SSR...). */
class StorageUnavailableError extends NgCryptoStoreError {
    constructor(message, options) {
        super(message, options);
    }
}
/** Thrown when a synchronous method is used while an asynchronous backend (IndexedDB) is configured. */
class AsyncStorageError extends NgCryptoStoreError {
    constructor(method, storageType) {
        super(`"${method}()" cannot be used with the asynchronous "${storageType}" storage. ` +
            `Use the asynchronous variant instead (for example "asyncGet()", "remove()" or "clearAll()").`);
    }
}
/** Thrown when writing to a storage backend fails (quota exceeded, storage disabled...). */
class StorageWriteError extends NgCryptoStoreError {
    constructor(message, options) {
        super(message, options);
    }
}
/** Thrown when data is too large for a single cookie and exceeds the chunk limit. */
class CookieLimitError extends NgCryptoStoreError {
    constructor(key, size, limit) {
        super(`The value for "${key}" needs ${size} characters and cannot be stored in cookies ` +
            `(maximum ${limit} characters). Consider using "localStorage" or "IndexedDB" instead.`);
    }
}
/** Thrown when a payload cannot be decrypted (wrong secret or corrupted data). */
class DecryptionError extends NgCryptoStoreError {
    constructor(message, options) {
        super(message, options);
    }
}
/** Thrown when the payload was tampered with: the authentication tag does not match. */
class IntegrityError extends DecryptionError {
    constructor(message = 'The stored value failed its integrity check and was rejected.') {
        super(message);
    }
}

/** Default configuration used when the token is injected without `provideNgCryptoStore()`. */
const DEFAULT_STORAGE_CONFIG = Object.freeze({ storageType: 'localStorage' });
const STORAGE_CONFIG = new InjectionToken('StorageConfig', {
    providedIn: 'root',
    factory: () => ({ ...DEFAULT_STORAGE_CONFIG })
});

const CHUNK_MARKER = '__ngcs_chunked__';
const CHUNK_INFIX = '.__ngcs_';
const MAX_CHUNKS = 64;
const DEFAULT_MAX_COOKIE_SIZE = 3800;
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
class CookieService {
    constructor() {
        this.isAsync = false;
        this.kind = 'cookies';
        this.config = inject(STORAGE_CONFIG);
    }
    get options() {
        const cookies = this.config.cookies ?? {};
        return {
            path: cookies.path ?? '/',
            domain: cookies.domain,
            sameSite: cookies.sameSite ?? 'Lax',
            secure: cookies.secure ?? isSecureContext(),
            expiresInDays: cookies.expiresInDays === undefined ? 1 : cookies.expiresInDays,
            maxCookieSize: Math.max(200, cookies.maxCookieSize ?? DEFAULT_MAX_COOKIE_SIZE)
        };
    }
    get prefix() {
        return this.config.keyPrefix ?? '';
    }
    // ---------------------------------------------------------------------------
    // StorageAdapter implementation
    // ---------------------------------------------------------------------------
    getItem(key) {
        const raw = this.readRaw(key);
        if (raw === null)
            return null;
        if (raw.startsWith(`${CHUNK_MARKER}:`)) {
            const count = Number.parseInt(raw.slice(CHUNK_MARKER.length + 1), 10);
            if (!Number.isInteger(count) || count <= 0 || count > MAX_CHUNKS)
                return null;
            let encoded = '';
            for (let index = 0; index < count; index++) {
                const part = this.readRaw(this.chunkKey(key, index));
                if (part === null)
                    return null;
                encoded += part;
            }
            return decodeSafely(encoded);
        }
        return decodeSafely(raw);
    }
    setItem(key, value) {
        this.write(key, value, this.options.expiresInDays);
    }
    removeItem(key) {
        const chunks = this.chunkCount(key);
        this.deleteRaw(key);
        this.deleteChunks(key, chunks);
    }
    keys() {
        const names = new Set();
        for (const name of this.cookieNames()) {
            if (!name.includes(CHUNK_INFIX))
                names.add(name);
        }
        return Array.from(names);
    }
    clear() {
        const names = this.keys();
        for (const name of names) {
            if (!this.prefix || name.startsWith(this.prefix)) {
                this.removeItem(name);
            }
        }
    }
    // ---------------------------------------------------------------------------
    // Historical API (kept for backward compatibility)
    // ---------------------------------------------------------------------------
    /**
     * @deprecated Use `setItem(key, value)` instead. Kept for backward compatibility.
     * `expires` accepts a number of days or an absolute `Date`.
     */
    create(key, value, expires) {
        if (expires === undefined) {
            this.setItem(key, value);
            return;
        }
        const days = expires instanceof Date ? (expires.getTime() - Date.now()) / 86_400_000 : expires;
        this.write(key, value, days);
    }
    /** @deprecated Use `getItem(key)` instead. Returns `''` when the cookie is missing. */
    read(key) {
        return this.getItem(key) ?? '';
    }
    /** @deprecated Use `setItem(key, value)` instead. */
    update(key, value, expires) {
        this.create(key, value, expires);
    }
    /** @deprecated Use `removeItem(key)` instead. */
    delete(key) {
        this.removeItem(key);
    }
    /** @deprecated Use `clear()` instead. */
    deleteAll() {
        this.clear();
    }
    // ---------------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------------
    write(key, value, expiresInDays) {
        this.assertAvailable();
        const encoded = encodeURIComponent(value);
        const { maxCookieSize } = this.options;
        const previousChunks = this.chunkCount(key);
        if (encoded.length <= maxCookieSize) {
            this.writeRaw(key, encoded, expiresInDays);
            if (previousChunks > 0)
                this.deleteChunks(key, previousChunks);
            return;
        }
        const count = Math.ceil(encoded.length / maxCookieSize);
        if (count > MAX_CHUNKS) {
            throw new CookieLimitError(key, value.length, maxCookieSize * MAX_CHUNKS);
        }
        for (let index = 0; index < count; index++) {
            const part = encoded.slice(index * maxCookieSize, (index + 1) * maxCookieSize);
            this.writeRaw(this.chunkKey(key, index), part, expiresInDays);
        }
        this.writeRaw(key, `${CHUNK_MARKER}:${count}`, expiresInDays);
        if (previousChunks > count)
            this.deleteChunks(key, previousChunks, count);
    }
    readRaw(key) {
        if (typeof document === 'undefined')
            return null;
        const prefix = `${key}=`;
        for (const entry of document.cookie.split(';')) {
            const trimmed = entry.trimStart();
            if (trimmed.startsWith(prefix))
                return trimmed.slice(prefix.length);
        }
        return null;
    }
    writeRaw(key, value, expiresInDays) {
        this.assertAvailable();
        const options = this.options;
        let cookie = `${key}=${value}`;
        if (expiresInDays !== null) {
            const expires = new Date();
            expires.setTime(expires.getTime() + expiresInDays * 86_400_000);
            cookie += `; expires=${expires.toUTCString()}`;
        }
        cookie += `; path=${options.path}`;
        if (options.domain)
            cookie += `; domain=${options.domain}`;
        cookie += `; SameSite=${options.sameSite}`;
        if (options.secure)
            cookie += '; Secure';
        document.cookie = cookie;
    }
    deleteRaw(key) {
        if (typeof document === 'undefined')
            return;
        this.writeRaw(key, '', -1);
    }
    cookieNames() {
        if (typeof document === 'undefined')
            return [];
        const names = [];
        for (const entry of document.cookie.split(';')) {
            const separator = entry.indexOf('=');
            if (separator === -1)
                continue;
            const name = entry.slice(0, separator).trim();
            if (name)
                names.push(name);
        }
        return names;
    }
    chunkKey(key, index) {
        return `${key}${CHUNK_INFIX}${index}`;
    }
    chunkCount(key) {
        const raw = this.readRaw(key);
        if (raw === null || !raw.startsWith(`${CHUNK_MARKER}:`))
            return 0;
        const count = Number.parseInt(raw.slice(CHUNK_MARKER.length + 1), 10);
        return Number.isInteger(count) && count > 0 && count <= MAX_CHUNKS ? count : 0;
    }
    deleteChunks(key, count, from = 0) {
        for (let index = from; index < count; index++) {
            this.deleteRaw(this.chunkKey(key, index));
        }
    }
    assertAvailable() {
        if (typeof document === 'undefined') {
            throw new StorageUnavailableError('Cookies cannot be written outside of a browser environment.');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CookieService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CookieService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CookieService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
function decodeSafely(encoded) {
    try {
        return decodeURIComponent(encoded);
    }
    catch {
        return encoded;
    }
}
function isSecureContext() {
    return typeof location !== 'undefined' && location.protocol === 'https:';
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
class IndexedDBService {
    constructor() {
        this.isAsync = true;
        this.kind = 'IndexedDB';
        this.config = inject(STORAGE_CONFIG);
        this.database = null;
    }
    get options() {
        const options = this.config.indexedDB ?? {};
        return {
            databaseName: options.databaseName ?? 'myDatabase',
            storeName: options.storeName ?? 'myObjectStore',
            version: options.version ?? 2
        };
    }
    async getItem(key) {
        const value = await this.run('readonly', (store) => store.get(key));
        return typeof value === 'string' ? value : null;
    }
    async setItem(key, value) {
        await this.run('readwrite', (store) => store.put(value, key));
    }
    async removeItem(key) {
        await this.run('readwrite', (store) => store.delete(key));
    }
    async keys() {
        const keys = await this.run('readonly', (store) => store.getAllKeys());
        return keys.map(String);
    }
    async clear() {
        await this.run('readwrite', (store) => store.clear());
    }
    /**
     * Closes the underlying connection (it is reopened lazily on the next call).
     * Useful in tests and before deleting the database.
     */
    close() {
        const pending = this.database;
        this.database = null;
        pending?.then((database) => database.close()).catch(() => undefined);
    }
    // ---------------------------------------------------------------------------
    // Historical API (kept for backward compatibility)
    // ---------------------------------------------------------------------------
    /** @deprecated Use `setItem(key, value)` instead. */
    create(key, value) {
        return this.setItem(key, value);
    }
    /** @deprecated Use `getItem(key)` instead. */
    read(key) {
        return this.getItem(key);
    }
    /** @deprecated Use `setItem(key, value)` instead. */
    update(key, value) {
        return this.setItem(key, value);
    }
    /** @deprecated Use `removeItem(key)` instead. */
    delete(key) {
        return this.removeItem(key);
    }
    /** @deprecated Use `clear()` instead. */
    deleteAll() {
        return this.clear();
    }
    // ---------------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------------
    openDatabase() {
        if (this.database)
            return this.database;
        const { databaseName, storeName, version } = this.options;
        this.database = new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new StorageUnavailableError('IndexedDB is not available in this environment.'));
                return;
            }
            const request = indexedDB.open(databaseName, version);
            request.onupgradeneeded = () => {
                const database = request.result;
                if (database.objectStoreNames.contains(storeName)) {
                    // Object stores created by ng-cryptostore <= 21.0.x use an inline keyPath and are
                    // incompatible with key/value access: recreate them.
                    const existing = request.transaction?.objectStore(storeName);
                    if (existing && existing.keyPath !== null) {
                        database.deleteObjectStore(storeName);
                    }
                }
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName);
                }
            };
            request.onsuccess = () => {
                const database = request.result;
                database.onversionchange = () => {
                    database.close();
                    this.database = null;
                };
                resolve(database);
            };
            request.onerror = () => {
                this.database = null;
                reject(new StorageUnavailableError(`Unable to open the IndexedDB database "${databaseName}".`, {
                    cause: request.error
                }));
            };
        });
        // Never cache a rejected promise; every caller still receives the rejection.
        this.database.catch(() => {
            this.database = null;
        });
        return this.database;
    }
    async run(mode, action) {
        const database = await this.openDatabase();
        const { storeName } = this.options;
        return new Promise((resolve, reject) => {
            let transaction;
            let request;
            try {
                transaction = database.transaction(storeName, mode);
                request = action(transaction.objectStore(storeName));
            }
            catch (error) {
                reject(new StorageUnavailableError(`The IndexedDB store "${storeName}" could not be accessed.`, { cause: error }));
                return;
            }
            let result;
            request.onsuccess = () => {
                result = request.result;
                if (mode === 'readonly')
                    resolve(result);
            };
            request.onerror = () => {
                reject(request.error ?? new StorageUnavailableError('An IndexedDB request failed.'));
            };
            transaction.oncomplete = () => resolve(result);
            transaction.onabort = () => {
                reject(transaction.error ?? new StorageUnavailableError('The IndexedDB transaction was aborted.'));
            };
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: IndexedDBService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: IndexedDBService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: IndexedDBService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * In-memory key/value store.
 *
 * Used automatically when the application runs outside a browser (SSR, unit tests) and
 * available as the `memory` storage type for short lived data.
 */
class MemoryStorageAdapter {
    constructor() {
        this.isAsync = false;
        this.kind = 'memory';
        this.store = new Map();
    }
    get length() {
        return this.store.size;
    }
    key(index) {
        return Array.from(this.store.keys())[index] ?? null;
    }
    getItem(key) {
        return this.store.get(key) ?? null;
    }
    setItem(key, value) {
        this.store.set(key, value);
    }
    removeItem(key) {
        this.store.delete(key);
    }
    keys() {
        return Array.from(this.store.keys());
    }
    clear() {
        this.store.clear();
    }
}

/**
 * Adapter for the synchronous Web Storage APIs (`localStorage` / `sessionStorage`).
 *
 * Every access is guarded because some environments (Safari private mode, storage disabled
 * by policy) throw on read as well as on write. `clear()` deletes the whole storage when no
 * key prefix is configured (historical behaviour) and only the prefixed keys otherwise.
 */
class WebStorageAdapter {
    constructor(target, kind, prefix = '') {
        this.target = target;
        this.kind = kind;
        this.prefix = prefix;
        this.isAsync = false;
    }
    get length() {
        return this.guard(() => this.target.length, 0);
    }
    key(index) {
        return this.guard(() => this.target.key(index), null);
    }
    getItem(key) {
        return this.guard(() => this.target.getItem(key), null);
    }
    setItem(key, value) {
        try {
            this.target.setItem(key, value);
        }
        catch (error) {
            throw new StorageWriteError(`Unable to write "${key}" to ${this.kind}. The storage may be full or disabled by the browser.`, { cause: error });
        }
    }
    removeItem(key) {
        this.guard(() => this.target.removeItem(key), undefined);
    }
    keys() {
        const result = [];
        const length = this.guard(() => this.target.length, 0);
        for (let index = 0; index < length; index++) {
            const key = this.guard(() => this.target.key(index), null);
            if (key !== null)
                result.push(key);
        }
        return result;
    }
    clear() {
        if (!this.prefix) {
            this.guard(() => this.target.clear(), undefined);
            return;
        }
        for (const key of this.keys()) {
            if (key.startsWith(this.prefix)) {
                this.guard(() => this.target.removeItem(key), undefined);
            }
        }
    }
    guard(operation, fallback) {
        try {
            return operation();
        }
        catch {
            return fallback;
        }
    }
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
const STORAGE_ADAPTER = new InjectionToken('ng-cryptostore:storage-adapter', {
    providedIn: 'root',
    factory: () => {
        const config = inject(STORAGE_CONFIG);
        const storageType = config.storageType;
        const prefix = config.keyPrefix ?? '';
        // Server side rendering / web workers: keep the API working with an in-memory store.
        if (!isPlatformBrowser(inject(PLATFORM_ID))) {
            return new MemoryStorageAdapter();
        }
        switch (storageType) {
            case 'localStorage':
                return new WebStorageAdapter(nativeStorage('localStorage'), 'localStorage', prefix);
            case 'sessionStorage':
                return new WebStorageAdapter(nativeStorage('sessionStorage'), 'sessionStorage', prefix);
            case 'cookies':
                return inject(CookieService);
            case 'IndexedDB':
                return inject(IndexedDBService);
            case 'memory':
                return new MemoryStorageAdapter();
            default:
                throw new UnsupportedStorageTypeError(storageType);
        }
    }
});
/**
 * Returns the native storage object, or an in-memory fallback when the browser blocks
 * access to it (private mode, cookies/storage disabled by policy...).
 */
function nativeStorage(kind) {
    try {
        const storage = globalThis[kind];
        if (storage)
            return storage;
    }
    catch {
        // Reading the property itself can throw a SecurityError.
    }
    console.warn(`ng-cryptostore: ${kind} is not available in this browser, falling back to an in-memory store.`);
    return new MemoryStorageAdapter();
}

/**
 * JSON codec with support for types that `JSON.stringify()` usually destroys.
 *
 * Round trips: `Date`, `BigInt`, `Map`, `Set`, `undefined`, `NaN`, `Infinity` and `-0`.
 * Plain JSON stays identical to what `JSON.parse()` produces, so values written by
 * older versions of the library keep being readable.
 */
const TAG_KEY = '__ngcs';
const TAGS = ['undefined', 'bigint', 'number', 'date', 'map', 'set'];
function isTag(value) {
    return typeof value === 'string' && TAGS.includes(value);
}
function replacer(key, value) {
    // `Date.prototype.toJSON()` runs before the replacer, so the original value has to be
    // read from the holder object to detect dates.
    const original = this?.[key];
    if (original instanceof Date) {
        return { [TAG_KEY]: 'date', value: Number.isNaN(original.getTime()) ? null : original.toISOString() };
    }
    if (value === undefined) {
        // `JSON.stringify` would drop the property / turn it into null (array holes).
        return { [TAG_KEY]: 'undefined' };
    }
    if (typeof value === 'bigint') {
        return { [TAG_KEY]: 'bigint', value: value.toString() };
    }
    if (typeof value === 'number') {
        if (Number.isNaN(value))
            return { [TAG_KEY]: 'number', value: 'NaN' };
        if (!Number.isFinite(value))
            return { [TAG_KEY]: 'number', value: value > 0 ? 'Infinity' : '-Infinity' };
        if (Object.is(value, -0))
            return { [TAG_KEY]: 'number', value: '-0' };
        return value;
    }
    if (value instanceof Map) {
        return { [TAG_KEY]: 'map', value: Array.from(value.entries()) };
    }
    if (value instanceof Set) {
        return { [TAG_KEY]: 'set', value: Array.from(value.values()) };
    }
    return value;
}
/**
 * A tagged object has at most two keys, `__ngcs` (a known tag) and optionally `value`.
 * Anything else is treated as user data and left untouched.
 */
function isTaggedObject(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const keys = Object.keys(value);
    if (keys.length === 0 || keys.length > 2)
        return false;
    for (const key of keys) {
        if (key !== TAG_KEY && key !== 'value')
            return false;
    }
    return isTag(value[TAG_KEY]);
}
function reviver(_key, value) {
    if (!isTaggedObject(value))
        return value;
    const tag = value[TAG_KEY];
    const inner = value['value'];
    try {
        switch (tag) {
            case 'undefined':
                return undefined;
            case 'bigint':
                return typeof inner === 'string' ? BigInt(inner) : value;
            case 'number':
                if (inner === 'NaN')
                    return Number.NaN;
                if (inner === '-0')
                    return -0;
                if (inner === 'Infinity')
                    return Number.POSITIVE_INFINITY;
                if (inner === '-Infinity')
                    return Number.NEGATIVE_INFINITY;
                return value;
            case 'date':
                if (inner === null)
                    return new Date(Number.NaN);
                return typeof inner === 'string' ? new Date(inner) : value;
            case 'map':
                return Array.isArray(inner) ? new Map(inner) : value;
            case 'set':
                return Array.isArray(inner) ? new Set(inner) : value;
        }
    }
    catch {
        return value;
    }
}
/** Serializes any value to a JSON string. Always returns a string, even for `undefined`. */
function encodeJson(value) {
    const text = JSON.stringify(value, replacer);
    return text === undefined ? JSON.stringify({ [TAG_KEY]: 'undefined' }) : text;
}
/** Parses a JSON string produced by {@link encodeJson}. Plain JSON is fully supported. */
function decodeJson(text) {
    return JSON.parse(text, reviver);
}

/**
 * Passphrase used when neither the API call nor the configuration provides one.
 * Kept identical to previous versions so existing data stays readable.
 */
const DEFAULT_SECRET = 'kQ-ND4EZF421S@DF84FQZ634§/4FSQ1C6§!Q5Q4F@E1SDQ!F84G68TH451BBF3SFD64R9!EG6DG';
/** Marker prefix of the modern, authenticated payload format. */
const V2_PREFIX = 'v2.';
const SALT_BYTES = 16;
const IV_BYTES = 16;
const ENCRYPTION_KEY_BYTES = 32;
const MAC_KEY_BYTES = 32;
const AES_BLOCK_BYTES = 16;
const DEFAULT_ITERATIONS = 1000;
/** OpenSSL envelope of the legacy format: 8 magic bytes + 8 salt bytes + ciphertext. */
const LEGACY_MAGIC = 'Salted__';
const LEGACY_SALT_BYTES = 8;
/** Chunk size for converting byte arrays to binary strings without hitting argument limits. */
const BINARY_CHUNK = 0x8000;
/** UTF-8 decoder that rejects malformed byte sequences instead of silently replacing them. */
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
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
class CryptoService {
    constructor() {
        this.config = inject(STORAGE_CONFIG);
    }
    /** PBKDF2 iteration count of the `v2` format. */
    get iterations() {
        return Math.max(1, Math.trunc(this.config.encryption?.iterations ?? DEFAULT_ITERATIONS));
    }
    /** True when new payloads are written with the authenticated `v2` format. */
    get usesModernFormat() {
        return (this.config.encryption?.format ?? 'v2') !== 'legacy';
    }
    /** Encrypts a string and returns the serialized payload. */
    encryptString(plainText, secret) {
        const passphrase = secret || DEFAULT_SECRET;
        return this.usesModernFormat ? this.encryptV2(plainText, passphrase) : this.encryptLegacy(plainText, passphrase);
    }
    /** Decrypts a payload produced by {@link encryptString} (any format). */
    decryptString(payload, secret) {
        const passphrase = secret || DEFAULT_SECRET;
        return payload.startsWith(V2_PREFIX)
            ? this.decryptV2(payload, passphrase)
            : this.decryptLegacy(payload, passphrase);
    }
    /** Serializes and encrypts any value. */
    encrypt(value, secret) {
        return this.encryptString(encodeJson(value), secret);
    }
    /** Decrypts and deserializes any value. Throws {@link DecryptionError} on failure. */
    decrypt(payload, secret) {
        const plainText = this.decryptString(payload, secret);
        try {
            return decodeJson(plainText);
        }
        catch (error) {
            throw new DecryptionError('The decrypted value is not valid JSON: wrong secret or corrupted data.', {
                cause: error
            });
        }
    }
    encryptV2(plainText, passphrase) {
        const salt = randomBytes(SALT_BYTES);
        const iv = randomBytes(IV_BYTES);
        const keys = this.deriveKeys(passphrase, salt);
        const ciphertext = cbc(keys.encryption, iv).encrypt(utf8ToBytes(plainText));
        const header = `${toBase64Url(salt)}.${toBase64Url(iv)}.${toBase64Url(ciphertext)}`;
        const mac = hmac(sha256, keys.mac, utf8ToBytes(header));
        return `${V2_PREFIX}${header}.${toBase64Url(mac)}`;
    }
    decryptV2(payload, passphrase) {
        const parts = payload.slice(V2_PREFIX.length).split('.');
        if (parts.length !== 4) {
            throw new DecryptionError('Malformed v2 payload: expected 5 dot separated parts.');
        }
        const [saltPart, ivPart, cipherPart, macPart] = parts;
        let salt;
        let iv;
        let ciphertext;
        let mac;
        try {
            salt = fromBase64Url(saltPart);
            iv = fromBase64Url(ivPart);
            ciphertext = fromBase64Url(cipherPart);
            mac = fromBase64Url(macPart);
        }
        catch (error) {
            throw new DecryptionError('Malformed v2 payload: invalid base64url segment.', { cause: error });
        }
        if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || mac.length !== MAC_KEY_BYTES) {
            throw new DecryptionError('Malformed v2 payload: unexpected salt, iv or mac length.');
        }
        const keys = this.deriveKeys(passphrase, salt);
        const expectedMac = hmac(sha256, keys.mac, utf8ToBytes(`${saltPart}.${ivPart}.${cipherPart}`));
        if (!constantTimeEquals(expectedMac, mac)) {
            throw new IntegrityError('The stored value failed its integrity check. It was tampered with, or it was encrypted with a different secret.');
        }
        if (ciphertext.length === 0 || ciphertext.length % AES_BLOCK_BYTES !== 0) {
            throw new DecryptionError('Malformed v2 payload: invalid ciphertext length.');
        }
        try {
            return UTF8_DECODER.decode(cbc(keys.encryption, iv).decrypt(ciphertext));
        }
        catch (error) {
            throw new DecryptionError('Unable to decrypt the stored value.', { cause: error });
        }
    }
    /**
     * Historical format: the OpenSSL `Salted__` envelope with a random 8 byte salt and keys
     * derived through EVP_BytesToKey (MD5). Kept only to read data written by
     * ng-cryptostore <= 21.0.x (and to write it when `encryption.format` is set to `'legacy'`).
     */
    encryptLegacy(plainText, passphrase) {
        const salt = randomBytes(LEGACY_SALT_BYTES);
        const { key, iv } = evpBytesToKey(passphrase, salt);
        const ciphertext = cbc(key, iv).encrypt(utf8ToBytes(plainText));
        return bytesToBase64(concatBytes(utf8ToBytes(LEGACY_MAGIC), salt, ciphertext));
    }
    decryptLegacy(payload, passphrase) {
        try {
            const envelope = base64ToBytes(payload);
            const magic = utf8ToBytes(LEGACY_MAGIC);
            const minimumLength = magic.length + LEGACY_SALT_BYTES + AES_BLOCK_BYTES;
            if (envelope.length < minimumLength || !magic.every((byte, index) => envelope[index] === byte)) {
                throw new Error('Missing OpenSSL Salted__ envelope.');
            }
            const { key, iv } = evpBytesToKey(passphrase, envelope.subarray(magic.length, magic.length + LEGACY_SALT_BYTES));
            return UTF8_DECODER.decode(cbc(key, iv).decrypt(envelope.subarray(magic.length + LEGACY_SALT_BYTES)));
        }
        catch (error) {
            throw new DecryptionError('Unable to decrypt the stored value (legacy format).', { cause: error });
        }
    }
    deriveKeys(passphrase, salt) {
        const material = pbkdf2(sha256, utf8ToBytes(passphrase), salt, {
            c: this.iterations,
            dkLen: ENCRYPTION_KEY_BYTES + MAC_KEY_BYTES
        });
        return {
            encryption: material.subarray(0, ENCRYPTION_KEY_BYTES),
            mac: material.subarray(ENCRYPTION_KEY_BYTES)
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CryptoService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CryptoService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: CryptoService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * OpenSSL-compatible key derivation of the legacy format:
 * `D_i = MD5(D_{i-1} || passphrase || salt)`, concatenated until key and iv are covered.
 */
function evpBytesToKey(passphrase, salt) {
    const passphraseBytes = utf8ToBytes(passphrase);
    const material = new Uint8Array(ENCRYPTION_KEY_BYTES + IV_BYTES);
    let previous = new Uint8Array(0);
    let offset = 0;
    while (offset < material.length) {
        previous = md5(concatBytes(previous, passphraseBytes, salt));
        material.set(previous, offset);
        offset += previous.length;
    }
    return { key: material.subarray(0, ENCRYPTION_KEY_BYTES), iv: material.subarray(ENCRYPTION_KEY_BYTES) };
}
function toBase64Url(bytes) {
    return bytesToBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function fromBase64Url(value) {
    return base64ToBytes(value.replaceAll('-', '+').replaceAll('_', '/'));
}
function bytesToBase64(bytes) {
    let binary = '';
    for (let index = 0; index < bytes.length; index += BINARY_CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(index, index + BINARY_CHUNK));
    }
    return btoa(binary);
}
function base64ToBytes(value) {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}
/** Compares two byte arrays without leaking their difference position through timing. */
function constantTimeEquals(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let index = 0; index < a.length; index++) {
        diff |= a[index] ^ b[index];
    }
    return diff === 0;
}

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
class StorageService {
    constructor() {
        this.adapter = inject(STORAGE_ADAPTER);
        this.crypto = inject(CryptoService);
        this.config = inject(STORAGE_CONFIG);
        this.prefix = this.config.keyPrefix ?? '';
        this.cacheEnabled = this.config.cache !== false;
        this.plaintextCache = new Map();
        this.syncAdapter = this.adapter.isAsync ? null : this.adapter;
        this.asyncAdapter = this.adapter.isAsync ? this.adapter : null;
        if (this.cacheEnabled && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            const onStorage = (event) => this.handleStorageEvent(event);
            window.addEventListener('storage', onStorage);
            inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
        }
    }
    /** Backend currently in use. */
    get storageType() {
        return this.adapter.kind;
    }
    /** `true` when the backend is asynchronous (IndexedDB or a custom async adapter). */
    get isAsyncStorage() {
        return this.adapter.isAsync;
    }
    /**
     * Encrypts and stores a value.
     *
     * ```ts
     * await store.set('fruits', [{ name: 'fraise', icons: '🍓' }]);
     * await store.set('session', user, 'my-own-secret');
     * ```
     */
    async set(name, data, secret) {
        const key = this.toKey(name);
        const effectiveSecret = this.toSecret(secret);
        const json = encodeJson(data);
        const payload = this.crypto.encryptString(json, effectiveSecret);
        if (this.asyncAdapter) {
            await this.asyncAdapter.setItem(key, payload);
        }
        else {
            this.syncAdapter?.setItem(key, payload);
        }
        if (this.cacheEnabled) {
            this.plaintextCache.set(this.cacheKey(key, effectiveSecret), json);
        }
    }
    /**
     * Reads and decrypts a value (synchronous backends only).
     *
     * Returns `''` when the key does not exist and throws {@link DecryptionError} when the
     * payload cannot be decrypted (wrong secret) or was tampered with.
     */
    get(name, secret) {
        const adapter = this.requireSync('get');
        const key = this.toKey(name);
        const payload = this.normalizePayload(adapter.getItem(key));
        if (payload === null)
            return '';
        return this.decode(key, payload, this.toSecret(secret));
    }
    /** Asynchronous counterpart of {@link get}, required for asynchronous backends. */
    async asyncGet(name, secret) {
        const key = this.toKey(name);
        const payload = this.normalizePayload(await this.adapter.getItem(key));
        if (payload === null)
            return '';
        return this.decode(key, payload, this.toSecret(secret));
    }
    /** Returns the raw encrypted payload (synchronous backends only). `''` when missing. */
    getEncrypted(name) {
        const adapter = this.requireSync('getEncrypted');
        return this.normalizePayload(adapter.getItem(this.toKey(name))) ?? '';
    }
    /** Asynchronous counterpart of {@link getEncrypted}. */
    async asyncGetEncrypted(name) {
        return this.normalizePayload(await this.adapter.getItem(this.toKey(name))) ?? '';
    }
    /** `true` when a (non empty) value exists for `name` (synchronous backends only). */
    check(name) {
        const adapter = this.requireSync('check');
        return this.normalizePayload(adapter.getItem(this.toKey(name))) !== null;
    }
    /** Asynchronous counterpart of {@link check}. */
    async asyncCheck(name) {
        return this.normalizePayload(await this.adapter.getItem(this.toKey(name))) !== null;
    }
    /** Removes one entry. */
    async remove(name) {
        const key = this.toKey(name);
        if (this.asyncAdapter) {
            await this.asyncAdapter.removeItem(key);
        }
        else {
            this.syncAdapter?.removeItem(key);
        }
        this.invalidateKey(key);
    }
    /** Removes every entry owned by the configured backend (respecting `keyPrefix` when set). */
    async clearAll() {
        if (this.asyncAdapter) {
            await this.asyncAdapter.clear();
        }
        else {
            this.syncAdapter?.clear();
        }
        this.plaintextCache.clear();
    }
    /** Names of the entries currently stored (the configured `keyPrefix` is stripped). */
    async keys() {
        const allKeys = await this.adapter.keys();
        if (!this.prefix)
            return allKeys;
        return allKeys
            .filter((key) => key.startsWith(this.prefix))
            .map((key) => key.slice(this.prefix.length));
    }
    /**
     * Decrypts a value and measures its size: character count for strings, item count for
     * arrays / maps / sets, own key count for plain objects. `0` for primitives.
     */
    async getItemLength(name, secret) {
        return measureLength(await this.asyncGet(name, secret));
    }
    /** Encrypts any value without storing it. */
    async crypt(data, secret) {
        return this.crypto.encrypt(data, this.toSecret(secret));
    }
    /** Decrypts any payload produced by {@link crypt} or {@link getEncrypted}. */
    async decrypt(payload, secret) {
        if (!payload)
            return '';
        return this.crypto.decrypt(payload, this.toSecret(secret));
    }
    // ---------------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------------
    requireSync(method) {
        const adapter = this.syncAdapter;
        if (!adapter) {
            throw new AsyncStorageError(method, this.adapter.kind);
        }
        return adapter;
    }
    decode(key, payload, secret) {
        const cacheKey = this.cacheKey(key, secret);
        let json = this.cacheEnabled ? this.plaintextCache.get(cacheKey) : undefined;
        if (json === undefined) {
            json = this.crypto.decryptString(payload, secret);
            if (this.cacheEnabled)
                this.plaintextCache.set(cacheKey, json);
        }
        try {
            return decodeJson(json);
        }
        catch (error) {
            this.plaintextCache.delete(cacheKey);
            throw new DecryptionError('The stored value is not valid JSON: wrong secret or corrupted data.', { cause: error });
        }
    }
    toKey(name) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError('The storage key must be a non-empty string.');
        }
        return this.prefix + name;
    }
    toSecret(secret) {
        return secret || this.config.secret || DEFAULT_SECRET;
    }
    cacheKey(storageKey, secret) {
        return `${storageKey}\u0000${secret}`;
    }
    invalidateKey(storageKey) {
        const marker = `${storageKey}\u0000`;
        for (const key of Array.from(this.plaintextCache.keys())) {
            if (key.startsWith(marker))
                this.plaintextCache.delete(key);
        }
    }
    normalizePayload(value) {
        return value === null || value === undefined || value.length === 0 ? null : value;
    }
    /** Another tab changed the storage: drop the affected decrypted values. */
    handleStorageEvent(event) {
        if (event.key === null) {
            this.plaintextCache.clear();
            return;
        }
        if (this.prefix && !event.key.startsWith(this.prefix))
            return;
        this.invalidateKey(event.key);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
function measureLength(data) {
    if (data === null || data === undefined || data === '')
        return 0;
    if (typeof data === 'string' || Array.isArray(data))
        return data.length;
    if (data instanceof Map || data instanceof Set)
        return data.size;
    if (ArrayBuffer.isView(data))
        return data.byteLength;
    if (typeof data === 'object')
        return Object.keys(data).length;
    return 0;
}

const STORAGE_TYPES = ['localStorage', 'sessionStorage', 'IndexedDB', 'cookies', 'memory'];
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
function provideNgCryptoStore(config = { storageType: 'localStorage' }) {
    validateConfig(config);
    return makeEnvironmentProviders([{ provide: STORAGE_CONFIG, useValue: { ...config } }]);
}
/**
 * @deprecated Use `provideNgCryptoStore()` instead. This module is kept for backward compatibility.
 */
class StorageModule {
    constructor(parentModule) {
        if (parentModule) {
            throw new Error('StorageModule is already loaded. Import it in the AppModule only');
        }
    }
    /**
     * @deprecated Use `provideNgCryptoStore()` instead.
     */
    static withConfig(config) {
        validateConfig(config);
        return {
            ngModule: StorageModule,
            providers: [{ provide: STORAGE_CONFIG, useValue: { ...config } }]
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageModule, deps: [{ token: StorageModule, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "21.2.4", ngImport: i0, type: StorageModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.4", ngImport: i0, type: StorageModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: []
                }]
        }], ctorParameters: () => [{ type: StorageModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }] });
function validateConfig(config) {
    const storageType = config?.storageType;
    if (typeof storageType !== 'string' || !STORAGE_TYPES.includes(storageType)) {
        throw new UnsupportedStorageTypeError(storageType);
    }
    const iterations = config.encryption?.iterations;
    if (iterations !== undefined && (!Number.isFinite(iterations) || iterations < 1)) {
        throw new NgCryptoStoreError(`"encryption.iterations" must be a positive number, received "${String(iterations)}".`);
    }
}

/*
 * Public API Surface of ng-cryptostore
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AsyncStorageError, CookieLimitError, CookieService, CryptoService, DEFAULT_SECRET, DEFAULT_STORAGE_CONFIG, DecryptionError, IndexedDBService, IntegrityError, MemoryStorageAdapter, NgCryptoStoreError, STORAGE_ADAPTER, STORAGE_CONFIG, StorageModule, StorageService, StorageUnavailableError, StorageWriteError, UnsupportedStorageTypeError, WebStorageAdapter, decodeJson, encodeJson, provideNgCryptoStore };
//# sourceMappingURL=ng-cryptostore.mjs.map
