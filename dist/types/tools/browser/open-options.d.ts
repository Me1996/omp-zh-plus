import type { Page } from "puppeteer-core";
/** Resolve init-script file paths against the session cwd, preserving non-files as inline JavaScript. */
export declare function resolveInitScriptSources(entries: readonly string[] | undefined, cwd: string): Promise<string[]>;
/** Enable invalid-certificate navigation for the page through CDP. */
export declare function applyIgnoreHttpsErrors(page: Page): Promise<void>;
