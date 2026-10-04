import type { Page } from "puppeteer-core";
/** Maximum number of request records retained per tab; the oldest are evicted first. */
export declare const REQUEST_LOG_LIMIT = 200;
/** Maximum response-body bytes returned by `tab.request()` and embedded in HAR entries. */
export declare const RESPONSE_BODY_LIMIT_BYTES: number;
/** URL pattern accepted by persistent tab routes and request filters. */
export type NetworkPattern = string | RegExp;
/** Response/body behavior for one persistent tab route. */
export interface NetworkRouteOptions {
    /** Abort matching requests instead of continuing or fulfilling them. */
    abort?: boolean;
    /** Limit the route to one or more Puppeteer resource types. */
    resourceType?: string | string[];
    /** HTTP status used when fulfilling the request. */
    status?: number;
    /** Response headers used when fulfilling the request. */
    headers?: Record<string, string>;
    /** Response Content-Type used when fulfilling the request. */
    contentType?: string;
    /** Response body; objects are serialized as JSON. */
    body?: string | object;
    /** Delay in milliseconds before resolving the route. */
    delay?: number;
}
/** JSON-safe description of a registered persistent route. */
export interface NetworkRouteDescription {
    /** String glob or serialized regular expression. */
    pattern: string | {
        source: string;
        flags: string;
    };
    /** Route behavior. */
    options: NetworkRouteOptions;
}
/** Byte counts associated with one browser request. */
export interface NetworkRequestSizes {
    /** Encoded request body bytes, when present. */
    requestBody: number;
    /** Encoded response body bytes, when known. */
    responseBody?: number;
}
/** Bounded request-log record returned by tab.requests(). */
export interface NetworkRequestRecord {
    /** Stable request id accepted by tab.request(). */
    id: string;
    /** Monotonic per-tab request sequence. */
    seq: number;
    /** Request start time as Unix milliseconds. */
    ts: number;
    /** Uppercase HTTP method. */
    method: string;
    /** Requested URL. */
    url: string;
    /** Puppeteer resource type. */
    resourceType: string;
    /** HTTP response status, when a response arrived. */
    status?: number;
    /** Whether the HTTP response status was successful. */
    ok?: boolean;
    /** Network failure or policy-block reason. */
    failureText?: string;
    /** Elapsed request time in milliseconds. */
    durationMs?: number;
    /** Request headers. */
    requestHeaders: Record<string, string>;
    /** Response headers, when a response arrived. */
    responseHeaders?: Record<string, string>;
    /** Request and response byte counts. */
    sizes: NetworkRequestSizes;
}
/** Full request-log record returned by tab.request(). */
export interface NetworkRequestDetail extends NetworkRequestRecord {
    /** Lazily loaded response body as text or base64 bytes. */
    body?: string | {
        base64: string;
    };
    /** MIME type used to classify the response body. */
    contentType?: string;
    /** Whether the returned body was truncated to the 1 MiB cap. */
    bodyTruncated?: boolean;
}
/** Filters accepted by tab.requests(). */
export interface NetworkRequestsOptions {
    /** URL substring or regular expression. */
    filter?: NetworkPattern;
    /** Resource type or types to include. */
    type?: string | string[];
    /** HTTP method or methods to include. */
    method?: string | string[];
    /** Exact status, status class, or inclusive status range. */
    status?: number | string;
    /** Include requests started at or after this Unix-millisecond timestamp. */
    since?: number;
    /** Clear the bounded log after returning the selected records. */
    clear?: boolean;
    /** Maximum number of newest matching records to return. */
    limit?: number;
}
/** Body capture policy for a HAR recording. */
export type HarContentPolicy = "text" | "all" | "none";
/** A response body loaded on demand and capped to `RESPONSE_BODY_LIMIT_BYTES`. */
export interface NetworkResponseBody {
    /** UTF-8 text for textual content types, base64 bytes otherwise. */
    value: string | {
        base64: string;
    };
    /** Response Content-Type, `application/octet-stream` when absent. */
    contentType: string;
    /** Whether `value` was cut at the byte cap. */
    truncated: boolean;
    /** Full (uncapped) body size in bytes. */
    bytes: number;
    /** Whether `contentType` is textual per `isTextualContentType`. */
    isText: boolean;
}
/** Persistent per-tab routing, request logging, HAR capture, and host allowlisting. */
export declare class BrowserNetworkManager {
    #private;
    constructor(page: Page, allowedDomains?: readonly string[]);
    /** Install request/response observers and any required interception. */
    start(signal?: AbortSignal): Promise<void>;
    /** Remove observers and disable interception during tab teardown. */
    close(): Promise<void>;
    /** Whether routes or allowed domains require interception to remain enabled between runs. */
    hasPersistentInterception(): boolean;
    /** Restore the interception state after raw page interception used by one run. */
    restoreInterception(signal?: AbortSignal): Promise<void>;
    /** Register a persistent tab-level route. */
    route(pattern: NetworkPattern, options?: NetworkRouteOptions, signal?: AbortSignal): Promise<void>;
    /** Remove matching routes, or every route when pattern is omitted. */
    unroute(pattern?: NetworkPattern, signal?: AbortSignal): Promise<void>;
    /** Return JSON-safe descriptions of every registered route. */
    routes(): NetworkRouteDescription[];
    /** Query the bounded request log. */
    requests(options?: NetworkRequestsOptions): NetworkRequestRecord[];
    /** Load one request detail and its capped response body on demand. */
    request(id: string | number, signal?: AbortSignal): Promise<NetworkRequestDetail>;
    /** Clear all retained request records and response handles. */
    clearRequests(): void;
    /** Begin collecting subsequent request-log entries for a HAR file. */
    harStart(content?: HarContentPolicy): void;
    /** Finish the active HAR recording and write a HAR 1.2 file. */
    harStop(destination: string, signal?: AbortSignal): Promise<string>;
    /** Return the normalized hostname allowlist applied to this tab. */
    allowedDomains(): string[];
}
/**
 * Build one HAR 1.2 entry. `body` is ignored under the `"none"` policy and embedded only when the policy is
 * `"all"` or the body is textual; `statusText` is the response status text (or failure text, or `""`).
 */
export declare function buildHarEntry(record: NetworkRequestRecord, body: NetworkResponseBody | undefined, policy: HarContentPolicy, statusText: string): Record<string, unknown>;
/** Wrap HAR entries in the HAR 1.2 `{ log: { version, creator, pages, entries } }` document. */
export declare function buildHarLog(entries: Record<string, unknown>[]): object;
/** Validate and normalise an `allowed_domains` list (lowercase, no trailing dot, `*.suffix` wildcards, deduped). */
export declare function normalizeAllowedDomains(domains: readonly string[]): string[];
/** Validate `tab.route()` options and return a normalised copy (resource types stringified, headers copied). */
export declare function normalizeRouteOptions(options: NetworkRouteOptions): NetworkRouteOptions;
/** Deep-enough copy of route options for JSON-safe reporting. */
export declare function cloneRouteOptions(options: NetworkRouteOptions): NetworkRouteOptions;
/** Whether a route fulfills requests itself (any of status, headers, contentType or body set). */
export declare function routeFulfills(options: NetworkRouteOptions): boolean;
/** The fulfilled response for a route: status defaults to 200, object bodies become JSON with a JSON content type. */
export declare function routeResponse(options: NetworkRouteOptions): {
    status: number;
    headers?: Record<string, string>;
    contentType?: string;
    body?: string;
};
/** Reject empty glob strings and non-RegExp patterns, naming `label` (e.g. `tab.route`) in the error. */
export declare function validatePattern(pattern: NetworkPattern, label: string): void;
/** Whether two route patterns are identical (string equality, or same RegExp source and flags). */
export declare function samePattern(left: NetworkPattern, right: NetworkPattern): boolean;
/** Compile a URL glob (`*` within a path segment, `**` across segments) into an anchored RegExp. */
export declare function globToRegExp(glob: string): RegExp;
/** Whether a request record passes the `tab.requests()` filters (throws on an invalid status filter). */
export declare function matchesRequest(record: NetworkRequestRecord, options: NetworkRequestsOptions): boolean;
/** Validate the `tab.requests()` limit: `undefined` or a non-negative integer. */
export declare function normalizeLimit(limit: number | undefined): number | undefined;
/** A detached copy of the public fields of `record` (backend bookkeeping dropped). */
export declare function toPublicRecord(record: NetworkRequestRecord): NetworkRequestRecord;
/** Whether a Content-Type carries text (text/*, JSON, XML, JavaScript, form-encoded, SVG). */
export declare function isTextualContentType(contentType: string): boolean;
/** Case-insensitive header lookup. */
export declare function headerValue(headers: Record<string, string> | undefined, name: string): string | undefined;
