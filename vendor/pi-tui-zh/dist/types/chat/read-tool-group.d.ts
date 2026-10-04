import type { AssistantMessage, Usage } from "@oh-my-pi/pi-ai";
import { type Component } from "../tui.js";
import { Container } from "../tui.js";
import { type ReadRenderArgs } from "../tools/read.js";
import type { ToolExecutionHandle } from "./tool-execution.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
export declare function readArgsHaveTarget(args: unknown): boolean;
/**
 * Whether a read collapses into the compact {@link ReadToolGroupComponent}
 * rather than a full tool execution. Filesystem/external targets always
 * collapse; registered internal-URL schemes render full so their resolved
 * content is visible, unless their spec declares `compactTranscript`
 * (device listings/docs read better in the compact grouped view).
 */
export declare function readArgsCollapseIntoGroup(args: unknown): boolean;
/**
 * Return the collapsed read calls that can own a turn's usage row. Mixed-tool
 * turns and visible content after a read keep the standalone row so request
 * metrics retain their transcript ordering.
 */
export declare function groupedReadUsageCallIds(message: AssistantMessage): string[] | undefined;
type ReadToolGroupOptions = {
    showContentPreview?: boolean;
};
export declare class ReadToolGroupComponent extends Container implements ToolExecutionHandle {
    #private;
    constructor(options?: ReadToolGroupOptions);
    render(width: number): readonly string[];
    isTranscriptBlockFinalized(): boolean;
    finalize(): void;
    /**
     * Force the group terminal even if an entry never received its result (the
     * turn aborted or ended), allowing the container to retire it as history.
     */
    seal(): void;
    /** Reads never park as background tasks; the handle method is a no-op. */
    parkAsBackground(): void;
    getTranscriptBlockVersion(): number;
    updateArgs(args: ReadRenderArgs, toolCallId?: string): void;
    /**
     * Re-key an entry whose streamed tool-call id changed mid-stream (a provider
     * rewriting the id across deltas; see EventController's
     * `#streamedToolCallIdByIndex`). Preserves row order so a sibling read run is
     * not visibly reshuffled, and no-ops when the rename would collide.
     */
    renameEntry(oldId: string, newId: string): void;
    /** Remove one call without discarding successful siblings in the shared group. */
    removeEntry(toolCallId: string): boolean;
    updateResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: unknown;
        isError?: boolean;
    }, isPartial?: boolean, toolCallId?: string): void;
    /**
     * Nest one request's usage beneath the last visible read call from that
     * request. Parallel reads share one row rather than duplicating request totals.
     */
    attachUsage(toolCallIds: readonly string[], usage: Usage, durationMs?: number, ttftMs?: number, timestamp?: number, turnElapsedMs?: number): boolean;
    setArgsComplete(_toolCallId?: string): void;
    setExecutionStarted(_toolCallId?: string): void;
    setExpanded(expanded: boolean): void;
    setToolActivityVisible(visible: boolean): void;
    getComponent(): Component;
    /**
     * Mirrors the terminal's toggles: the `tool` head (the group's root) is
     * `Ctrl+O`'s expansion; a fallback preview card collapses on its own
     * (`setExpanded` resets those).
     */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * The read run as one inline `tool` on terminals that list the kind, else
     * the fallback: a bare `card` (role `omp.tool.read`) with `Read <path>` or
     * `Read (N)` in the head, a `list` of path items (status tone, link,
     * correction and conflict detail, nested usage) and, with content previews
     * on, a `code` block per read clamped by the card's preview while collapsed.
     */
    describe(cx?: DescribeContext): NativeNode;
}
export {};
