import type { ElementHandle, Page } from "puppeteer-core";
/** Default computed-style properties returned by `tab.styles()`. */
export declare const DEFAULT_STYLE_PROPERTIES: readonly ["font-family", "font-size", "font-weight", "color", "background-color", "display", "visibility", "opacity", "position", "z-index", "width", "height", "margin", "padding"];
/** JSON-safe element bounds in page coordinates. */
export interface QueryBox {
    /** Left edge in CSS pixels. */
    x: number;
    /** Top edge in CSS pixels. */
    y: number;
    /** Element width in CSS pixels. */
    width: number;
    /** Element height in CSS pixels. */
    height: number;
}
/** Read-only helpers attached to browser element handles. */
export interface ElementQueryHelpers {
    /** Return this element's rendered text. */
    text(): Promise<string>;
    /** Return this element's inner HTML. */
    html(): Promise<string>;
    /** Return this form element's current value, or `null` when unsupported. */
    value(): Promise<string | null>;
    /** Return one attribute value, or `null` when absent. */
    attr(name: string): Promise<string | null>;
    /** Return selected computed styles. */
    styles(props?: string[]): Promise<Record<string, string>>;
    /** Report whether this element is enabled. */
    isEnabled(): Promise<boolean>;
    /** Report whether this element is checked. */
    isChecked(): Promise<boolean>;
}
/** Per-operation guard used to keep element query helpers abort-aware. */
export type ElementQueryGuard = <T>(label: string, fn: (signal: AbortSignal) => Promise<T>) => Promise<T>;
/** Return the first matching element's rendered text, or `null`. */
export declare function queryText(page: Page, selector: string, signal: AbortSignal): Promise<string | null>;
/** Return the first matching element's inner HTML, or `null`. */
export declare function queryHtml(page: Page, selector: string, signal: AbortSignal): Promise<string | null>;
/** Return the first matching form element's current value, or `null`. */
export declare function queryValue(page: Page, selector: string, signal: AbortSignal): Promise<string | null>;
/** Return an attribute from the first matching element, or `null`. */
export declare function queryAttribute(page: Page, selector: string, name: string, signal: AbortSignal): Promise<string | null>;
/** Count elements matching a selector. */
export declare function queryCount(page: Page, selector: string, signal: AbortSignal): Promise<number>;
/** Return the first matching element's bounds, or `null`. */
export declare function queryBox(page: Page, selector: string, signal: AbortSignal): Promise<QueryBox | null>;
/** Return computed styles for the first matching element, or `null`. */
export declare function queryStyles(page: Page, selector: string, props: string[] | undefined, signal: AbortSignal): Promise<Record<string, string> | null>;
/** Report whether the first matching element is visible. */
export declare function queryVisible(page: Page, selector: string, signal: AbortSignal): Promise<boolean>;
/** Report whether the first matching element is enabled. */
export declare function queryEnabled(page: Page, selector: string, signal: AbortSignal): Promise<boolean>;
/** Report whether the first matching element is checked. */
export declare function queryChecked(page: Page, selector: string, signal: AbortSignal): Promise<boolean>;
/** Attach browser-tool query methods to a Puppeteer element handle. */
export declare function enrichElementQueries<T extends ElementHandle>(handle: T, guard: ElementQueryGuard): T & ElementQueryHelpers;
/** Wait until text appears in the document body or a scoped element. */
export declare function waitForPageText(page: Page, text: string, opts: {
    timeout: number;
    selector?: string;
    exact?: boolean;
    signal: AbortSignal;
}): Promise<void>;
