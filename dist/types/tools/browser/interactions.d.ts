import type { ElementHandle, KeyInput, MouseButton, Page } from "puppeteer-core";
/** Options accepted by coordinate-based mouse clicks. */
export interface ClickAtOptions {
    /** Mouse button to press. */
    button?: MouseButton;
    /** Number of clicks to dispatch. */
    clickCount?: number;
}
/** Options accepted by pointer movement. */
export interface MouseMoveOptions {
    /** Number of intermediate movement events. */
    steps?: number;
}
/** Options accepted by mouse button transitions. */
export interface MouseButtonOptions {
    /** Mouse button to press or release. */
    button?: MouseButton;
}
/** Options accepted by element highlighting. */
export interface HighlightOptions {
    /** Time to keep the highlight visible in milliseconds. */
    duration?: number;
}
/** Options accepted by element or page scrolling. */
export interface ScrollOptions {
    /** Scroll one matching element instead of the page. */
    selector?: string;
}
/** A browser element handle with omp's additional interaction methods. */
export type InteractionHandle = ElementHandle & {
    dblclick(): Promise<void>;
    check(): Promise<void>;
    uncheck(): Promise<void>;
    highlight(options?: HighlightOptions): Promise<void>;
};
type ActionabilityResult = {
    ok: true;
    x: number;
    y: number;
} | {
    ok: false;
    reason: string;
    coveredBy?: string;
};
/** Return a visible point relative to the element's box, or explain why it cannot receive a click. */
export declare function isClickActionable(handle: ElementHandle, signal?: AbortSignal): Promise<ActionabilityResult>;
/** Click an element only after verifying the dispatched point is not occluded. */
export declare function clickElement(handle: ElementHandle, label: string, signal?: AbortSignal, options?: ClickAtOptions): Promise<void>;
/**
 * Focus, clear any existing value, then retype.
 *
 * Every step is a DOM evaluation or an input dispatch, so this works on tabs
 * that produce no animation frames — unlike Puppeteer's `Locator.fill`, whose
 * viewport/stability/enabled preconditions wait on `requestAnimationFrame`
 * and `IntersectionObserver` callbacks that a backgrounded headless tab never
 * delivers (#12892).
 *
 * `type` overrides how the value is entered, for callers that need their own
 * abort-aware keyboard loop.
 */
export declare function fillViaHandle(handle: ElementHandle, value: string, signal?: AbortSignal, type?: (text: string) => Promise<unknown>): Promise<void>;
/** Resolve text-query matches to the first visible clickable candidate in document order. */
export declare function resolveActionableQueryHandlerClickTarget(handles: ElementHandle[]): Promise<ElementHandle | null>;
/** Click the actionable match chosen for a Puppeteer text query handler. */
export declare function clickQueryHandlerText(page: Page, selector: string, label: string, timeoutMs: number, signal?: AbortSignal): Promise<void>;
/** Set a native checkable control or ARIA switch to the requested state idempotently. */
export declare function setElementChecked(handle: ElementHandle, checked: boolean, label: string, signal?: AbortSignal): Promise<void>;
/** Draw a temporary inert outline around an element and remove it after the requested duration. */
export declare function highlightElement(handle: ElementHandle, options?: HighlightOptions, signal?: AbortSignal): Promise<void>;
/** Upload files through an input, native chooser trigger, or synthetic drop-zone event sequence. */
export declare function uploadFilesToElement(page: Page, handle: ElementHandle, absolutePaths: string[], label: string, signal?: AbortSignal): Promise<void>;
/** Press a keyboard key without releasing it. */
export declare function keyDown(page: Page, key: KeyInput, signal?: AbortSignal): Promise<void>;
/** Release a keyboard key previously pressed with keyDown. */
export declare function keyUp(page: Page, key: KeyInput, signal?: AbortSignal): Promise<void>;
/** Move the page pointer to viewport coordinates. */
export declare function mouseMove(page: Page, x: number, y: number, options?: MouseMoveOptions, signal?: AbortSignal): Promise<void>;
/** Press a mouse button at the current pointer position. */
export declare function mouseDown(page: Page, options?: MouseButtonOptions, signal?: AbortSignal): Promise<void>;
/** Release a mouse button at the current pointer position. */
export declare function mouseUp(page: Page, options?: MouseButtonOptions, signal?: AbortSignal): Promise<void>;
/** Click the page at viewport coordinates. */
export declare function clickAt(page: Page, x: number, y: number, options?: ClickAtOptions, signal?: AbortSignal): Promise<void>;
/** Queue one raw mouse-wheel event without waiting for scroll settlement. */
export declare function wheel(page: Page, deltaX: number, deltaY: number, signal?: AbortSignal): Promise<void>;
export {};
