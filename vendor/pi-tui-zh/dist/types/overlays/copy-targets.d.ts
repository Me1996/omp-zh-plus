import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { ToolCall } from "@oh-my-pi/pi-ai";
/** A fenced code block extracted from assistant markdown. */
export interface CodeBlock {
    /** Info string after the opening fence (language id), trimmed. */
    lang: string;
    /** Block body with the trailing newline stripped. */
    code: string;
}
/** A blockquote block: a maximal run of `>`-prefixed lines from markdown. */
export interface QuoteBlock {
    /** Block body with each line's `>` marker (and one optional space) removed. */
    text: string;
}
/** A drillable block within an assistant message, in document order. */
export type MessageBlock = ({
    kind: "code";
} & CodeBlock) | ({
    kind: "quote";
} & QuoteBlock);
/** A runnable command found in the transcript. */
export interface LastCommand {
    kind: "bash" | "eval";
    code: string;
    /** Highlight language: "bash" for bash, or the resolved eval language ("python"/"javascript"). */
    language: string;
}
/**
 * Split assistant markdown into drillable blocks — fenced code and `>`-quoted
 * runs — in document order. Fences mask their bodies, so a `>` line inside a
 * code block is never mistaken for a quote. An unclosed fence is treated as
 * ordinary text, matching the fenced-block grammar.
 */
export declare function extractBlocks(text: string): MessageBlock[];
/** Extract fenced code blocks from assistant markdown, in document order. */
export declare function extractCodeBlocks(text: string): CodeBlock[];
/** Walk the transcript backwards for the most recent fenced assistant code block. */
export declare function extractLastCodeBlock(messages: readonly AgentMessage[]): CodeBlock | undefined;
/** Extract `>`-quoted blocks from assistant markdown, in document order. */
export declare function extractQuoteBlocks(text: string): QuoteBlock[];
/** A hyperlink found in assistant markdown: inline `[text](href)`, `<autolink>`, bare URL, or reference link. */
export interface LinkTarget {
    /** Visible link label flattened to one display row; falls back to `href` when empty. */
    text: string;
    /** Absolute http(s) URL as marked resolved it. */
    href: string;
}
/**
 * Hyperlinks the renderer would draw for `text`, in document order and
 * deduplicated by href. Tokenization is the renderer's own
 * ({@link extractMarkdownLinks}), so fenced code, code spans, escapes,
 * reference definitions and GFM autolink rules agree with the screen. Only
 * http(s) targets qualify: the result feeds both the clipboard and the system
 * opener, and a `mailto:`/`file:` destination is not something to hand to
 * either from a transcript.
 */
export declare function extractLinks(text: string): LinkTarget[];
/** Walk the transcript backwards for the most recent link in an assistant message. */
export declare function extractLastLink(messages: readonly AgentMessage[]): LinkTarget | undefined;
/** Runnable command carried by a `bash`/`eval` tool call, if any. */
export declare function commandFromToolCall(tc: ToolCall): LastCommand | undefined;
/** Walk the transcript backwards for the most recent bash command or eval code. */
export declare function extractLastCommand(messages: readonly AgentMessage[]): LastCommand | undefined;
/** Concatenated visible text of an assistant message, verbatim; undefined when blank. */
export declare function assistantText(msg: AgentMessage): string | undefined;
