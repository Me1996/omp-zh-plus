import type { DescribeContext, NativeNode } from "../native/node.js";
import type { SymbolTheme } from "../symbols.js";
import type { Component } from "../tui.js";
/** @internal exported for tests — the grown-line block-kind gate. */
export declare function fastLineStartHazard(grownLine: string): boolean;
/** @internal exported for tests — the windowed lexer's first-probe window size. */
export declare const LEX_WINDOW_BYTES: number;
/** A hyperlink as the renderer sees it: inline `[text](href)`, `<autolink>`, bare GFM URL, or reference link. */
export interface MarkdownLink {
    /** Flattened visible label with whitespace collapsed to one row; falls back to `href` when empty. */
    text: string;
    /** Destination exactly as marked resolved it (references resolved, no normalization). */
    href: string;
}
/**
 * Every link token in `text`, in document order, from the same configured
 * lexer the renderer uses — so fenced code, code spans, escapes, reference
 * definitions and the GFM autolink rules agree with what is drawn on screen.
 * Duplicate hrefs are kept; callers decide how to fold them.
 */
export declare function extractMarkdownLinks(text: string): MarkdownLink[];
/** Drop all L2 cache entries. Call on theme change to prevent stale styled output. */
export declare function clearRenderCache(): void;
/**
 * Default text styling for markdown content.
 * Applied to all text unless overridden by markdown formatting.
 */
export interface DefaultTextStyle {
    /** Foreground color function */
    color?: (text: string) => string;
    /** Background color function */
    bgColor?: (text: string) => string;
    /** Bold text */
    bold?: boolean;
    /** Italic text */
    italic?: boolean;
    /** Strikethrough text */
    strikethrough?: boolean;
    /** Underline text */
    underline?: boolean;
}
/**
 * Stateful incremental code highlighter carrying parser state across pushes.
 * Produced per streaming fence by {@link MarkdownTheme.createHighlightStream}.
 */
export interface HighlightStreamSession {
    /** Highlight the next chunk and advance parser state. */
    push(chunk: string): string;
}
/** Collect distinct hyperlink destinations using the renderer's Markdown grammar, excluding images and code. */
export declare function getMarkdownLinkUrls(text: string): string[];
/**
 * Theme functions for markdown elements.
 * Each function takes text and returns styled text with ANSI codes.
 */
export interface MarkdownTheme {
    heading: (text: string) => string;
    link: (text: string) => string;
    linkUrl: (text: string) => string;
    /** Resolve the OSC 8 destination without changing visible text; undefined preserves the authored URL. */
    resolveLink?: (href: string) => string | undefined;
    code: (text: string) => string;
    codeBlock: (text: string) => string;
    codeBlockBorder: (text: string) => string;
    quote: (text: string) => string;
    quoteBorder: (text: string) => string;
    hr: (text: string) => string;
    listBullet: (text: string) => string;
    bold: (text: string) => string;
    italic: (text: string) => string;
    strikethrough: (text: string) => string;
    underline: (text: string) => string;
    highlightCode?: (code: string, lang?: string) => string[];
    /**
     * Create a stateful incremental highlighter for one streaming code fence.
     * `push` receives newline-terminated complete lines (only the final push
     * may omit the trailing newline) and must return highlighted ANSI text for
     * exactly the pushed chunk, byte-identical to highlighting the concatenated
     * text through `highlightCode`. Return null when `lang` is unsupported.
     */
    createHighlightStream?: (lang?: string) => HighlightStreamSession | null;
    /**
     * Resolve a mermaid ASCII rendering by fenced block source text.
     * Return null to fall back to fenced code rendering.
     */
    resolveMermaidAscii?: (source: string, maxWidth?: number) => string | null;
    /**
     * Glyphs for quote borders, rules, tables and color swatches. Optional so themes
     * built to the upstream pi-tui `MarkdownTheme` shape (which has no `symbols`)
     * still render; omitted symbols fall back to the active theme's set.
     */
    symbols?: SymbolTheme;
}
export declare class Markdown implements Component {
    #private;
    setIgnoreTight(ignore: boolean): this;
    constructor(text: string, paddingX: number, paddingY: number, theme: MarkdownTheme, defaultTextStyle?: DefaultTextStyle, codeBlockIndent?: number);
    /** Return bounded source text and layout state for debug inspection. */
    debugState(): Record<string, unknown>;
    setText(text: string): boolean;
    invalidate(): void;
    /**
     * The unrendered source as an `md` node, `stream` while the streaming
     * (transient) cache is on. Append-only growth yields a fresh node of the
     * same kind and key whose text extends the previous one, which the
     * reconciler sends as `text append`.
     */
    describe(_cx: DescribeContext): NativeNode;
    /**
     * Width-independent source prefix of the last render ending at a frozen
     * Markdown block boundary that no append can move: it stops in front of a
     * display-math opener whose block an append could still close. Only
     * meaningful while streaming (transient render cache on); grows
     * monotonically under append-only `setText`.
     */
    getLastRenderStableText(): string;
    get transientRenderCache(): boolean;
    set transientRenderCache(value: boolean);
    render(width: number): readonly string[];
}
/**
 * Render inline markdown (bold, italic, code, links, strikethrough) to a styled string.
 * Unlike the full Markdown component, this produces a single line with no block-level elements.
 */
export declare function renderInlineMarkdown(text: string, mdTheme: MarkdownTheme, baseColor?: (t: string) => string): string;
