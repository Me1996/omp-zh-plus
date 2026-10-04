import type { HTMLElement } from "@oh-my-pi/pi-utils/dom";
import type { ElementHandle, Page } from "puppeteer-core";
import { type ElementQueryHelpers } from "./queries.js";
import { type InteractionHandle } from "./interactions.js";
import { type ScreenshotOptions } from "./screenshot.js";
import type { Transport } from "./tab-protocol.js";
declare module "puppeteer-core" {
    interface Frame {
        /** Puppeteer's main JavaScript realm, retained by our pinned runtime patch. */
        mainRealm(): Realm;
    }
    interface Realm {
        /** Re-home a DOM handle into this realm (`@internal` upstream, stripped from published types). */
        adoptHandle<T extends JSHandle>(handle: T): Promise<T>;
    }
    interface JSHandle {
        /** Realm that created this handle (`@internal` upstream, stripped from published types). */
        readonly realm: Realm;
    }
}
declare global {
    interface Element extends HTMLElement {
    }
    function getComputedStyle(element: Element): Record<string, unknown>;
    var innerWidth: number;
    var innerHeight: number;
    var document: {
        elementFromPoint(x: number, y: number): Element | null;
        readonly visibilityState: "visible" | "hidden";
    };
}
/** Queue a wheel event without treating a delayed renderer acknowledgement as dispatch failure. */
export declare function dispatchScroll(dispatch: () => Promise<void>, ackTimeoutMs?: number): Promise<void>;
export declare function normalizeSelector(selector: string): string;
/** ElementHandle enriched with omp's additional direct interaction and query methods. */
export type ActionableHandle = InteractionHandle & ElementQueryHelpers & {
    fill(value: string): Promise<void>;
};
/**
 * A named per-op guard: runs `fn` inside the active run's fail-fast deadline and
 * in-flight tracking (the same wrapper `tab.click(selector)` uses), so a stalled
 * handle action rejects with a named error before the cell budget instead of
 * hanging on puppeteer's protocol timeout.
 */
export type HandleOpGuard = <T>(label: string, fn: (signal: AbortSignal) => Promise<T>) => Promise<T>;
/**
 * Attach `fill()` to a puppeteer ElementHandle before handing it to user code and,
 * when a `guard` is supplied, route every interactive method ({@link GUARDED_HANDLE_METHODS})
 * through the same fail-fast per-op wrapper as the selector-based helpers — so
 * `(await tab.id(n)).click()` fails fast with `handle.click() timed out after …ms`
 * instead of stalling until the whole browser cell expires. Repeated enrichment is
 * idempotent: cached handles are always rewrapped from their original bound methods,
 * never from wrappers retaining an earlier run's guard. A timed-out action invalidates
 * and disposes its handle before surfacing the named error, so catching it cannot
 * dispatch a duplicate retry through the stale handle. Puppeteer handles expose
 * `type()` but no `fill()`; the `fill()` semantics mirror the selector-based
 * `tab.fill()`: focus, clear any existing value, then type.
 */
export declare function toActionableHandle(handle: ElementHandle, guard?: HandleOpGuard, invalidate?: () => Promise<void>): ActionableHandle;
/**
 * Hint appended to a selector op's fail-fast timeout, given the selector's current
 * match count: a missing element (consent wall, wrong page) reads differently from
 * a present-but-unactionable one.
 */
export declare function formatSelectorMatchHint(count: number): string;
export interface InflightOp {
    label: string;
    startedAt: number;
}
/** Human-readable label for a screenshot op, used in op tracking + timeout errors. */
export declare function describeScreenshot(opts?: ScreenshotOptions): string;
export declare function preparePageForScreenshot(page: Pick<Page, "bringToFront" | "evaluate">, signal: AbortSignal | undefined, activate: boolean): Promise<void>;
/** Summarize still-running helpers (oldest first) so a cell timeout names what stalled. */
export declare function describeInflight(inflight: Map<number, InflightOp>): string;
export declare class WorkerCore {
    #private;
    constructor(transport: Transport, isolated: boolean);
    nextElementId(): number;
    cacheElement(id: number, handle: ElementHandle): void;
}
