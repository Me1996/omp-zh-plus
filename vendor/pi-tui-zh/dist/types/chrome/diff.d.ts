import type { TspProps } from "@oh-my-pi/pi-wire";
import { type Theme } from "../theme/index.js";
import type { NativeNode } from "../native/node.js";
/**
 * Native `diff` node for omp's compact diff text (`+12|added`, `-12|removed`,
 * ` 12|context`, blank or `…` rows between regions). Each contiguous region
 * becomes one hunk; the terminal draws gutters, word emphasis and highlighting.
 * Removed rows carry old line numbers, added rows new ones and context rows
 * old ones, so the other side is derived from the running line delta.
 */
export declare function nativeDiff(diffText: string, options?: {
    filePath?: string;
} & TspProps<"diff">): NativeNode;
export interface RenderDiffOptions {
    /** File path used to resolve indentation (.editorconfig + defaults) */
    filePath?: string;
    /** Theme used for diff colors and syntax highlighting; defaults to the active TUI theme. */
    theme?: Theme;
}
/**
 * Render a diff string with colored lines and intra-line change highlighting.
 * - Context lines: dim/gray
 * - Removed lines: red, with inverse on changed tokens
 * - Added lines: green, with inverse on changed tokens
 */
export declare function renderDiff(diffText: string, options?: RenderDiffOptions): string;
