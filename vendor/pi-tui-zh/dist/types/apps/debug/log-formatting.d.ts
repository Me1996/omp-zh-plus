/** Sanitize and wrap an expanded log entry into display rows. */
export declare function formatDebugLogExpandedLines(line: string, maxWidth: number): string[];
/** Read a valid timestamp from a structured log entry. */
export declare function parseDebugLogTimestampMs(line: string): number | undefined;
/** Read a finite process identifier from a structured log entry. */
export declare function parseDebugLogPid(line: string): number | undefined;
