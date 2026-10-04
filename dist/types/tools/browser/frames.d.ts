import type { Frame, KeyInput, Page } from "puppeteer-core";
import { type AriaSnapshotOptions } from "./aria/aria-snapshot.js";
import { RunOutput } from "./run-output.js";
import type { ScreenshotResult, SessionSnapshot } from "./tab-protocol.js";
/** JSON-safe metadata for one document frame. */
export interface BrowserFrameInfo {
    /** DevTools frame identifier. */
    id: string;
    /** Frame name or element id. */
    name: string;
    /** Current frame URL. */
    url: string;
    /** Parent frame identifier, or null for the main frame. */
    parentId: string | null;
    /** Best-effort selector for the owning frame element. */
    selector?: string;
}
/** Options accepted by frame-scoped keyboard input. */
export interface FramePressOptions {
    /** Focus this selector before pressing the key. */
    selector?: string;
}
/** Options accepted by frame-scoped selector waits. */
export interface FrameWaitOptions {
    /** Maximum wait in milliseconds. */
    timeout?: number;
    /** Require a visible matching element. */
    visible?: boolean;
    /** Require the matching element to become hidden. */
    hidden?: boolean;
}
/** A frame-scoped helper object exposed by `tab.frame()`. */
export interface BrowserFrameApi {
    /** Click a matching element in this frame. */
    click(selector: string): Promise<void>;
    /** Replace a matching form control's value. */
    fill(selector: string, value: string): Promise<void>;
    /** Type text into a matching element. */
    type(selector: string, text: string): Promise<void>;
    /** Press a keyboard key, optionally after focusing an element. */
    press(key: KeyInput, options?: FramePressOptions): Promise<void>;
    /** Return a matching element's text content. */
    text(selector: string): Promise<string>;
    /** Return a matching element's inner HTML. */
    html(selector: string): Promise<string>;
    /** Return a matching form control's value. */
    value(selector: string): Promise<string>;
    /** Return a matching element attribute. */
    attr(selector: string, name: string): Promise<string | null>;
    /** Count matching elements. */
    count(selector: string): Promise<number>;
    /** Report whether a matching element is visible. */
    isVisible(selector: string): Promise<boolean>;
    /** Capture a Playwright-format ARIA snapshot inside this frame. */
    ariaSnapshot(selector?: string, options?: AriaSnapshotOptions): Promise<string>;
    /** Evaluate a function or expression in this frame. */
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    /** Wait for a selector and report whether it appeared. */
    waitFor(selector: string, options?: FrameWaitOptions): Promise<boolean>;
    /** Wait for a selector and report whether it appeared. */
    waitForSelector(selector: string, options?: FrameWaitOptions): Promise<boolean>;
    /** Capture a matching element inside this frame. */
    screenshot(selector: string): Promise<string>;
}
/** Per-operation guard supplied by the tab worker. */
export type FrameOperation = <T>(label: string, deadlineMs: number, operation: (signal: AbortSignal) => Promise<T>, selectorOptions?: {
    selector?: string;
    zeroMatchAfterMs?: number;
}) => Promise<T>;
/** Worker hooks needed to build a frame-scoped helper without coupling it to WorkerCore. */
export interface FrameApiHooks {
    /** Quick read deadline. */
    quickOpMs: number;
    /** Interactive action deadline. */
    actionOpMs: number;
    /** Zero-match fast-fail deadline. */
    zeroMatchAfterMs: number;
    /** Normalize a public selector for Puppeteer. */
    normalizeSelector(selector: string): string;
    /** Resolve an explicit wait timeout against the active cell budget. */
    waitMs(timeout?: number): number;
    /** Run a named, abort-aware operation. */
    op: FrameOperation;
    /** Persist and report a frame element screenshot. */
    captureScreenshot(frame: Frame, selector: string, signal: AbortSignal): Promise<string>;
}
/** List the page's current main and child frames with stable DevTools identifiers. */
export declare function listFrames(page: Page, signal?: AbortSignal): Promise<BrowserFrameInfo[]>;
/** Resolve a frame by owning-element selector, frame name, or exact frame URL. */
export declare function resolveFrame(page: Page, selectorOrNameOrUrl: string, normalizeSelector: (selector: string) => string, signal?: AbortSignal): Promise<Frame>;
/** Build the scoped operations for one already-resolved Puppeteer frame. */
export declare function createFrameApi(frame: Frame, hooks: FrameApiHooks): BrowserFrameApi;
/** Persist a frame-scoped element screenshot and emit the normal Eval image output. */
export declare function captureFrameScreenshot(frame: Frame, selector: string, signal: AbortSignal, normalizeSelector: (selector: string) => string, session: SessionSnapshot, output: RunOutput, screenshots: ScreenshotResult[]): Promise<string>;
