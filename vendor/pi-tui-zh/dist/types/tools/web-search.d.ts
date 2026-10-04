import type { NativeToolView, ToolRenderResult } from "./renderer.js";
/**
 * Web Search TUI Rendering
 *
 * Tree-based rendering with collapsed/expanded states for web search results.
 */
import type { Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
import { type SearchResponse } from "./web-search-types.js";
/** Search response and optional failure shown in the transcript. */
export interface SearchRenderDetails {
    response: SearchResponse;
    error?: string;
}
/** Render web search result with tree-based layout */
export declare function renderSearchResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: SearchRenderDetails;
}, options: RenderResultOptions, theme: Theme, args?: {
    query?: string;
    maxAnswerLines?: number;
}): Component;
/** Render web search call (query preview) */
export declare function renderSearchCall(args: {
    query?: string;
    [key: string]: unknown;
}, _options: RenderResultOptions, theme: Theme): Component;
type SearchRenderArgs = {
    query?: string;
    [key: string]: unknown;
};
/** Render web search queries, answers, and cited sources. */
export declare const webSearchToolRenderer: {
    renderCall: typeof renderSearchCall;
    renderResult: typeof renderSearchResult;
    describeCall(args: SearchRenderArgs): NativeToolView;
    describeResult(result: ToolRenderResult<SearchRenderDetails>, _options: RenderResultOptions, args?: SearchRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
};
export {};
