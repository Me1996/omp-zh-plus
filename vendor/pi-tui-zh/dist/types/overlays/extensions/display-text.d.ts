/** Strip ANSI/C0/C1/malformed unicode, then expand tabs. Call before theming. */
export declare function sanitizeDisplayText(text: string): string;
/** Collapse newlines to spaces so a hostile title cannot inject extra TUI rows (no trimming). */
export declare function sanitizeDisplaySingleLine(text: string): string;
/** Collapse newlines so a hostile title cannot inject extra TUI rows. */
export declare function sanitizeDisplayLine(text: string): string;
/** Like {@link sanitizeDisplayText}, dropping empty results. */
export declare function sanitizeDisplayField(text: string | undefined | null): string | undefined;
/** Like {@link sanitizeDisplayLine}, dropping empty results. */
export declare function sanitizeDisplayLineField(text: string | undefined | null): string | undefined;
