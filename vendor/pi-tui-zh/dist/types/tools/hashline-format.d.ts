/** Opening delimiter of a hashline file header. */
export declare const HL_FILE_PREFIX = "[";
/** Closing delimiter of a hashline file header. */
export declare const HL_FILE_SUFFIX = "]";
/** Separator between the file path and content hash. */
export declare const HL_FILE_HASH_SEP = "#";
/** Number of characters in a displayed file hash. */
export declare const HL_FILE_HASH_LENGTH = 4;
/** Keyword identifying a file move operation. */
export declare const HL_MOVE_KEYWORD = "MV";
/** Keyword identifying a file removal operation. */
export declare const HL_REM_KEYWORD = "REM";
/** Separator between a line number and its body. */
export declare const HL_LINE_BODY_SEP = ":";
/** Format a file path and content hash as a hashline header. */
export declare function formatHashlineHeader(path: string, tag: string): string;
/** Prefix each addressable line with its file line number. */
export declare function formatNumberedLines(text: string, startLine?: number): string;
/** Prefix one line with its file line number. */
export declare function formatNumberedLine(lineNumber: number, line: string): string;
/** Split file lines without treating a trailing newline as an empty address. */
export declare function splitAddressableFileLines(text: string): string[];
/** Remove model-facing hashline anchors from copied file content. */
export declare function stripHashlinePrefixes(lines: string[]): string[];
/** Whether a row is a truncation notice emitted by `read`. */
export declare function isReadTruncationNotice(line: string): boolean;
/** Compute the native hashline content fingerprint. */
export declare function computeFileHash(text: string): string;
