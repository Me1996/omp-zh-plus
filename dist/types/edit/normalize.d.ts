export type LineEnding = "\r\n" | "\n";
/** Detect the first line-ending style. Defaults to LF. */
export declare function detectLineEnding(content: string): LineEnding;
/** Normalize every line ending to LF. */
export declare function normalizeToLF(text: string): string;
/** Re-encode LF text with the requested line ending. */
export declare function restoreLineEndings(text: string, ending: LineEnding): string;
/** Strip a UTF-8 BOM and preserve it for round-tripping. */
export declare function stripBom(content: string): {
    bom: string;
    text: string;
};
export declare function normalizeUnicode(value: string): string;
