import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import { type Component, Container, type TUI } from "../tui.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
import type { FileDiagnosticsResult } from "../tools/lsp.js";
import { type AnimationFrame } from "../chrome/transcript-container.js";
/** Resolves the canonical renderer key while retaining the provider's wire name in message history. */
export declare function toolRenderName(wireName: string, tool: AgentTool | undefined): string;
/** Minimal TUI surface ToolExecutionComponent uses to schedule repaints and share image budget. */
export interface ToolExecutionUi {
    requestRender(): void;
    requestComponentRender(component: Component): void;
    resetDisplay(): void;
    imageBudget?: TUI["imageBudget"];
}
export interface ToolExecutionOptions {
    showImages?: boolean;
    /** Allow the name-keyed renderer registry only when the active tool is the built-in implementation. */
    useBuiltInRenderer?: boolean;
}
export interface ToolExecutionHandle extends Component {
    updateArgs(args: unknown, toolCallId?: string): void;
    updateStreamPreview?(update: unknown): void;
    updateResult(result: {
        content: Array<{
            type: string;
            text?: string;
            data?: string;
            mimeType?: string;
        }>;
        details?: unknown;
        isError?: boolean;
    }, isPartial?: boolean, toolCallId?: string): void;
    setArgsComplete(toolCallId?: string): void;
    setExecutionStarted(toolCallId?: string): void;
    setExpanded(expanded: boolean): void;
    setToolActivityVisible(visible: boolean): void;
    /** Mark the call parked: it returned, but stays tracked for async job frames. */
    parkAsBackground(): void;
    /** Seal the block as final history and stop its animations. */
    seal(): void;
}
/** Phase-locked spinner glyph index shared by every live tool block so parallel
 * spinners advance in lockstep instead of each tracking its own start time. */
export declare function sharedSpinnerFrame(frameCount: number, now?: number): number;
/** Stop the shared spinner ticker and drop every registered live block.
 *  Called on interactive-mode teardown so a stray live block cannot keep the
 *  process-wide 80ms interval alive past shutdown (lingering event-loop
 *  handles pin the process; cf. `postmortem.quit`). Test files that assert on
 *  ticker arming also use this to start from a clean slate. */
export declare function stopSharedSpinnerTicker(): void;
/**
 * Component that renders a tool call with its result (updateable)
 */
export declare class ToolExecutionComponent extends Container {
    #private;
    constructor(toolName: string, args: unknown, options: ToolExecutionOptions | undefined, tool: AgentTool | undefined, ui: ToolExecutionUi, _cwd?: string, toolCallId?: string);
    updateArgs(args: unknown, _toolCallId?: string): void;
    /**
     * Signal that args are complete (tool is about to execute).
     * This triggers an immediate final diff computation for edit-like tools.
     */
    setArgsComplete(_toolCallId?: string): void;
    /**
     * Signal that this specific call has begun executing (`tool_execution_start`).
     * Distinct from {@link setArgsComplete}: exclusive writes are marked complete
     * at `message_end` but stay queued until this fires for that call.
     */
    setExecutionStarted(_toolCallId?: string): void;
    /**
     * Resolve once the final (`streaming: false`) preview batch lands or the
     * result settles. Callers without a live batch source (gallery snapshots)
     * pass a budget so a component that will never receive a batch cannot
     * hang them; live approval gates omit it and wait indefinitely.
     */
    whenPreviewSettled(timeoutMs?: number): Promise<void>;
    updateStreamPreview(update: unknown): void;
    updateResult(result: {
        content: Array<{
            type: string;
            text?: string;
            data?: string;
            mimeType?: string;
        }>;
        details?: unknown;
        isError?: boolean;
    }, isPartial?: boolean, _toolCallId?: string): void;
    /**
     * Advance to the shared spinner glyph and repaint just this block. Driven by
     * the single shared spinner ticker (see `registerSpinnerBlock`); the tick is
     * component-scoped so the TUI reuses every other root subtree (issue #4377).
     */
    tickSpinner(frame: number): void;
    /**
     * Whether this block is ready to retire as immutable history. Partial
     * results, including detached background tasks, remain active and mutable
     * until they settle. Hidden blocks render no rows and cannot gate history.
     */
    isTranscriptBlockFinalized(): boolean;
    /**
     * Subagent ids visible on this card for click-to-focus hit-testing. Empty
     * unless this is a task card whose details already name spawned agents.
     * Callers intersect with the live registry, which decides focusability.
     */
    getClickFocusAgentIds(): string[];
    getTranscriptBlockVersion(): number;
    /** Mark the call parked: it returned, but stays tracked for async job frames. */
    parkAsBackground(): void;
    /**
     * Mark the tool terminal even though no result arrived (the turn aborted or
     * abandoned it) and stop animating so the container can retire it.
     */
    seal(): void;
    /**
     * Whether this block is a supersedable result snapshot that has not been
     * sealed. Displacement is best-effort: the snapshot finalizes like any other
     * block, so under capacity pressure it may retire to native scrollback
     * first — then the follow-up call appends a fresh snapshot instead of
     * removing this one (see {@link TranscriptContainer.canRemoveBlock}).
     */
    isDisplaceableBlock(): boolean;
    canBeDisplacedBy(nextToolName: string | undefined): boolean;
    /**
     * A live block torn down through the generic Container path (transcript
     * clear, session switch mid-run) must not leak its shared-ticker
     * registration: the dead component would keep the process-wide 80ms
     * interval alive and keep being repainted.
     */
    dispose(): void;
    /**
     * Stop spinner animation and cleanup resources.
     */
    stopAnimation(): void;
    setExpanded(expanded: boolean): void;
    /** Mirrors the card collapsed or expanded in the terminal, so `Ctrl+O` and native toggles share one state. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** Whether this call targets `filePath` (the late-diagnostics router matches with it). */
    matchesPath(filePath: string): boolean;
    /**
     * Attaches LSP diagnostics that arrived after the result into this call's
     * frame (§7.3: a diagnostics section plus a count chip in the head). Native
     * rendering only; returns false when nothing matched, so the caller shows
     * its standalone notice instead.
     */
    attachLateDiagnostics(files: readonly (FileDiagnosticsResult & {
        readonly path: string;
    })[]): boolean;
    /**
     * The tool card: `card` role `omp.tool.<name>` with the renderer's
     * {@link NativeToolView} (head spans, body nodes), a status chip, an
     * `elapsed` timer in the head and terminal-local collapse clamped to the
     * view's preview. Renderers without describe hooks (and extension tools
     * with only render hooks) get the generic card. Hidden tool activity stays
     * mounted so toggling it is one prop change.
     */
    describe(cx?: DescribeContext): NativeNode;
    /** Apply the transcript allocator's current viewport reservation. */
    setTranscriptAllocation(rows: number, frame: AnimationFrame): void;
    setToolActivityVisible(visible: boolean): void;
    setShowImages(show: boolean): void;
    invalidate(): void;
    render(width: number): readonly string[];
}
