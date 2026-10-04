/**
 * Fullscreen `/copy` picker over the transcript itself.
 *
 * Replays the current branch with {@link ChatTranscriptBuilder} on the
 * alternate screen and moves the same dotted outline the esc-esc rewind
 * selector uses over the rendered items; Enter copies the outlined turn's
 * text. Right descends into the turn's inner blocks — fenced code, `>`-quotes,
 * bash/eval commands, tool output, and links — replacing the turn's rendered
 * region with a stacked, syntax-highlighted block view whose outline steps per
 * block; Left/Esc ascend back to the transcript. Every block caption carries a
 * clickable `⧉ copy` control and link blocks add `↗ open`; the overlay is
 * fullscreen, so the terminal reports clicks here (SGR mouse) even though the
 * main transcript never captures the mouse. Keyboard: Enter copies, `o` opens.
 * A URL that wrapped across terminal rows therefore needs neither a careful
 * mouse selection nor cmd-click.
 */
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import { type Component, type TUI } from "../index.js";
import type { MessageRenderer } from "../chat/extension-types.js";
import { type TranscriptEntryLike as TranscriptEntry } from "../chat/transcript-entry.js";
import { type OutlineTarget } from "../chat/transcript-outline.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/** Preview of a turn's text: prose as markdown, command/tool output as a plain code block. */
export declare function turnPreview(target: OutlineTarget, content: string): NativeNode;
export interface CopySelectorDeps {
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
    /** Replaces the "Copy" header when the picker is reused for another purpose. */
    title?: string;
    /** Verb shown for the pick action in hints and block controls (default "copy"). */
    actionLabel?: string;
    /**
     * The outlined content was chosen — copy it. `label` feeds the status line;
     * `source` names the transcript entry (and inner block, when descended) it came from.
     */
    onPick: (content: string, label: string, source: CopyPickSource) => void;
    /** `o` on a link block — open `href` with the system opener. Absent: `o` is ignored. */
    onOpen?: (href: string, label: string) => void;
    onCancel: () => void;
}
/** Where picked content came from in the transcript. */
export interface CopyPickSource {
    entry: TranscriptEntry;
    /** The inner block, when the pick happened in the descended block view. */
    block?: CopyBlock;
}
/** One copyable inner block of a transcript turn. */
export interface CopyBlock {
    /** Short kind label ("code · ts", "bash command", "read result", …). */
    label: string;
    /** Exact text placed on the clipboard. */
    content: string;
    /** Transcript entry that produced this block. */
    entry: TranscriptEntry;
    /** Markdown code/quote block, or a bash/eval tool-call command. */
    kind?: "code" | "quote" | "command";
    /** Highlight language for the block preview. */
    language?: string;
    /** Set for link blocks: the URL `o` opens. `content` is the same URL. */
    href?: string;
}
export declare class CopySelectorComponent implements Component {
    #private;
    private readonly deps;
    constructor(entries: TranscriptEntry[], deps: CopySelectorDeps);
    /** Number of copyable transcript items; hosts skip mounting when zero. */
    get targetCount(): number;
    invalidate(): void;
    dispose(): void;
    handleInput(data: string): void;
    /** A `picker` is its own sheet: the backend mounts it in `layer` without a wrapper. */
    nativeSheet(cx: DescribeContext): boolean;
    handleNativeEvent(event: NativeUiEvent): void;
    describe(cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
/** Inner blocks of one turn: markdown code/quotes, commands, and tool output. */
export declare function collectBlocks(entries: readonly TranscriptEntry[]): CopyBlock[];
/** Clipboard payload for a whole turn, falling back to its blocks when the turn has no prose. */
export declare function targetCopy(target: OutlineTarget, blocks: readonly CopyBlock[]): {
    content: string;
    label: string;
};
