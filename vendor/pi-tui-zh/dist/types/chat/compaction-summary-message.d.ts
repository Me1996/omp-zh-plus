import { type Component } from "../tui.js";
import type { BranchSummaryMessage, CompactionSummaryMessage, CustomMessage } from "./messages.js";
import type { TspSpan } from "@oh-my-pi/pi-wire";
import { type NativeChild, type NativeNode, type NativeUiEvent } from "../native/node.js";
interface SummaryDividerOptions {
    label: () => string;
    /** Themed spans of the label for native terminals. */
    nativeLabel: () => TspSpan[];
    detailMarkdown: () => string;
    /** Native body when it differs from the markdown detail. */
    nativeDetail?: () => NativeChild[];
    /** Semantic role of the native section. */
    role: string;
}
/**
 * Common summary/detail delegate behind the compaction, handoff, and branch
 * banners: the width-aware divider is always shown while the Markdown detail
 * box is constructed lazily only on the first expanded render and retained
 * across collapse/re-expand cycles.
 */
declare class SummaryMessageComponent implements Component {
    #private;
    constructor(options: SummaryDividerOptions);
    setExpanded(expanded: boolean): void;
    /**
     * A collapsible `section` headed by the divider label, with the summary
     * markdown as its body; expanding is terminal-local and mirrored back
     * through {@link handleNativeEvent}.
     */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
}
/**
 * Compaction point in the transcript, rendered as a slim horizontal divider:
 *
 *   ──────── 📷 remote-compacted · 256K→20K · ctrl+o ────────
 *
 * The label names the maintenance method that fired (remote/soft/handoff/
 * snapcompact; "compacted" for legacy or extension-provided entries) and the
 * before → after context amounts when the entry recorded them. The
 * conversation above the divider stays visible (display transcript keeps
 * full history); only the LLM context was reset. Expanding (ctrl+o) reveals
 * the compaction summary below the divider.
 */
export declare class CompactionSummaryMessageComponent extends SummaryMessageComponent {
    constructor(message: CompactionSummaryMessage);
}
/**
 * Handoff is a compaction strategy too, but it is persisted as a custom message
 * so the LLM sees the handoff-specific developer context. Render it with the
 * same divider affordance as `/compact` instead of the generic `[handoff]` box.
 */
export declare class HandoffSummaryMessageComponent extends SummaryMessageComponent {
    constructor(message: CustomMessage<unknown>);
}
export declare function createHandoffSummaryMessageComponent(message: CustomMessage<unknown>, expanded: boolean): HandoffSummaryMessageComponent | undefined;
/**
 * A branch summary collapses a side branch back into the main line. Render it
 * with the same slim divider as `/compact` and handoff rather than a `[branch]`
 * box, so every history-collapse point reads as one consistent banner.
 */
export declare class BranchSummaryMessageComponent extends SummaryMessageComponent {
    constructor(message: BranchSummaryMessage);
}
export {};
