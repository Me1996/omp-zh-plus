/** Logical source location for one rendered editor segment. */
export interface SpellingDecorationContext {
    editorText: string;
    lines: readonly string[];
    line: number;
    startCol: number;
}
/**
 * Whether `text[start, end)` is a prose word: unmasked by {@link maskNonProse},
 * not inside a path/identifier-like token, and not on a slash-command or
 * queue-shorthand line.
 */
export declare function isProseWord(text: string, masked: string, start: number, end: number): boolean;
/** Whole-buffer context for `line`, starting at column 0. */
export declare function lineContext(lines: readonly string[], line: number): SpellingDecorationContext;
/**
 * Memoized whole-buffer prose mask: answers whether a line range is prose in
 * the context of the full editor text (fenced code spans lines).
 */
export declare class ProseSource {
    #private;
    /** True when `[startCol, endCol)` of `context.line` is prose and the buffer is within the caps. */
    isProse(context: SpellingDecorationContext, startCol: number, endCol: number): boolean;
}
