/**
 * Byte-bounded source passages. A file is cut into contiguous whole-line
 * windows tagged with their original line numbers; the lexically strongest
 * windows are selected, sketched for routing, and finally judged verbatim.
 * Every reported range maps back to real line coordinates.
 */
import type { FindRange } from "@oh-my-pi/pi-tui-zh/tools/find";
/** A contiguous run of tagged source lines (`L<n>| text`), 1-based inclusive. */
export interface Passage {
    start: number;
    end: number;
    text: string;
    /** Lexical score used for window selection and tie-breaking. */
    score: number;
}
/** A judged line range with its yes-probability and a one-line preview; the shape the renderer consumes. */
export type HeatRange = FindRange;
/**
 * Contiguous whole-line windows bounded by bytes, including the final line. A
 * single oversized line is clipped at a code-point boundary and keeps its real
 * line id.
 */
export declare function windows(text: string, bytes: number, keywords: readonly string[], weights: readonly number[]): Passage[];
/**
 * Keep the best lexical windows and, when no words match, distribute the
 * budget evenly through the file instead of always falling back to its
 * opening bytes. Returned in file order.
 */
export declare function selectWindows(passages: Passage[], limit: number): Passage[];
/** Passage text with the generated `L<n>| ` tags stripped; the caller owns the line coordinates. */
export declare function plainContent(passage: Passage): string;
/**
 * A budgeted map of verbatim source lines, not an invented summary. Lines are
 * ranked by keyword weight (plus a nudge for call-like lines) so deep
 * implementation text can outrank headers, then emitted in file order.
 */
export declare function sketch(passage: Passage, keywords: readonly string[], weights: readonly number[], budget: number): string;
/**
 * Union the judged-positive spans; never bridge an unjudged gap. A merged span
 * keeps the max probability so repeated or overlapping asks are not rewarded.
 * Strongest first, then earliest.
 */
export declare function mergeHeat(heat: readonly HeatRange[], threshold: number): HeatRange[];
/** The most relevant ranges, strongest first, then earliest. */
export declare function rankedHeat(heat: readonly HeatRange[], limit: number): HeatRange[];
