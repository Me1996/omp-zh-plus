import type { AriaSnapshotPayload } from "../aria/aria-snapshot.js";
import { type QueryBox } from "../queries.js";
import type { Observation } from "../tab-protocol.js";
import type { TernSelector } from "./selectors.js";
/** Action whose actionability `target()` checks; `point` only scrolls and requires visibility. */
export type TernTargetAction = "click" | "dblclick" | "hover" | "check" | "type" | "fill" | "focus" | "drag" | "upload" | "point";
/** Why `target()` could not produce an actionable point. */
export type TernTargetFailure = "missing" | "hidden" | "disabled" | "notEditable" | "unstable" | "covered" | "offViewport";
/** `target()` result: the point to press (viewport CSS px of the element's frame) or the failure reason. */
export type TernTarget = {
    ok: true;
    x: number;
    y: number;
    width: number;
    height: number;
    count: number;
} | {
    ok: false;
    reason: TernTargetFailure;
    count: number;
    detail?: string;
};
/** Value type of each `read()` property. */
export interface TernReadValues {
    /** Trimmed `innerText ?? textContent`. */
    text: string;
    /** `innerHTML`. */
    html: string;
    /** `outerHTML`. */
    outerHTML: string;
    /** Form value, or null when the element has none. */
    value: string | null;
    /** Attribute named by `arg`, or null when absent. */
    attr: string | null;
    /** Box in the frame's viewport, or null when zero-size. */
    box: QueryBox | null;
    /** Computed values of the properties in `arg` (default: `DEFAULT_STYLE_PROPERTIES`). */
    styles: Record<string, string>;
    /** Non-zero box and not `display:none` / `visibility:hidden|collapse`. */
    visible: boolean;
    /** Not `:disabled` and not `aria-disabled="true"`. */
    enabled: boolean;
    /** Native `checked`, else `aria-checked="true"`. */
    checked: boolean;
}
/** Property readable through `read()`. */
export type TernReadProp = keyof TernReadValues;
/** File passed to `setFiles()`; `data` is base64. */
export interface TernFilePayload {
    name: string;
    type: string;
    data: string;
}
/** Options for `observe()`; `root` scopes the walk to one element. */
export interface TernObserveOptions {
    includeAll?: boolean;
    viewportOnly?: boolean;
    root?: TernSelector;
    compact?: boolean;
}
/** `observe()` result; ids populate the document's `id` selector registry. */
export type TernObservation = Observation;
/** Numbered screenshot overlay installed by `annotate()`; remove it with `removeOverlay(token)`. */
export interface TernAnnotation {
    token: string;
    boxes: Array<{
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}
/** One descendant frame reported by `frames()`; `path` is dot-joined indices into `window.frames`. */
export interface TernFrameInfo {
    path: string;
    name: string | null;
    id: string | null;
    src: string | null;
    url: string | null;
    sameOrigin: boolean;
}
/** Viewport metrics of the kit's frame. */
export interface TernGeometry {
    innerWidth: number;
    innerHeight: number;
    dpr: number;
    scrollX: number;
    scrollY: number;
    scrollWidth: number;
    scrollHeight: number;
}
/**
 * Methods of `globalThis.__ompTernKit`, called by omp from the isolated world as
 * `kit[method](...args)`. Every argument and result is JSON; failures throw `Error`s with
 * agent-readable messages (a missing element: `No element matches <JSON selector>`).
 */
export interface TernKitApi {
    /** Number of elements matching `sel`. */
    count(sel: TernSelector): number;
    /** Read one property of the first match; null when nothing matches. */
    read<P extends TernReadProp>(sel: TernSelector, prop: P, arg?: string | string[]): TernReadValues[P] | null;
    /** Scroll the first match into view and check actionability for `action`. */
    target(sel: TernSelector, action: TernTargetAction): Promise<TernTarget>;
    /** Focus the first match without scrolling. */
    focus(sel: TernSelector): void;
    /**
     * Prepare a fill: text-like controls are focused with their content selected (`insert`: omp types
     * the value); selects and date/time/color/range inputs are set directly (`done`).
     */
    prepareFill(sel: TernSelector, value: string): {
        mode: "insert";
    } | {
        mode: "done";
    };
    /** Focus the first match and collapse the selection to the end of its content. */
    caretToEnd(sel: TernSelector): void;
    /** Checked state of a checkbox, radio, or ARIA checkbox/radio/switch. */
    checkState(sel: TernSelector): {
        checked: boolean;
    };
    /** Select `<select>` options by value, then label; returns the selected values. */
    select(sel: TernSelector, values: string[]): string[];
    /** Assign files to a file input, or drop them on any other element. */
    setFiles(sel: TernSelector, files: TernFilePayload[]): void;
    /** Whether the first match is a file input or a `<label>` whose control is one. */
    isFileInput(sel: TernSelector): boolean;
    /** Open the native chooser of the first match's file input (`"input"`), or `"none"` when it has none. */
    openChooser(sel: TernSelector): "input" | "none";
    /** Scroll the first match to the viewport centre. */
    scrollIntoView(sel: TernSelector): void;
    /** Scroll the first match (or the window when `sel` is null) by `dx`/`dy` CSS px. */
    scrollBy(sel: TernSelector | null, dx: number, dy: number): void;
    /** Draw the highlight outline around the first match; remove it with `removeOverlay(id)`. */
    highlight(sel: TernSelector, id: string): void;
    /** Remove a highlight or annotation overlay. */
    removeOverlay(id: string): void;
    /** List elements like the Chromium AX-tree observe; replaces the `id` registry. */
    observe(opts: TernObserveOptions): TernObservation;
    /** Playwright ARIA snapshot of `root` (or the document); refs resolve through `ariaRef` selectors. */
    ariaSnapshot(root: TernSelector | null, request: {
        depth?: number;
        boxes?: boolean;
    }, urls: boolean): AriaSnapshotPayload;
    /** Install numbered overlays over connected, non-empty registry ids. */
    annotate(ids: number[]): TernAnnotation;
    /** Tag the first match with a fresh handle token (null when missing). */
    mark(sel: TernSelector): string | null;
    /** Tag every match with a fresh handle token each, in document order. */
    markAll(sel: TernSelector): string[];
    /** Drop a handle token. */
    unmark(token: string): void;
    /** Every descendant frame reachable through `window.frames`. */
    frames(): TernFrameInfo[];
    /** Frame path (relative to this document) of the matched `<iframe>`/`<frame>`, or null. */
    frameOf(sel: TernSelector): string | null;
    /**
     * Viewport position of the content box hosting `window.frames[index]`, or null; throws when
     * the frame element or an ancestor is scaled, rotated or skewed (points inside cannot be mapped).
     */
    frameOrigin(index: number): {
        x: number;
        y: number;
    } | null;
    /** Whether body text (or `root`'s text) contains — or with `exact`, equals — `text` after trimming. */
    hasText(text: string, root: TernSelector | null, exact: boolean): boolean;
    /** Viewport and scroll metrics. */
    geometry(): TernGeometry;
    /** Whether the deep active element is editable. */
    activeEditable(): boolean;
}
/**
 * Script (valid both as a top-level classic script and as a function body) that installs the kit as
 * `globalThis.__ompTernKit` in the current realm if absent and, in a child frame, registers the frame's
 * index path (`"0"`, `"1.0"`, …) via `webkit.messageHandlers.stencilFrame`. Idempotent. Embeds a private
 * instance of the Playwright ARIA bundle and the Chromium semantic query handlers; defines no other
 * globals and uses nothing CSP-gated.
 */
export declare const TERN_KIT_SOURCE: string;
