/**
 * Page-world instrumentation for Tern tabs: console and uncaught-error
 * capture, a fetch/XHR observer with persistent routes, and the JS-visible
 * emulation overrides (geolocation, locale, offline) WKWebView has no native
 * switch for. It reports to omp through
 * `webkit.messageHandlers.stencil.postMessage(JSON)`; response bodies stay in
 * the page (the last 200) until omp asks for one.
 *
 * Everything here runs in the page's own world, so pages can see (and
 * tamper with) the wrappers — the price of observing page-world `fetch`.
 * Navigations and subresources (images, scripts, styles, frames) are not
 * observable or routable from page script; omp adds navigation responses
 * from Tern's `response` events.
 */
/** A persistent route as the page applies it. */
export interface TernRouteRule {
    /** URL regular expression source. */
    source: string;
    /** Its flags. */
    flags: string;
    /** Only these resource types (`fetch`, `xhr`). */
    resourceTypes?: string[];
    /** Fail matching requests. */
    abort?: boolean;
    /** Delay before answering, in ms. */
    delay?: number;
    /** Answer with this response instead of the network. */
    fulfill?: {
        status: number;
        headers?: Record<string, string>;
        contentType?: string;
        body?: string;
    };
}
/** JS-visible emulation overrides applied in the page world. */
export interface TernPageEmulation {
    /** `navigator.geolocation` answers these coordinates. */
    geolocation?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    };
    /** `navigator.language(s)` and `Intl`/`toLocale*` defaults use this locale. */
    locale?: string;
    /** `navigator.onLine` is false and fetch/XHR fail. */
    offline?: boolean;
}
/** Configuration of the page-world capture script. */
export interface TernCaptureConfig {
    /** Persistent routes, in registration order (first match wins). */
    routes: TernRouteRule[];
    /** Emulation overrides. */
    emulation: TernPageEmulation;
}
/** Name of the page-world global holding the capture state. */
export declare const TERN_CAPTURE_GLOBAL = "__ompTernCapture";
/**
 * Source of a page function `(config) => void` that installs the capture in
 * the current document (first call) or swaps its configuration (later
 * calls). No `eval`: page CSP never applies to it.
 */
export declare const TERN_CAPTURE_INSTALLER: string;
/** The document-start script installing the capture with `config` in every new document. */
export declare function ternCaptureScript(config: TernCaptureConfig): string;
