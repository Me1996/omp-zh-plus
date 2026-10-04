import type { NativeNode } from "../native/node.js";
import { type Theme } from "../theme/theme.js";
/** Content and display limits for a code preview with optional output. */
export interface CodeCellOptions {
    code: string;
    language?: string;
    index?: number;
    total?: number;
    title?: string;
    status?: "pending" | "running" | "warning" | "complete" | "error";
    spinnerFrame?: number;
    duration?: number;
    output?: string;
    outputMaxLines?: number;
    codeMaxLines?: number;
    /**
     * Show the LAST `codeMaxLines` rows (the live streaming edge) instead of the
     * first, with a "… N earlier lines" marker on top. Lets a pending preview
     * follow code as it is written while staying bounded. Ignored when `expanded`.
     */
    codeTail?: boolean;
    expanded?: boolean;
    /**
     * Prefix the header with the cell's language icon (resolved through the
     * active symbol preset: nerd-font devicon, unicode emoji, or ascii
     * shorthand). Opt-in so only the eval kernel renderer labels each cell;
     * read/write/browser code cells stay icon-free.
     */
    showLanguage?: boolean;
    width: number;
    codeStartLine?: number;
    codeLineNumbers?: Array<number | null>;
}
/** Render a syntax-highlighted code preview and its optional output block. */
export declare function renderCodeCell(options: CodeCellOptions, theme: Theme): string[];
/**
 * The native form of {@link renderCodeCell}: a collapsible `card` holding a
 * `code` node (numbered from `codeStartLine`, or the first explicit line
 * number) and an `ansi` output section. The collapsed code clamp is the
 * card preview; highlighting and gutters are the terminal's.
 */
export declare function describeCodeCell(options: Omit<CodeCellOptions, "width">, theme: Theme): NativeNode;
/** The native form of {@link renderMarkdownCell}: a collapsible `card` holding `md` source and optional output. */
export declare function describeMarkdownCell(options: Omit<MarkdownCellOptions, "width">, theme: Theme): NativeNode;
/** Content and display limits for a Markdown preview with optional output. */
export interface MarkdownCellOptions {
    content: string;
    index?: number;
    total?: number;
    title?: string;
    status?: "pending" | "running" | "warning" | "complete" | "error";
    spinnerFrame?: number;
    duration?: number;
    output?: string;
    outputMaxLines?: number;
    contentMaxLines?: number;
    expanded?: boolean;
    width: number;
}
/** Render a Markdown preview and its optional output block. */
export declare function renderMarkdownCell(options: MarkdownCellOptions, theme: Theme): string[];
