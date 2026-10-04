import { Ellipsis, type ExtractSegmentsResult, type SliceResult } from "@oh-my-pi/pi-natives";
export { Ellipsis } from "@oh-my-pi/pi-natives";
export { DEFAULT_TAB_WIDTH } from "@oh-my-pi/pi-utils";
export type HangulCompatibilityJamoWidth = "platform" | "unicode" | 1 | 2;
export declare function getHangulCompatibilityJamoWidth(): HangulCompatibilityJamoWidth;
export declare function getWidthConfigEpoch(): number;
/** Publish exact per-line visible widths for a rendered lines array. */
export declare function publishLineWidths(lines: readonly string[], widths: readonly number[]): void;
/** Exact per-line visible widths for an unchanged `lines` array under the current width config. */
export declare function getPublishedLineWidths(lines: readonly string[]): readonly number[] | undefined;
export declare function setHangulCompatibilityJamoWidth(width: HangulCompatibilityJamoWidth): boolean;
export declare function resetHangulCompatibilityJamoWidthForTests(): void;
export type TextSizingScale = 1 | 2 | 3;
export type TextSizingVerticalAlign = "top" | "bottom" | "center";
export type TextSizingHorizontalAlign = "left" | "right" | "center";
export interface TextSizingOptions {
    scale?: TextSizingScale;
    widthCells?: number;
    verticalAlign?: TextSizingVerticalAlign;
    horizontalAlign?: TextSizingHorizontalAlign;
}
/**
 * Encode a plain-text span using Kitty's OSC 66 text-sizing protocol. The TUI
 * emits only safe UTF-8 payloads and ST terminators so its ANSI parser and the
 * terminal agree on span boundaries.
 */
export declare function encodeTextSized(text: string, options?: TextSizingOptions): string;
export declare function sliceWithWidth(line: string, startCol: number, length: number, strict?: boolean | null): SliceResult;
export declare function truncateToWidth(text: string, maxWidth: number, ellipsisKind?: Ellipsis | null | "", pad?: boolean | null): string;
export declare function wrapTextWithAnsi(text: string, width: number): string[];
export declare function extractSegments(line: string, beforeEnd: number, afterStart: number, afterLen: number, strictAfter: boolean): ExtractSegmentsResult;
export declare function replaceTabs(text: string): string;
/**
 * Returns a string of n spaces. Uses a pre-allocated buffer for efficiency.
 */
export declare function padding(n: number): string;
/** Center a line in a field of `width` columns, truncating when too wide. */
export declare function centerLine(line: string, width: number): string;
/**
 * Get the shared grapheme segmenter instance.
 */
export declare function getSegmenter(): Intl.Segmenter;
/**
 * Visible width of a string in terminal columns, excluding ANSI/OSC escapes.
 *
 * `Bun.stringWidth` does the heavy lifting (UAX#11 width tables + ANSI/OSC
 * stripping); this adds the corrections it omits — tabs (expanded to
 * `tabWidth` cells), OSC 66 text-sizing payloads (scaled by `s=`), and APC
 * sequences (counted as printable by Bun, actually zero cells).
 */
export declare function visibleWidth(str: string): number;
/** Remove ANSI, OSC, and APC control sequences while preserving visible text. */
export declare function stripTerminalSequences(str: string): string;
/**
 * Scaled spans must bypass wrapping/padding and, when scaled up, reserve the
 * terminal rows their multicell glyphs flow into.
 */
export declare function isOsc66Line(line: string): boolean;
/**
 * Largest `s=` scale among the OSC 66 spans in a line (1 when none is scaled).
 * A scale-`s` heading occupies `s` terminal rows, so the `s - 1` blank rows
 * beneath it are the glyph's lower half and must never be erased or overdrawn.
 */
export declare function osc66MaxScale(line: string): number;
/**
 * Normalize text for terminal output without changing logical editor content.
 * Some terminals render precomposed Thai/Lao AM vowels inconsistently during
 * differential repaint. Their compatibility decompositions have the same cell
 * width but avoid stale-cell artifacts in terminal renderers.
 */
export declare function normalizeTerminalOutput(str: string): string;
/**
 * Check if a character is whitespace.
 */
export declare function isWhitespaceChar(char: string): boolean;
/**
 * Check if a character is punctuation.
 */
export declare function isPunctuationChar(char: string): boolean;
export type WordNavKind = "whitespace" | "delimiter" | "cjk" | "word" | "other";
/**
 * Coarse Unicode-aware character classification for word navigation (Option/Alt + Left/Right).
 * This intentionally avoids language-specific word segmentation for predictability across scripts.
 */
export declare function getWordNavKind(grapheme: string): WordNavKind;
export declare function isWordNavJoiner(grapheme: string): boolean;
/**
 * Move the cursor one "word" to the left using Unicode-aware coarse navigation.
 *
 * Returns a new cursor index in the range [0, text.length].
 */
export declare function moveWordLeft(text: string, cursor: number): number;
/**
 * Move the cursor one "word" to the right using Unicode-aware coarse navigation.
 *
 * Returns a new cursor index in the range [0, text.length].
 */
export declare function moveWordRight(text: string, cursor: number): number;
/**
 * Apply background color to a line, padding to full width.
 *
 * @param line - Line of text (may contain ANSI codes)
 * @param width - Total width to pad to
 * @param bgFn - Background color function
 * @returns Line with background applied and padded to width
 */
export declare function applyBackgroundToLine(line: string, width: number, bgFn: (text: string) => string): string;
/**
 * Extract a range of visible columns from a line. Handles ANSI codes and wide chars.
 *
 * @param strict - If true, exclude wide chars at boundary that would extend past the range
 */
export declare function sliceByColumn(line: string, startCol: number, length: number, strict?: boolean): string;
export declare function setTuiTight(tight: boolean): void;
export declare function isTuiTight(): boolean;
export declare function getPaddingX(basePadding: number): number;
