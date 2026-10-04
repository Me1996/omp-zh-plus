import type { Browser, Page } from "puppeteer-core";
/** Completed download metadata returned by tab download helpers. */
export interface BrowserDownload {
    path: string;
    suggestedFilename: string;
    url: string;
    bytes: number;
}
/** Owns tab-scoped Chromium download behavior and completion events. */
export declare class DownloadManager {
    #private;
    constructor(browser: Browser, page: Page, tabId: string);
    /** Enable downloads into an absolute directory, replacing the previous destination. */
    enable(directory?: string): Promise<void>;
    /** Wait for the next unclaimed completed download. */
    wait(signal?: AbortSignal): Promise<BrowserDownload>;
    /** Return every completed download for this tab. */
    list(): BrowserDownload[];
    /** Detach event listeners and reject outstanding waits. */
    close(): Promise<void>;
}
