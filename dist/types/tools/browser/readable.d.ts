export type ReadableFormat = "text" | "markdown";
/** Options for scoping and reducing readable page extraction. */
export interface ReadableExtractOptions {
    /** Limit extraction to the first element matching this CSS selector. */
    selector?: string;
    /** Return only a compact Markdown-style heading outline. */
    outline?: boolean;
    /** Keep sections whose heading contains this case-insensitive substring. */
    filter?: string;
}
export interface ReadableResult {
    url: string;
    title?: string;
    byline?: string;
    excerpt?: string;
    contentLength: number;
    text?: string;
    markdown?: string;
}
/**
 * Extract readable content from raw HTML.
 * Tries Readability (article-isolation scoring) first, then falls back to a
 * CSS selector chain over the same pre-parsed DOM. Returns null if neither
 * path yields usable content.
 */
export declare function extractReadableFromHtml(html: string, url: string, format: ReadableFormat, options?: ReadableExtractOptions): Promise<ReadableResult | null>;
/** Reduce Markdown to heading lines while preserving heading levels. */
export declare function extractMarkdownOutline(markdown: string): string;
/** Keep complete Markdown sections selected by a heading substring. */
export declare function filterMarkdownSections(markdown: string, filter: string): string;
