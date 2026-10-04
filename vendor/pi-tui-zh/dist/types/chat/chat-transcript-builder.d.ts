/**
 * Builds transcript components from persisted session message entries — the
 * file/remote-backed counterpart to {@link UiHelpers.addMessageToChat} (which is
 * bound to the live InteractiveModeContext). Used by the fullscreen transcript
 * viewer ({@link AgentTranscriptViewer}) to render a parked subagent / advisor /
 * collab-guest transcript that has no live session.
 *
 * Unlike incremental transcript sync, {@link ChatTranscriptBuilder.rebuild}
 * always discards prior components and rebuilds the whole transcript from the
 * supplied entries. Re-rendering a growing transcript is therefore O(n) in the
 * entry count, but it cannot duplicate or misorder rows the way incremental
 * component reuse could.
 */
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import { type TUI } from "../tui.js";
import type { MessageRenderer } from "./extension-types.js";
import { type TranscriptEntryLike as TranscriptEntry } from "./transcript-entry.js";
import { TranscriptContainer } from "../chrome/transcript-container.js";
export interface ChatTranscriptBuilderDeps {
    ui: TUI;
    getTool?: (name: string) => AgentTool | undefined;
    /** Whether the active registry entry came from a built-in factory. */
    isBuiltInTool?: (name: string) => boolean;
    getMessageRenderer?: (customType: string) => MessageRenderer | undefined;
    cwd: string;
    hideThinkingBlock?: () => boolean;
    proseOnlyThinking?: () => boolean;
    /** Session-scoped resolved destinations for model-authored Markdown links. */
    linkTargets?: ReadonlyMap<string, string>;
    requestRender: () => void;
}
export declare class ChatTranscriptBuilder {
    #private;
    readonly container: TranscriptContainer;
    constructor(deps: ChatTranscriptBuilderDeps);
    /** Whether the transcript currently holds any rendered rows. */
    get isEmpty(): boolean;
    /** Discard all components and rebuild the whole transcript from `entries`. */
    rebuild(entries: TranscriptEntry[]): void;
    /** Append newly persisted entries without rebuilding already rendered rows. */
    append(entries: TranscriptEntry[]): void;
    /**
     * Toggle tool-output expansion across every expandable component. Cards a
     * TSP terminal collapsed or expanded locally mirror that into their own
     * state, so this re-applies the transcript-wide state to every one of them
     * even when it equals the previous value.
     */
    setExpanded(expanded: boolean): void;
    get expanded(): boolean;
    /** Rendered row where a persisted entry begins, after the container has painted once. */
    rowForEntry(entryId: string): number | undefined;
    /** Tear down components (sealing pending spinners) and clear build state. */
    reset(): void;
    dispose(): void;
}
