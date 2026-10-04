import type { Page } from "puppeteer-core";
declare module "puppeteer-core" {
    interface Frame {
        /** Puppeteer's page-main JavaScript realm, retained by omp's pinned runtime patch. */
        mainRealm(): Realm;
    }
}
/** Global property under which `installWebMcpPageHook` stores its page bridge. */
export declare const WEBMCP_BRIDGE_KEY = "__ompWebMcpBridge_v1";
/** Filters for WebMCP tool discovery. */
export interface WebMcpListOptions {
    /** Return full metadata only for tools with this exact name. */
    name?: string;
    /** Restrict discovery to one frame id. */
    frame?: string;
}
/** Options for invoking a WebMCP tool. */
export interface WebMcpInvokeOptions {
    /** Restrict invocation to one frame id. */
    frame?: string;
    /** Invocation timeout in milliseconds. */
    timeout?: number;
}
/** Options for reading the WebMCP catalog change log. */
export interface WebMcpEventsOptions {
    /** Return events whose sequence is greater than this cursor. */
    since?: number;
    /** Clear retained events after reading them. */
    clear?: boolean;
}
/** One untrusted page-provided WebMCP tool description. */
export interface WebMcpToolRecord {
    /** Page-defined tool name. */
    name: string;
    /** Page-defined tool description. */
    description: string;
    /** CDP identifier of the frame that owns the tool. */
    frameId: string;
    /** Origin of the owning frame. */
    origin: string;
    /** Page-defined JSON Schema, included only for exact-name discovery. */
    inputSchema?: unknown;
    /** Page-defined tool annotations, included only for exact-name discovery. */
    annotations?: unknown;
    /** Marks every page-provided field as untrusted content. */
    untrusted: true;
}
/** WebMCP discovery result. */
export interface WebMcpListResult {
    /** Whether native CDP or the page-side registration mirror is available. */
    status: "ready" | "unavailable";
    /** Matching page-provided tools. */
    tools: WebMcpToolRecord[];
    /** Whether the bounded summary omitted or shortened metadata. */
    truncated: boolean;
    /** Explanation when no native or mirrored catalog is available. */
    reason?: string;
    /** Marks every page-provided field as untrusted content. */
    untrusted: true;
}
/** Successful WebMCP invocation result. */
export interface WebMcpInvokeSuccess {
    /** Indicates successful page-tool execution. */
    ok: true;
    /** JSON-cloneable page-provided result. */
    result: unknown;
    /** Whether an oversized page result was represented by a preview. */
    truncated?: boolean;
    /** Original encoded result size when truncated. */
    originalBytes?: number;
    /** Marks the page-provided result as untrusted content. */
    untrusted: true;
}
/** Failed WebMCP invocation result. */
export interface WebMcpInvokeFailure {
    /** Indicates failed page-tool execution. */
    ok: false;
    /** Delimited page-provided or invocation error text. */
    error: string;
    /** Marks the error text as untrusted content. */
    untrusted: true;
}
/** Result of invoking one page-provided WebMCP tool. */
export type WebMcpInvokeResult = WebMcpInvokeSuccess | WebMcpInvokeFailure;
/** One catalog transition observed while polling WebMCP state. */
export interface WebMcpCatalogEvent {
    /** Monotonic per-tab event sequence. */
    sequence: number;
    /** Catalog transition kind. */
    type: "registered" | "updated" | "unregistered";
    /** Page-defined tool name. */
    name: string;
    /** CDP identifier of the owning frame. */
    frameId: string;
    /** Origin of the owning frame. */
    origin: string;
    /** Host timestamp when polling observed the transition. */
    timestamp: number;
    /** Marks page-provided event fields as untrusted content. */
    untrusted: true;
}
/** WebMCP catalog events newer than the requested cursor. */
export interface WebMcpEventsResult {
    /** Matching catalog transitions. */
    events: WebMcpCatalogEvent[];
    /** Latest per-tab event sequence. */
    cursor: number;
    /** Whether older retained events were omitted. */
    truncated: boolean;
    /** Marks page-provided event fields as untrusted content. */
    untrusted: true;
}
/** One tool registration mirrored by the page hook. */
export interface WebMcpHookToolRecord {
    /** Page-defined tool name. */
    name: string;
    /** Page-defined description, `""` when absent. */
    description: string;
    /** JSON clone of the page-defined input schema. */
    inputSchema?: unknown;
    /** JSON clone of the page-defined annotations. */
    annotations?: unknown;
}
/** Page-hook state of one frame, as returned by `webMcpSnapshotInPage`. */
export interface WebMcpHookSnapshot {
    /** Whether the page exposed a native `modelContext` before the hook installed. */
    nativeAvailable: boolean;
    /** Mirrored tool registrations, sorted by name. */
    tools: WebMcpHookToolRecord[];
    /** `location.origin` of the frame. */
    origin: string;
}
/** Page-hook invocation outcome, as returned by `webMcpInvokeInPage`. */
export interface WebMcpHookInvokeEnvelope {
    /** Whether the page tool completed without throwing. */
    ok: boolean;
    /** JSON encoding of the tool result (`null` for `undefined`) when `ok`. */
    encoded?: string;
    /** Error text when not `ok`. */
    error?: string;
}
/** Outcome of executing one native (non page-hook) WebMCP tool. */
export type WebMcpNativeToolResult = {
    ok: true;
    output: unknown;
} | {
    ok: false;
    error: string;
};
/** One frame whose page hook can be snapshotted and invoked. */
export interface WebMcpFrameTarget {
    /** Stable frame identifier reported as `frameId`. */
    readonly id: string;
    /** Read the frame's page-hook state. */
    snapshot(): Promise<WebMcpHookSnapshot>;
    /** Invoke a mirrored page tool with JSON-cloned params. */
    invoke(name: string, params: unknown): Promise<WebMcpHookInvokeEnvelope>;
}
/** One tool reported by a native WebMCP implementation (Chromium CDP). */
export interface WebMcpNativeToolEntry {
    /** Page-defined tool name. */
    readonly name: string;
    /** Page-defined tool description. */
    readonly description: string;
    /** Page-defined JSON Schema. */
    readonly inputSchema?: unknown;
    /** Page-defined tool annotations. */
    readonly annotations?: unknown;
    /** Identifier of the owning frame. */
    readonly frameId: string;
    /** Origin of the owning frame. */
    readonly origin: string;
    /** Execute the tool with JSON-cloned params. */
    execute(params: object): Promise<WebMcpNativeToolResult>;
}
/** Where a controller finds frames (and, for Chromium, native CDP tools). */
export interface WebMcpHost {
    /** Frames whose page hook should be polled. */
    frames(): Promise<WebMcpFrameTarget[]>;
    /** Natively registered tools; consulted only once native support is known. */
    nativeTools(): readonly WebMcpNativeToolEntry[];
    /** Remove the preload and uninstall the page hook from every frame. */
    dispose(): Promise<void>;
}
/** Construction options for `WebMcpController`. */
export interface WebMcpControllerOptions {
    /** Whether native WebMCP was detected at install time. */
    nativeSupported: boolean;
    /** `reason` reported while no native support or page registrations exist; defaults to the Chromium wording. */
    unavailableReason?: string;
}
/**
 * Page function (self-contained; serialisable via `.toString()`): mirror `navigator/document.modelContext`
 * registrations into a bridge stored at `globalThis[key]`, polyfilling `modelContext` when absent. Idempotent.
 */
export declare function installWebMcpPageHook(key: string): void;
/** Page function (self-contained): read the bridge at `globalThis[key]` into a `WebMcpHookSnapshot`. */
export declare function webMcpSnapshotInPage(key: string): WebMcpHookSnapshot;
/** Page function (self-contained): invoke mirrored tool `name` through the bridge at `globalThis[key]`. */
export declare function webMcpInvokeInPage(key: string, name: string, params: unknown): Promise<WebMcpHookInvokeEnvelope>;
/** Page function (self-contained): restore wrapped page APIs and delete the bridge at `globalThis[key]`. */
export declare function uninstallWebMcpPageHook(key: string): void;
/** Per-tab WebMCP discovery, invocation, and catalog-event controller. */
export declare class WebMcpController {
    #private;
    constructor(host: WebMcpHost, options: WebMcpControllerOptions);
    /** Discover page-provided tools, omitting schemas unless an exact name is requested. */
    list(options?: WebMcpListOptions): Promise<WebMcpListResult>;
    /** Invoke one page-provided tool and return a bounded JSON-cloneable result. */
    invoke(name: string, params: unknown, options?: WebMcpInvokeOptions): Promise<WebMcpInvokeResult>;
    /** Poll catalog transitions observed since a prior cursor. */
    events(options?: WebMcpEventsOptions): Promise<WebMcpEventsResult>;
    /** Remove the preload and restore any page API method wrapped by this controller. */
    dispose(): Promise<void>;
}
/** Install the WebMCP preload before navigation and probe native CDP support. */
export declare function installWebMcp(page: Page): Promise<WebMcpController>;
