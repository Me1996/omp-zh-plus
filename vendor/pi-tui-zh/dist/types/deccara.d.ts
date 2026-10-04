/** DECSACE — select the rectangle change extent so DECCARA fills a rectangle. */
export declare const DECSACE_RECT = "\u001B[2*x";
/** DECSACE — restore the default (stream) change extent. */
export declare const DECSACE_DEFAULT = "\u001B[*x";
/**
 * Encode a single DECCARA rectangle. `top`/`bottom` are 1-based inclusive screen
 * rows, `left`/`right` 1-based inclusive columns, `sgr` the raw SGR parameter
 * list to apply (e.g. `48;2;10;20;30`, `48;5;4`, `41`).
 */
export declare function encodeDeccara(top: number, left: number, bottom: number, right: number, sgr: string): string;
/** Where to cut a fillable line and the background to paint over the remainder. */
export interface BgFillAnalysis {
    /** Byte index where droppable trailing background padding begins (0 = whole line). */
    cut: number;
    /** 0-based column where the trailing padding begins (DECCARA left = leftCol + 1). */
    leftCol: number;
    /** SGR parameter list of the background covering the trailing region. */
    bg: string;
}
/**
 * Decide whether `line` (a final, width-fit, reset-terminated ANSI string) is a
 * full-width background fill whose trailing padding can be replaced by a DECCARA
 * rectangle. Returns `null` unless it can *prove* the dropped bytes are literal
 * trailing spaces under a single, constant, non-default background span (or the
 * entire row is background-styled spaces).
 *
 * Conservative by construction: any OSC sequence (hyperlinks/images), any
 * non-SGR CSI, a partial row, an inconsistent or default trailing background, or
 * a malformed escape all yield `null` so the caller keeps the exact original.
 */
export declare function analyzeBgFillLine(line: string, width: number): BgFillAnalysis | null;
/** Per-frame plan: the (possibly shortened) row strings and the DECCARA batch. */
export interface DeccaraPlan {
    /** Row strings to write, parallel to the input. Optimized rows are shortened. */
    texts: string[];
    /** DECSACE-wrapped rectangle batch to emit after the rows, or `""` if none. */
    sequence: string;
}
/**
 * Plan DECCARA rectangles for a contiguous block of visible rows.
 *
 * `lines[k]` is the final ANSI string for screen row `firstScreenRow + k`
 * (0-based). For each fillable row the trailing background padding is removed
 * (the row's cells are cleared/erased by the caller, then repainted by the
 * rectangle), and vertically adjacent rows with an identical left/right/bg span
 * coalesce into one rectangle. Rectangles are emitted only when they save more
 * bytes than they cost, so the result never exceeds the original byte count.
 */
export declare function planDeccaraFills(lines: string[], width: number, firstScreenRow?: number): DeccaraPlan;
