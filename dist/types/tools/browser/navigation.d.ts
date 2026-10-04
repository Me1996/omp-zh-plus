import type { Page } from "puppeteer-core";
/** Navigation lifecycle accepted by history traversal and reload helpers. */
export type NavigationWaitUntil = "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
/** Invoke `history.back()` inside a browser page. */
export declare function historyBackInPage(): void;
/** Invoke `history.forward()` inside a browser page. */
export declare function historyForwardInPage(): void;
/** Invoke `location.reload()` inside a browser page. */
export declare function reloadInPage(): void;
/** Read `location.href` inside a browser page. */
export declare function locationHrefInPage(): string;
/** Perform Next.js or History API navigation inside a browser page. */
export declare function pushStateInPage(destination: string): Promise<string>;
/** Navigate through session history and return the resulting page URL. */
export declare function traverseHistory(page: Page, direction: "back" | "forward", waitUntil: NavigationWaitUntil, timeout: number, signal?: AbortSignal): Promise<string>;
/** Reload the current document and return the resulting page URL. */
export declare function reloadPage(page: Page, waitUntil: NavigationWaitUntil, timeout: number, signal?: AbortSignal): Promise<string>;
/** Perform client-side navigation through Next.js when available, otherwise the History API. */
export declare function pushState(page: Page, url: string, signal?: AbortSignal): Promise<string>;
