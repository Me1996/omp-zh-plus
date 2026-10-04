/**
 * Plain, bounded error text to sanitize before applying terminal styles.
 * Match embedded home paths (including quoted names with spaces), not URL
 * paths or home-prefix siblings. Callers retain the original error for logs.
 */
export declare function sanitizeErrorLine(error: unknown, maxWidth?: number, homeDir?: string): string;
/**
 * Format a provider error into at most `maxRows` wrapped rows for a
 * `WidthAwareText` of `contentWidth` cells. Lines wrap to the render width
 * instead of being cut at a fixed column, so a long single-line body — a raw
 * 400 JSON envelope, a `raw-http-request=` dump path — stays readable. Blank
 * lines are dropped. When rows are cut, a dim `… +N more lines (<key> to
 * expand)` row follows; pass `Infinity` to keep every row. `styleLine` colors
 * logical line `index` and supplies line 0's prefix (`Error: `, the banner
 * glyph). Shared by the inline transcript error and the pinned banner.
 */
export declare function formatErrorBlock(message: string, contentWidth: number, maxRows: number, styleLine: (line: string, index: number) => string): string;
