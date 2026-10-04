import type { CookieParam, Page } from "puppeteer-core";
/** Web Storage area exposed by the browser helpers. */
export type StorageKind = "local" | "session";
/** Cookie fields returned by tab.cookies() and persisted in storage state files. */
export interface BrowserCookie {
    /** Cookie name. */
    name: string;
    /** Cookie value. */
    value: string;
    /** Cookie domain. */
    domain: string;
    /** Cookie path. */
    path: string;
    /** Expiration time in Unix seconds, or -1 for a session cookie. */
    expires: number;
    /** Whether JavaScript is denied access to the cookie. */
    httpOnly: boolean;
    /** Whether the cookie is limited to secure transports. */
    secure: boolean;
    /** Effective SameSite policy. */
    sameSite: "Strict" | "Lax" | "None";
}
/** Cookie accepted by tab.setCookies(). */
export interface BrowserCookieInput {
    /** Cookie name. */
    name: string;
    /** Cookie value. */
    value: string;
    /** Cookie domain override. */
    domain?: string;
    /** Cookie path override. */
    path?: string;
    /** URL used to infer domain, path, and scheme. */
    url?: string;
    /** Expiration time in Unix seconds. */
    expires?: number;
    /** Deny JavaScript access to the cookie. */
    httpOnly?: boolean;
    /** Limit the cookie to secure transports. */
    secure?: boolean;
    /** Cookie SameSite policy. */
    sameSite?: "Strict" | "Lax" | "None";
}
/** Default domain or URL applied to imported cookie header entries. */
export interface CookieScope {
    /** Default domain for imported cookie pairs. */
    domain?: string;
    /** Default URL for imported cookie pairs. */
    url?: string;
}
/** Cookie lookup options. */
export interface CookieQueryOptions {
    /** URLs whose matching cookies should be returned. */
    urls?: string[];
}
/** Cookie deletion options. */
export interface ClearCookiesOptions {
    /** Cookie names to delete; omission deletes every current-page cookie. */
    names?: string[];
}
/** One origin's Web Storage entries in an omp storage state file. */
export interface StorageStateOrigin {
    /** Serialized origin. */
    origin: string;
    /** Local Storage pairs for the origin. */
    localStorage: Array<{
        name: string;
        value: string;
    }>;
    /** Session Storage pairs for the origin. */
    sessionStorage?: Array<{
        name: string;
        value: string;
    }>;
}
/** Playwright-compatible browser state with sessionStorage as an omp extension. */
export interface BrowserStorageState {
    /** Serialized browser cookies. */
    cookies: BrowserCookie[];
    /** Serialized per-origin Web Storage. */
    origins: StorageStateOrigin[];
}
/** Summary of origins restored or skipped by tab.loadState(). */
export interface LoadStateResult {
    /** Origins whose Web Storage was restored. */
    loadedOrigins: string[];
    /** Origins skipped because safe hidden navigation was unavailable or failed. */
    skippedOrigins: string[];
}
interface LoadStateOptions {
    allowOtherOrigins: boolean;
    navigationTimeoutMs: number;
    signal?: AbortSignal;
}
/** Parse `tab.setCookies()` arguments (objects, Cookie headers, cURL dumps, JSON arrays, trailing scope). */
export declare function normalizeCookieArguments(args: unknown[]): CookieParam[];
/** A Web Storage value as stored: strings verbatim, anything else JSON. */
export declare function storageValue(value: unknown): string;
/** The key/value pairs of a `tab.setStorage()` entries object. */
export declare function storageEntries(value: unknown): Array<[string, string]>;
/** Reject storage kinds other than `local`/`session`. */
export declare function assertStorageKind(kind: string): asserts kind is StorageKind;
/** Page function: the current origin's Web Storage, or null for an opaque origin. */
export declare function readOriginStorageInPage(): StorageStateOrigin | null;
/** Page function: replace the current origin's Web Storage with `state`. */
export declare function restoreOriginStorageInPage(state: StorageStateOrigin): void;
/** Page function: every pair of one storage area, or one key's value. */
export declare function readStorageInPage(area: StorageKind, key: string | undefined): Record<string, string> | string | null;
/** Page function: store `pairs` in one storage area. */
export declare function writeStorageInPage(area: StorageKind, pairs: Array<[string, string]>): void;
/** Page function: clear one storage area. */
export declare function clearStorageInPage(area: StorageKind): void;
/** Read cookies visible to the current page or the supplied URLs. */
export declare function readCookies(page: Page, options?: CookieQueryOptions, signal?: AbortSignal): Promise<BrowserCookie[]>;
/** Parse and install cookie objects, raw Cookie headers, cURL dumps, or JSON arrays. */
export declare function setPageCookies(page: Page, args: unknown[], signal?: AbortSignal): Promise<void>;
/** Delete all current-page cookies or only cookies with selected names. */
export declare function clearPageCookies(page: Page, options?: ClearCookiesOptions, signal?: AbortSignal): Promise<void>;
/** Read all Web Storage pairs or one selected value from the current origin. */
export declare function readStorage(page: Page, kind: string, options?: {
    key?: string;
}, signal?: AbortSignal): Promise<Record<string, string> | string | null>;
/** Set one Web Storage pair or a map of pairs on the current origin. */
export declare function setPageStorage(page: Page, kind: string, keyOrEntries: unknown, value: unknown, signal?: AbortSignal): Promise<void>;
/** Clear one Web Storage area on the current origin. */
export declare function clearPageStorage(page: Page, kind: string, signal?: AbortSignal): Promise<void>;
/** Where `tab.saveState()` writes: the requested path, else `~/.omp/browser-state/<tab>.json`. */
export declare function storageStatePath(tabName: string, requestedPath: string | undefined, cwd: string): string;
/** Save cookies and current-origin Web Storage to a Playwright-compatible state file. */
export declare function saveStorageState(page: Page, name: string, requestedPath: string | undefined, cwd: string, signal?: AbortSignal): Promise<string>;
/** Read and validate a saved browser state file. */
export declare function readStorageStateFile(requestedPath: string, cwd: string, signal?: AbortSignal): Promise<BrowserStorageState>;
/** Restore cookies and Web Storage from a saved browser state file. */
export declare function loadStorageState(page: Page, requestedPath: string, cwd: string, options: LoadStateOptions): Promise<LoadStateResult>;
export {};
