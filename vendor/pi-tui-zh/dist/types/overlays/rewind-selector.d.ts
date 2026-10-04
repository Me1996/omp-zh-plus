/**
 * Fullscreen esc-esc rewind selector.
 *
 * Replays the current session's branch with {@link ChatTranscriptBuilder} on
 * the alternate screen (`ui.showOverlay(..., { fullscreen: true })`) and moves
 * a dotted outline over the rendered transcript block the rewind would land
 * on, instead of listing user messages in a detached picker. Entries that
 * render nothing (notices, hidden custom messages, tool results folded into
 * their call cards) are never outlined: results fold into the turn that
 * rendered their call so rewinding a turn keeps its tool output, and the rest
 * are skipped entirely.
 *
 * When the outlined turn has sibling branches in the session tree, the region
 * below the divergence renders as a horizontal strip of half-width columns —
 * the current path first, each alternate branch beside it — and Left/Right
 * slide between them with an eased camera animation. Sibling columns are
 * fully rendered transcripts of that branch's most-recent path, built lazily
 * and cached per divergence.
 *
 * Keys: Up/Down step through rendered items in transcript order (within the
 * active column when a strip is open), Left/Right slide between branch
 * variants at a fork and jump between user turns elsewhere, `f` opens a
 * filter (typing narrows the current path to matching items; Esc leaves the
 * filter with the selection kept), Enter rewinds to the outlined item, A loads
 * earlier turns without changing selection (stepping above the oldest replayed
 * turn loads them too), Esc cancels.
 *
 * In a TSP terminal (Tern) the same replay is a page, not a sheet: a screen
 * surface of the transcript's own blocks with `pick`/`drop` marks in place of
 * the dotted outline (see `describeScreen`).
 */
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import { type Component, type TUI } from "../index.js";
import type { MessageRenderer } from "../chat/extension-types.js";
import { type TranscriptEntryLike as TranscriptEntry } from "../chat/transcript-entry.js";
import type { DescribeContext, NativeNode, NativeScreen, NativeUiEvent } from "../native/node.js";
/** One alternate branch at a divergence: its root and message path root → most-recent leaf. */
export interface BranchVariantPath {
    rootId: string;
    entries: TranscriptEntry[];
}
export interface RewindSelectorDeps {
    ui: TUI;
    getTool?: (name: string) => AgentTool | undefined;
    /** Whether the active registry entry came from a built-in factory. */
    isBuiltInTool?: (name: string) => boolean;
    getMessageRenderer?: (customType: string) => MessageRenderer | undefined;
    cwd: string;
    hideThinkingBlock?: () => boolean;
    proseOnlyThinking?: () => boolean;
    linkTargets?: ReadonlyMap<string, string>;
    requestRender: () => void;
    /** Sibling branch paths of `entryId`'s turn (excluding the turn itself). */
    siblingPaths?: (entryId: string) => BranchVariantPath[];
    /** Rewind the session to `entryId` (a message entry anywhere in the tree). */
    onSelect: (entryId: string) => void;
    onCancel: () => void;
}
export declare class RewindSelectorComponent implements Component {
    #private;
    private readonly deps;
    constructor(entries: TranscriptEntry[], deps: RewindSelectorDeps);
    /** Number of selectable rewind points on the current path; hosts skip mounting when zero. */
    get targetCount(): number;
    invalidate(): void;
    dispose(): void;
    handleInput(data: string): void;
    /**
     * The rewind page: the replayed transcript fills a screen surface block by
     * block, as the live one reads, the outlined turn marked `pick` under a
     * "Continue from here" caption (revealed as the outline moves) and what the
     * rewind drops marked `drop`. At a fork the region below it becomes a strip
     * of branch columns, the current path first. The bar is this component's
     * own node, docked under the page, so the filter field keeps the caret.
     */
    describeScreen(_cx: DescribeContext): NativeScreen;
    /** The bar docked under the page: position, key hints, Cancel and Rewind; the filter field while filtering. */
    describe(_cx: DescribeContext): NativeNode;
    /** The bar's buttons run their keys' paths; everything else belongs to the blocks. */
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
