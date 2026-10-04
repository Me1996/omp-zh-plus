import type { NativeToolView } from "./renderer.js";
/**
 * Inline TUI renderers for the long-term memory tools (`retain`, `recall`,
 * `reflect`).
 *
 * These keep the transcript terse — one status line plus, for `retain`, one
 * `Remember: …` line per stored item — instead of the generic JSON arg tree,
 * which exploded multi-line memory blobs into an unreadable wall. The tool
 * container is a transparent passthrough, so these renderers stay frameless:
 * a status line with a couple of dim bullets reads far cleaner than boxing a
 * one-line memory note.
 */
import type { Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import type { Theme } from "../theme/theme.js";
interface RetainRenderArgs {
    items?: unknown;
}
interface QueryRenderArgs {
    query?: string;
}
/** Render retained memory items and their storage summary. */
export declare const retainToolRenderer: {
    inline: true;
    mergeCallAndResult: true;
    renderCall(args: RetainRenderArgs, options: RenderResultOptions, theme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: {
            count?: number;
        };
        isError?: boolean;
    }, options: RenderResultOptions, theme: Theme, args?: RetainRenderArgs): Component;
    describeCall(args: RetainRenderArgs): NativeToolView | undefined;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: MemoryRetainDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: RetainRenderArgs): NativeToolView | undefined;
};
/** Render recalled memories with an expandable body. */
export declare const recallToolRenderer: {
    inline: true;
    mergeCallAndResult: true;
    renderCall(args: QueryRenderArgs, _options: RenderResultOptions, theme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        isError?: boolean;
    }, options: RenderResultOptions, theme: Theme, args?: QueryRenderArgs): Component;
    describeCall(args: QueryRenderArgs): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: QueryRenderArgs): NativeToolView | undefined;
};
/** Render synthesized memory reflections. */
export declare const reflectToolRenderer: {
    inline: true;
    mergeCallAndResult: true;
    renderCall(args: QueryRenderArgs, _options: RenderResultOptions, theme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        isError?: boolean;
    }, options: RenderResultOptions, theme: Theme, args?: QueryRenderArgs): Component;
    describeCall(args: QueryRenderArgs): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: QueryRenderArgs): NativeToolView | undefined;
};
/** Number of memories accepted by retain. */
export interface MemoryRetainDetails {
    count: number;
}
export {};
