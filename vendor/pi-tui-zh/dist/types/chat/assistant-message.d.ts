import type { AssistantMessage, ImageContent } from "@oh-my-pi/pi-ai";
import { type Component, Container } from "../tui.js";
import { type ImageBudget } from "../components/image.js";
import type { AssistantThinkingRenderer } from "./extension-types.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
import { type CacheInvalidation } from "./cache-invalidation-marker.js";
import { type ServedModelMismatch } from "./served-model-marker.js";
import { type TranscriptStableRow } from "../chrome/transcript-container.js";
import { type TurnUsageSummary } from "../overlays/usage-row.js";
/** Test-only: clear the shared gauge so observations don't leak across cases. */
export declare function resetThinkingSpeedTracker(): void;
/**
 * Renders an assistant message; streaming content remains mutable until the
 * provider finalizes it because later deltas can revise earlier Markdown.
 * The exception is the leading run of visible thinking blocks: raw thinking
 * only ever appends, so its frozen Markdown prefix publishes as append-only
 * stable rows ({@link AppendOnlyTranscriptBlock}) and can retire into native
 * scrollback while the block still streams — a long reasoning trace is no
 * longer clipped to the mutable viewport.
 */
export declare class AssistantMessageComponent extends Container {
    #private;
    readonly transcriptBlockMode: "appendOnly";
    setTextColorTransform(transform?: (text: string) => string): void;
    /**
     * Install resolved destinations for model-authored prose links. A fresh
     * theme object is required whenever the map changes because Markdown's
     * render cache keys themes by object identity.
     */
    setLinkTargets(targets: ReadonlyMap<string, string>): void;
    /**
     * Choose the block this reply reacts to from the transcript it is about to
     * join: the nearest preceding reaction-capable block (the user's bubble),
     * looking past turn attachments such as file mentions or injected notices
     * but never past an earlier reply — a continuation after tool calls has
     * nothing to react to. Call before adding this component. An
     * already-resolved reaction is re-applied, and a message rendered verbatim
     * for lack of a target is re-rendered with its reaction stripped.
     */
    pickReactionTarget(transcript: readonly Component[]): void;
    constructor(message?: AssistantMessage, hideThinkingBlock?: boolean, onImageUpdate?: () => void, thinkingRenderers?: readonly AssistantThinkingRenderer[], imageBudget?: ImageBudget, proseOnlyThinking?: boolean, linkTargets?: ReadonlyMap<string, string>);
    /**
     * Show or clear the trailing cache-invalidation divider. Set at `message_end`
     * (live) or during rebuild, once the turn's usage is known and compared
     * against the previous turn's cache footprint.
     */
    setCacheInvalidation(info: CacheInvalidation | undefined): void;
    /** Mark this answer as the end of a turn with the turn's totals (native only: ANSI keeps them in the status line). */
    setTurnUsage(summary: TurnUsageSummary | undefined): void;
    /**
     * Show or clear the trailing served-model divider. Set once the turn's
     * signed thinking block (or router report) has named the model that actually
     * answered, when it differs from the one requested.
     */
    setServedModelMismatch(info: ServedModelMismatch | undefined): void;
    invalidate(): void;
    setHideThinkingBlock(hide: boolean): void;
    /**
     * Allow or withhold retiring finished lines into native scrollback while the
     * turn is still streaming. Wires the `stream-revision` axis marks as able to
     * revise already-streamed text must withhold it: published bytes go to
     * terminal history once and cannot be retracted, so a later revision would
     * leave the reader with a stale copy. Withholding costs only reachability —
     * the block still retires whole when the turn ends.
     */
    setMidStreamPublication(allowed: boolean): void;
    setProseOnlyThinking(proseOnly: boolean): void;
    dispose(): void;
    /**
     * Toggle suppression of the inline `Error: …` line while the same error is
     * pinned in the banner above the editor. Re-renders so the change is visible.
     */
    setErrorPinned(pinned: boolean): void;
    /**
     * Expand or collapse the inline turn-ending error block so Ctrl+O
     * (tool-output expansion) can reveal a long provider error's hidden tail.
     * Only re-renders when the current message carries a truncatable error, so
     * toggling expansion across the transcript skips ordinary turns. Works even
     * while the error is pinned in the banner: the inline block is drawn (in full)
     * when expanded so the complete body is reachable without sending a message.
     */
    setExpanded(expanded: boolean): void;
    isTranscriptBlockFinalized(): boolean;
    render(width: number): readonly string[];
    /**
     * A `col` (role `omp.assistant`) of `md` nodes keyed by content index, so
     * streamed deltas reach the terminal as `text append` on the same node;
     * the tail block carries `stream: true` until the message finalizes.
     * Thinking blocks are quiet collapsible `section`s: a muted "Thinking…"
     * shimmer while live, then "Thought for 12s"; tokens and rate ride in the
     * head's `title`. With `hideThinkingBlock` only the live head shows (collapsed)
     * and a finished thought emits nothing.
     */
    describe(): NativeNode;
    /**
     * A TTSR rule rewound this partial answer: a native terminal dims it and
     * tags it `↺ rewound` (the ANSI render leaves it as it stopped).
     */
    markRewound(): void;
    /** Mirrors a thinking section collapsed or expanded in the terminal. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** Width-independent stable identities for the streamed leading thinking run. */
    getTranscriptStableRows(): readonly TranscriptStableRow[];
    /**
     * Drop every published thinking stable row. Called by the transcript
     * container during a visibility-driven destructive replay so the head no
     * longer re-emits reasoning captured while thinking was visible. Safe only
     * because the paired display reset clears the scrollback those rows occupied
     * — see {@link AppendOnlyTranscriptBlock.resetTranscriptStableRows}.
     */
    resetTranscriptStableRows(): void;
    renderTranscriptStableRows(count: number, width: number): readonly string[];
    /** Render completed prose rather than an earlier thinking row under emergency viewport pressure. */
    renderTranscriptBlockEmergencyRow(width: number): string | undefined;
    getTranscriptBlockVersion(): number;
    markTranscriptBlockFinalized(): void;
    applyRetryRecovery(retryRecovery: AssistantMessage["retryRecovery"]): void;
    messagePersistenceKey(): string | undefined;
    /** Toggle rendering for assistant-native and tool-result images. */
    setImagesVisible(visible: boolean): void;
    /** Toggle only images produced by tool results; assistant-native images remain governed by setImagesVisible. */
    setToolResultImagesVisible(visible: boolean): void;
    setToolResultImages(toolCallId: string, images: ImageContent[]): void;
    updateContent(message: AssistantMessage, opts?: {
        transient?: boolean;
    }): void;
}
