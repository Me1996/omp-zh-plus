import type { Theme } from "../theme/theme.js";
import type { Component } from "../tui.js";
import type { OutputMeta } from "./output-meta.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
/** A verified line range with its yes-probability and a one-line preview. */
export interface FindRange {
    start: number;
    end: number;
    p: number;
    snippet: string;
}
/** A file whose verified passages cleared the threshold; `ranges` are merged positive spans, strongest first. */
export interface FindHit {
    /** Display path relative to {@link FindToolDetails.cwd}, or an internal URL under URL scopes. */
    rel: string;
    /** Filename judgment, when the name batch answered. */
    nameScore?: number;
    /** Best verified passage probability. */
    contentScore: number;
    ranges: FindRange[];
    /** Lines of content actually judged, and whether the file held more. */
    linesSeen: number;
    truncated: boolean;
}
/** Search accounting reported alongside the hits. */
export interface FindStats {
    /** Eligible files under the root. */
    listed: number;
    requests: number;
    errors: number;
    /** Entries judged by name. */
    judged: number;
    /** Files whose content was read and sent. */
    filesRead: number;
    fileBytes: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    apiMs: number;
    windowsJudged: number;
    windowsPruned: number;
    mapCards: number;
    /** Distinct request failures, phase-prefixed. */
    failures: string[];
}
/** Display metadata for find tool results. */
export interface FindToolDetails {
    query: string;
    /** Lexical keywords actually used: derived from the query plus `grep_keywords`. */
    keywords: string[];
    /** Verified-passage probability at or above which a file is a hit. */
    threshold: number;
    hits: FindHit[];
    stats: FindStats;
    elapsedMs: number;
    /** Session cwd; hit paths are relative to it. */
    cwd: string;
    /** Display form of the searched directory or file when narrower than cwd. */
    scopePath?: string;
    meta?: OutputMeta;
}
interface FindRenderArgs {
    query?: string;
    grep_keywords?: string[];
    path?: string;
}
/** Render find calls and results in the transcript. */
export declare const findToolRenderer: {
    renderCall(args: FindRenderArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: FindToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: FindRenderArgs): Component;
    describeCall(args: FindRenderArgs): NativeToolView;
    /**
     * Inline (§7.3 find): `Find “query”  2 hits · 8 files`, then per hit its
     * score bar, path and coverage over the strongest snippets. The search
     * accounting (τ, tokens, cost, time) is the footnote's tooltip.
     */
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: FindToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, args?: FindRenderArgs): NativeToolView;
    mergeCallAndResult: true;
    animatedPendingPreview: true;
    animatedPartialResult: true;
};
export {};
