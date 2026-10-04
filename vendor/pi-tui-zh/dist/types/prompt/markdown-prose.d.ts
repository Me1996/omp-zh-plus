/**
 * Return a copy of `text` with identical length (indices map 1:1) where every
 * character inside a non-prose region is replaced by a space. Non-prose regions
 * are markdown fenced code blocks, inline code spans, and HTML/XML tags together
 * with the content they enclose. Newlines are preserved. Text with no construct
 * that could open such a region is returned unchanged.
 */
export declare function maskNonProse(text: string): string;
/**
 * Whether `text` contains a standalone keyword match (per the non-global,
 * word-bounded `word` regex) that lives in prose rather than inside a code
 * block, inline code span, or HTML/XML section. `word` MUST be non-global so
 * `.test` stays stateless.
 */
export declare function keywordInProse(text: string, word: RegExp): boolean;
