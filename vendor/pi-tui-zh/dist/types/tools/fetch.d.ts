import type { Component } from "../tui.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
/** Display metadata for fetch tool results. */
export interface ReadUrlToolDetails {
    kind: "url";
    url: string;
    finalUrl: string;
    contentType: string;
    method: string;
    truncated: boolean;
    notes: string[];
    meta?: OutputMeta;
}
/** Restore the double slash in a collapsed HTTP URL scheme. */
export declare function repairCollapsedScheme(value: string): string;
/**
 * Peel one or more selector tokens off the right of a URL string. Walks back through
 * trailing `:tok` segments while each token (a) looks like a selector and (b) leaves
 * behind a string that still parses as a URL. Returns selectors left-to-right so callers
 * can apply them in source order.
 */
export declare function tryExtractEmbeddedUrlSelector(readPath: string): {
    path: string;
    sels: string[];
} | null;
/** Render URL read call (URL preview) */
export declare function renderReadUrlCall(args: {
    path?: string;
    url?: string;
    raw?: boolean;
}, _options: RenderResultOptions, uiTheme?: Theme): Component;
/** TSP call view of a URL read: the head only, inline while pending. */
export declare function describeReadUrlCall(args: {
    path?: string;
    url?: string;
    raw?: boolean;
}): NativeToolView;
/** TSP result view of a URL read: a bounded content preview over one quiet stats line. */
export declare function describeReadUrlResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: ReadUrlToolDetails;
    isError?: boolean;
}): NativeToolView;
/** Render URL read result with tree-based layout */
export declare function renderReadUrlResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: ReadUrlToolDetails;
    isError?: boolean;
}, options: RenderResultOptions, uiTheme?: Theme): Component;
