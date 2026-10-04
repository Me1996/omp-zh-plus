/**
 * Return the first 12 hex characters of a commit SHA, or undefined when the
 * input is missing. Shared between GitHub tool argument normalization and the
 * run-watch renderer.
 */
export declare function formatShortSha(value: string | undefined): string | undefined;
/** Append a labeled Markdown metadata value when present. */
export declare function pushLine(lines: string[], label: string, value: string | number | boolean | undefined): void;
