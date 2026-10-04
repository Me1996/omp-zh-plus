import type { Page } from "puppeteer-core";
/** Options for starting a Chromium performance trace. */
export interface BrowserTraceStartOptions {
    /** Include screenshots in the trace. */
    screenshots?: boolean;
    /** Override the Chromium trace category list. */
    categories?: string[];
}
/** Options for saving a completed Chromium performance trace. */
export interface BrowserTraceStopOptions {
    /** Absolute or cwd-relative destination path. */
    path?: string;
}
/** Options for saving a completed Chromium CPU profile. */
export interface BrowserProfileStopOptions {
    /** Absolute or cwd-relative destination path. */
    path?: string;
}
/** Browser page metrics augmented with navigation-relative lifecycle durations. */
export interface BrowserMetrics {
    /** Named Chromium or lifecycle metric. */
    [name: string]: number;
    /** Milliseconds from navigation start through DOMContentLoaded. */
    domContentLoaded: number;
    /** Milliseconds from navigation start through load. */
    load: number;
}
/** Stateful trace and CPU-profile controller for one Puppeteer page. */
export declare class BrowserTracingController {
    #private;
    constructor(page: Page);
    /** Start Chromium tracing for this page's browser connection. */
    traceStart(options?: BrowserTraceStartOptions): Promise<void>;
    /** Stop Chromium tracing, save its JSON, and return the absolute path. */
    traceStop(cwd: string, options?: BrowserTraceStopOptions): Promise<string>;
    /** Start a Chromium DevTools CPU profile for the page. */
    profileStart(): Promise<void>;
    /** Stop the active CPU profile, save it, and return the absolute path. */
    profileStop(cwd: string, options?: BrowserProfileStopOptions): Promise<string>;
    /** Return Puppeteer metrics plus navigation-relative DOMContentLoaded and load durations. */
    metrics(): Promise<BrowserMetrics>;
    /** Stop and discard active trace/profile state during tab teardown. */
    dispose(): Promise<void>;
}
