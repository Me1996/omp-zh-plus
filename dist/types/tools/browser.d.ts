import type { EvalPreludeDefinition } from "../eval/preludes.js";
import type { ToolSession } from "../sdk.js";
import { type BrowserKind } from "./browser/registry.js";
import type { AriaSnapshotOptions } from "./browser/aria/aria-snapshot.js";
export type { AriaSnapshotOptions } from "./browser/aria/aria-snapshot.js";
/** First-use boundary for the generated Playwright ARIA evaluator bundle. */
export declare function buildAriaSnapshotScript(selector: string | undefined, options?: AriaSnapshotOptions): string;
/** First-use boundary for ARIA-ref parsing; keeps evaluator construction out of tool registration. */
export declare function parseAriaRefSelector(selector: string): string | null;
export { cmuxSnapshotToObservation, mapWaitUntil, resolveCmuxKind, serializeEval } from "./browser/cmux/rpc.js";
export { CmuxSocketClient } from "./browser/cmux/socket-client.js";
export { extractMarkdownOutline, extractReadableFromHtml, filterMarkdownSections, type ReadableExtractOptions, type ReadableFormat, type ReadableResult, } from "./browser/readable.js";
export { ariaSnapshotBaselineKey, collectAriaSnapshotRefs, diffAriaSnapshot, postProcessAriaSnapshot, type AriaSnapshotBaseline, type AriaSnapshotDiffResult, type SnapshotPostProcessOptions, } from "./browser/snapshot-plus.js";
export { DEFAULT_RELAY_URL, type RelayKind, resolveRelayKind } from "./browser/relay/kind.js";
export { type TernKind, resolveTernKind } from "./browser/tern/kind.js";
export type { Observation, ObservationEntry } from "./browser/tab-protocol.js";
declare const browserSchema: import("@oh-my-pi/omptype").FluentType<{
    action: "call" | "close" | "open" | "run" | "tabs";
    all?: boolean | undefined;
    allow_file_access?: boolean | undefined;
    allowed_domains?: string[] | undefined;
    app?: {
        args?: string[] | undefined;
        cdp_url?: string | undefined;
        path?: string | undefined;
        relay?: boolean | undefined;
        target?: string | undefined;
        tern?: boolean | undefined;
    } | undefined;
    args?: unknown[] | undefined;
    chain?: {
        args: unknown[];
        method: string;
    }[] | undefined;
    code?: string | undefined;
    dialogs?: "accept" | "dismiss" | undefined;
    downloads?: string | undefined;
    fn?: string | undefined;
    headed?: boolean | undefined;
    ignore_https_errors?: boolean | undefined;
    init_scripts?: string[] | undefined;
    kill?: boolean | undefined;
    name?: string | undefined;
    persist?: boolean | undefined;
    timeout?: number | undefined;
    url?: string | undefined;
    user_agent?: string | undefined;
    viewport?: {
        height: number;
        scale?: number | undefined;
        width: number;
    } | undefined;
    wait_until?: "domcontentloaded" | "load" | "networkidle0" | "networkidle2" | undefined;
}, {
    action: "call" | "close" | "open" | "run" | "tabs";
    all?: boolean | undefined;
    allow_file_access?: boolean | undefined;
    allowed_domains?: string[] | undefined;
    app?: {
        args?: string[] | undefined;
        cdp_url?: string | undefined;
        path?: string | undefined;
        relay?: boolean | undefined;
        target?: string | undefined;
        tern?: boolean | undefined;
    } | undefined;
    args?: unknown[] | undefined;
    chain?: {
        args: unknown[];
        method: string;
    }[] | undefined;
    code?: string | undefined;
    dialogs?: "accept" | "dismiss" | undefined;
    downloads?: string | undefined;
    fn?: string | undefined;
    headed?: boolean | undefined;
    ignore_https_errors?: boolean | undefined;
    init_scripts?: string[] | undefined;
    kill?: boolean | undefined;
    name?: string | undefined;
    persist?: boolean | undefined;
    timeout?: number | undefined;
    url?: string | undefined;
    user_agent?: string | undefined;
    viewport?: {
        height: number;
        scale?: number | undefined;
        width: number;
    } | undefined;
    wait_until?: "domcontentloaded" | "load" | "networkidle0" | "networkidle2" | undefined;
}>;
type BrowserParams = typeof browserSchema.infer;
/**
 * The browser an open drives, by precedence: explicit `app.*` options, the
 * relay, `browser.cdpUrl`, a Tern PiP (inside a Tern pane, unless
 * `headed: false` or `app.tern: false`; `app.tern: true` forces it), a cmux
 * surface, then Chromium.
 */
export declare function resolveBrowserKind(params: BrowserParams, session: ToolSession, env?: Record<string, string | undefined>): BrowserKind;
/** Create the enabled-only browser host prelude for one tool session. */
export declare function createBrowserPrelude(session: ToolSession): EvalPreludeDefinition;
/** Drop headless tabs so a browser mode change applies to the next open. */
export declare function restartBrowserForModeChange(): Promise<void>;
