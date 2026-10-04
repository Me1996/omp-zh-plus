import type { ToolTier } from "@oh-my-pi/pi-agent-core";
import { type Component } from "../index.js";
import type { Theme } from "../theme/theme.js";
import type { RenderResultOptions, ToolActivitySummary, ToolRenderer } from "./renderer.js";
import type { NativeToolView } from "./renderer.js";
/** Mounted device display callbacks, independent of tool execution state. */
export interface XdevMountedRenderer {
    label?: string;
    describeCall?: ToolRenderer["describeCall"];
    describeResult?: ToolRenderer["describeResult"];
    renderCall?(...args: Parameters<ToolRenderer["renderCall"]>): unknown;
    renderResult?(...args: Parameters<ToolRenderer["renderResult"]>): unknown;
    mergeCallAndResult?: boolean;
}
/** Tool presentation state supplied by the host's canonical tool map. */
export interface XdevMountedState {
    readonly mountedNames: ReadonlySet<string>;
    readonly tools: ReadonlyMap<string, XdevMountedRenderer>;
    /**
     * Canonical renderer for a device name, supplied by the host with the same
     * predicate as dispatch (`resolveXdevTool`: mounted devices plus active
     * top-level tools, which the `write` transport also accepts). The TUI keeps
     * no predicate copy of its own — a second copy is what dropped a top-level
     * dispatch to the generic card.
     */
    readonly resolve?: (name: string) => XdevMountedRenderer | undefined;
}
/** Result metadata consumed by delegated device rendering. */
export interface XdevRenderDispatch {
    tool: string;
    mode: "help" | "execute";
    args?: Record<string, unknown>;
    tier?: ToolTier;
    inner?: unknown;
}
/** Wire the wrapped-renderer lookup. Called once by `renderers.ts`. */
export declare function setXdevRendererLookup(lookup: (name: string) => ToolRenderer | undefined): void;
/**
 * Compact `label · verb object` activity summary for a device write, so a
 * squeezed transcript row reads `LSP · references foo` instead of
 * `Write · xd://lsp`. Prose payloads (resolution devices, report_issue)
 * surface their first line instead.
 */
export declare function xdevActivitySummary(name: string, content: unknown, resolveMounted?: (name: string) => XdevMountedRenderer | undefined): ToolActivitySummary;
/**
 * Streaming-safe call preview for an `xd://` write. Until the write actually
 * executes (`executionStarted` / `tool_execution_start`), show a queued/planning
 * card so Grok-style think-after-toolcall stalls do not look like a hung
 * inner tool. `argsComplete` alone is not enough: exclusive writes can sit
 * complete at `message_end` while an earlier call still runs. Once execution
 * starts, forward the decoded inner args to the mounted tool's renderer
 * (session instance first, then the static map). Returns `undefined` (render
 * nothing) when no renderer produces output.
 */
export declare function renderXdevCall(name: string, content: unknown, options: RenderResultOptions, theme: Theme, resolveMounted?: (name: string) => XdevMountedRenderer | undefined): Component | undefined;
/** TSP call view for an `xd://` write: queued card until execution, then the device renderer's own view. */
export declare function describeXdevCall(name: string, content: unknown, options: RenderResultOptions, resolveMounted?: (name: string) => XdevMountedRenderer | undefined): NativeToolView | undefined;
/** TSP result view for an `xd://` dispatch, forwarded to the device renderer. */
export declare function describeXdevResult(dispatch: XdevRenderDispatch, result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    isError?: boolean;
}, options: RenderResultOptions, resolveMounted?: (name: string) => XdevMountedRenderer | undefined): NativeToolView | undefined;
/** Forward an `xd://` dispatch result to the mounted tool's renderer. */
export declare function renderXdevResult(dispatch: XdevRenderDispatch, result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    isError?: boolean;
}, options: RenderResultOptions, theme: Theme, resolveMounted?: (name: string) => XdevMountedRenderer | undefined): Component | undefined;
