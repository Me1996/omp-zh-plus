import type { ElementHandle, Page } from "puppeteer-core";
import { type SnapshotPostProcessOptions } from "../snapshot-plus.js";
export interface AriaSnapshotOptions extends SnapshotPostProcessOptions {
    /** Maximum tree depth to render. */
    depth?: number;
    /** Append `[box=x,y,w,h]` bounding boxes to each node. */
    boxes?: boolean;
    /** Return a revisioned full, unchanged, or delta result. */
    diff?: boolean;
}
/** Raw snapshot text and resolved link destinations produced in a browser realm. */
export interface AriaSnapshotPayload {
    snapshot: string;
    hrefs: Record<string, string>;
}
/**
 * Capture a Playwright-format ARIA snapshot of `root` (or the whole document when
 * null). Always runs in `ai` mode so every node carries a `[ref=eN]` id; resolve
 * those to elements with {@link resolveAriaRefHandle}. Ids are renumbered from e1
 * on each call and remain valid until the next snapshot.
 */
export declare function captureAriaSnapshot(page: Page, root: ElementHandle | null, options?: AriaSnapshotOptions): Promise<string>;
/**
 * Resolve a `[ref=eN]` id from the latest snapshot to a live `ElementHandle`, or
 * null when the ref no longer matches any element. It uses the same isolated
 * world as capture, where that snapshot wrote its `_ariaRef` expandos.
 */
export declare function resolveAriaRefHandle(page: Page, ref: string): Promise<ElementHandle | null>;
/**
 * Playwright-only selector engines/pseudos no backend can parse. Without this guard a
 * `tab.click(":has-text(...)")` would wait the full action timeout and fail opaquely;
 * fail fast instead with a pointer to the supported alternative. Callers skip it for
 * explicit query-handler prefixes (`text/`, `aria/`, …) whose payload is literal text.
 */
export declare const PLAYWRIGHT_ONLY_SELECTOR_RE: RegExp;
/**
 * Guard the selector funnels: `tab.click`/`type`/`fill`/`waitFor*`/`scrollIntoView`
 * take string selectors only, but user `run` code routinely passes the ElementHandle
 * from `tab.id(n)`/`tab.ref(...)` (or an un-awaited Promise of one) straight in.
 * Without this the value reaches `.trim()`/`.startsWith()` and throws the opaque,
 * minified `A.trim is not a function` instead of a recovery-naming ToolError.
 */
export declare function assertSelectorString(selector: unknown): asserts selector is string;
/**
 * Recognize a snapshot-ref selector and return the bare ref id, else null.
 * Accepts `aria-ref=e5` (Playwright-MCP style), `aria-ref/e5`, `ariaref/e5`,
 * and bare `e5`/`@e5`: agents copy ids straight out of the snapshot YAML
 * (`[ref=e5]`), so `tab.click("e5")` must act on the ref instead of falling
 * through to a CSS tag selector that can never match. Bare ids are safe to
 * claim here — an eN tag name is not real HTML, and the tab-worker backend's
 * observe ids are numeric (`tab.id(7)`), so refs are its only eN namespace.
 * (The cmux backend parses selectors itself and routes bare `eN` to its own
 * observe ids; either way `eN` means "the id from the last page dump".)
 */
export declare function parseAriaRefSelector(selector: string): string | null;
/**
 * Build a self-contained expression script that runs the vendored bundle in the
 * page and returns the ARIA snapshot YAML. Used by the cmux backend, whose
 * `browser.eval` RPC takes a script string and returns the completion value (it
 * has no ElementHandle to pass in). The script resolves `selector` via
 * `document.querySelector` in-page (CSS selectors only) or falls back to the
 * whole document. Like the puppeteer path it installs nothing on `window`, but
 * cmux runs the expression in the page world and therefore has its own ref
 * namespace.
 */
export declare function buildAriaSnapshotScript(selector: string | undefined, options?: AriaSnapshotOptions): string;
/** Build the cmux page-world expression returning snapshot text plus link destinations. */
export declare function buildAriaSnapshotPayloadScript(selector: string | undefined, options?: AriaSnapshotOptions): string;
