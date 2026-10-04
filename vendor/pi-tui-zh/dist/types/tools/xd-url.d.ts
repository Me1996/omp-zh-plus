/** Canonical prefix for virtual tool-device URLs. */
export declare const XD_URL_PREFIX = "xd://";
/** Returns the canonical tool name from a bare or `xd://`-prefixed spelling. */
export declare function stripXdUrlPrefix(name: string): string;
/**
 * Parse an `xd://` URL into its device target.
 * Returns `null` for other or malformed URLs and `name: null` for the root.
 */
export declare function parseXdUrl(input: string): {
    name: string | null;
} | null;
/**
 * Parse a read-only `xd://<tool>/<topic>` documentation URL.
 * Returns `null` for anything else, including bare device URLs.
 */
export declare function parseXdTopicUrl(input: string): {
    name: string;
    topic: string;
} | null;
/** Whether a streaming path prefix could still become an `xd://` URL. */
export declare function couldBecomeXdUrl(partialPath: string): boolean;
