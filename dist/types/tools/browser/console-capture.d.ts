import type { Page } from "puppeteer-core";
/** Console levels accepted by the browser console query. */
export type BrowserConsoleLevel = "log" | "info" | "warn" | "error" | "debug";
/** Options for reading captured page console messages. */
export interface BrowserConsoleOptions {
    /** Return only messages at this console level. */
    level?: BrowserConsoleLevel;
    /** Return entries whose sequence is greater than this cursor. */
    since?: number;
    /** Clear the shared capture buffer after reading. */
    clear?: boolean;
    /** Maximum number of entries to return. */
    limit?: number;
}
/** Options for reading captured page errors and failed requests. */
export interface BrowserErrorOptions {
    /** Return entries whose sequence is greater than this cursor. */
    since?: number;
    /** Clear the shared capture buffer after reading. */
    clear?: boolean;
    /** Maximum number of entries to return. */
    limit?: number;
}
/** One captured page console message. */
export interface BrowserConsoleEntry {
    /** Monotonically increasing capture sequence. */
    seq: number;
    /** Capture time as Unix milliseconds. */
    ts: number;
    /** Captured entry kind. */
    type: "console";
    /** Console message level. */
    level: BrowserConsoleLevel;
    /** Browser-rendered console text. */
    text: string;
    /** Source URL, line, and column when Chromium reports them. */
    location?: string;
    /** Best-effort JSON-safe console arguments. */
    args: unknown[];
}
/** One captured uncaught exception or failed request. */
export interface BrowserErrorEntry {
    /** Monotonically increasing capture sequence. */
    seq: number;
    /** Capture time as Unix milliseconds. */
    ts: number;
    /** Captured error kind. */
    type: "pageerror" | "requestfailed";
    /** Error severity. */
    level: "error";
    /** Exception or failed-request description. */
    text: string;
    /** Source location or failed-request URL when available. */
    location?: string;
    /** Exception stack when available. */
    stack?: string;
}
/** Result of a bounded capture-buffer query. */
export interface BrowserCaptureResult<T> {
    /** Matching captured entries in sequence order. */
    entries: T[];
    /** Sequence cursor for a subsequent `since` query. */
    nextSeq: number;
    /** Entries evicted by bounded-buffer overflow since the last clear. */
    dropped: number;
}
/** Persistent bounded capture of page console messages, uncaught exceptions, and failed requests. */
export declare class PageConsoleCapture {
    #private;
    constructor(limit?: number);
    /** Sequence cursor immediately after the latest allocated capture entry. */
    get nextSequence(): number;
    /** Attach capture listeners to a page once. */
    install(page: Page): Promise<void>;
    /** Read captured console messages after an optional sequence cursor. */
    console(options?: BrowserConsoleOptions): Promise<BrowserCaptureResult<BrowserConsoleEntry>>;
    /** Read captured uncaught exceptions and failed requests after an optional sequence cursor. */
    errors(options?: BrowserErrorOptions): Promise<BrowserCaptureResult<BrowserErrorEntry>>;
    /** Count captured page errors and failed requests at or after a sequence cursor. */
    errorCountSince(sequence: number): number;
    /** Clear captured entries and the overflow counter while preserving sequence monotonicity. */
    clear(): void;
    /** Detach listeners and clear all captured state. */
    detach(): Promise<void>;
}
/** Page-side console capture hook used by the cmux backend. */
export declare const CMUX_CONSOLE_CAPTURE_SCRIPT: string;
