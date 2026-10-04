import type { Page } from "puppeteer-core";
import type { ReactPageHost } from "./devtools-hook.js";
/** Options controlling Web Vitals collection. */
export interface VitalsOptions {
    reload?: boolean;
}
/** Best-effort framework hydration timing captured alongside Web Vitals. */
export interface HydrationTiming {
    framework: string;
    hydratedAt?: number;
}
/** Web Vitals and navigation timing captured from the current document. */
export interface VitalsResult {
    url: string;
    lcp: number;
    cls: number;
    fcp: number;
    ttfb: number;
    inp: number;
    domContentLoaded: number;
    load: number;
    hydration?: HydrationTiming;
    longTasks: number;
}
/** Page expression installing buffered Web Vitals observers (idempotent); run at document start and on the live page. */
export declare const VITALS_INIT_SOURCE = "(() => {\n\tconst root = globalThis;\n\tif (root.__ompBrowserVitals) return root.__ompBrowserVitals;\n\tconst round = value => Math.round(value * 100) / 100;\n\tconst state = {\n\t\tfromDocumentStart: document.readyState === \"loading\" && performance.now() < 50,\n\t\tlcp: 0,\n\t\tcls: 0,\n\t\tfcp: 0,\n\t\tinp: 0,\n\t\tlongTasks: 0,\n\t\thydration: undefined,\n\t};\n\troot.__ompBrowserVitals = state;\n\tconst observe = (type, callback, options) => {\n\t\ttry {\n\t\t\tconst observer = new PerformanceObserver(list => callback(list.getEntries()));\n\t\t\tobserver.observe(options || { type, buffered: true });\n\t\t} catch {}\n\t};\n\tobserve(\"largest-contentful-paint\", entries => {\n\t\tconst entry = entries[entries.length - 1];\n\t\tif (entry) state.lcp = round(entry.renderTime || entry.loadTime || entry.startTime || 0);\n\t});\n\tobserve(\"layout-shift\", entries => {\n\t\tfor (const entry of entries) {\n\t\t\tif (!entry.hadRecentInput) state.cls = round(state.cls + (entry.value || 0));\n\t\t}\n\t});\n\tobserve(\"paint\", entries => {\n\t\tfor (const entry of entries) {\n\t\t\tif (entry.name === \"first-contentful-paint\") state.fcp = round(entry.startTime || 0);\n\t\t}\n\t});\n\tconst recordInput = entries => {\n\t\tfor (const entry of entries) state.inp = Math.max(state.inp, round(entry.duration || 0));\n\t};\n\tobserve(\"first-input\", recordInput);\n\tobserve(\"event\", recordInput, { type: \"event\", buffered: true, durationThreshold: 16 });\n\tobserve(\"navigation\", () => {});\n\tobserve(\"longtask\", entries => {\n\t\tfor (const entry of entries) state.longTasks = round(state.longTasks + (entry.duration || 0));\n\t});\n\treturn state;\n})()";
/** Page expression reading the installed observers; evaluates to a `VitalsReadEnvelope`. */
export declare const VITALS_READ_SOURCE = "(() => {\n\tconst state = globalThis.__ompBrowserVitals;\n\tif (!state) return { installed: false, fromDocumentStart: false };\n\tconst round = value => Math.round((Number(value) || 0) * 100) / 100;\n\tconst nav = performance.getEntriesByType(\"navigation\")[0];\n\tconst paint = performance.getEntriesByName(\"first-contentful-paint\")[0];\n\tif (paint && !state.fcp) state.fcp = round(paint.startTime);\n\tif (!state.hydration) {\n\t\tif (document.querySelector(\"[data-reactroot], #__next\")) state.hydration = { framework: \"React\" };\n\t\telse if (globalThis.__VUE__ || document.querySelector(\"[data-v-app]\")) state.hydration = { framework: \"Vue\" };\n\t\telse if (globalThis.__SVELTE_HMR || document.querySelector(\"[data-svelte-h], [data-sveltekit-preload-data]\")) {\n\t\t\tstate.hydration = { framework: \"Svelte\" };\n\t\t}\n\t}\n\treturn {\n\t\tinstalled: true,\n\t\tfromDocumentStart: state.fromDocumentStart === true,\n\t\tvalue: {\n\t\t\turl: location.href,\n\t\t\tlcp: round(state.lcp),\n\t\t\tcls: round(state.cls),\n\t\t\tfcp: round(state.fcp),\n\t\t\tttfb: round(nav ? nav.responseStart - nav.requestStart : 0),\n\t\t\tinp: round(state.inp),\n\t\t\tdomContentLoaded: round(nav ? nav.domContentLoadedEventEnd : 0),\n\t\t\tload: round(nav ? nav.loadEventEnd : 0),\n\t\t\thydration: state.hydration,\n\t\t\tlongTasks: round(state.longTasks),\n\t\t},\n\t};\n})()";
/** Result of evaluating `VITALS_READ_SOURCE`: install state and, when installed, the current vitals. */
export interface VitalsReadEnvelope {
    installed: boolean;
    fromDocumentStart: boolean;
    value?: VitalsResult;
}
/** Install the buffered Web Vitals observers for this page and future documents. */
export declare function installVitalsObservers(page: Page, signal?: AbortSignal): Promise<void>;
/** Read Web Vitals, reloading once by default when observers missed document start. */
export declare function collectVitals(host: ReactPageHost, options?: VitalsOptions, signal?: AbortSignal): Promise<VitalsResult>;
