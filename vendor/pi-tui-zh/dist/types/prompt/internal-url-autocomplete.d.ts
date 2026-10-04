import type { AutocompleteItem } from "../index.js";
/** Lazy runtime capabilities supplied by the internal URL host. */
export interface InternalUrlCompletionHost {
    completionSchemes(): string[];
    resolveCompletions(scheme: string, query: string, context: InternalUrlCallerContext & {
        signal?: AbortSignal;
    }): Promise<readonly {
        value: string;
        label?: string;
        description?: string;
    }[] | null | undefined>;
}
/** Install the runtime URL completion capabilities. */
export declare function setInternalUrlCompletionHost(host: InternalUrlCompletionHost): void;
export interface InternalUrlContext {
    /** Lowercased scheme (e.g. `local`). */
    scheme: string;
    /** Text typed after the slashes so far (host + path); may be empty. */
    query: string;
    /** Exact buffer token from its boundary to the cursor (the completion prefix). */
    token: string;
}
/**
 * Detect a completable internal-url token immediately before the cursor.
 * Returns `null` when the text is not a `scheme://` token whose scheme is
 * registered with a completion-capable handler.
 */
export declare function extractInternalUrlContext(textBeforeCursor: string): InternalUrlContext | null;
/** Caller binding shared by tool execution and prompt completion. */
export interface InternalUrlCallerContext {
    cwd?: string;
    sessionFile?: string;
    sessionId?: string;
}
/**
 * Suggestions for the internal-url token ending at the cursor, or `null` when
 * the text is not such a token or no candidate matches the typed query.
 * The optional lazy caller binding overrides cwd and is read only after
 * recognizing an internal-URL token.
 */
export declare function getInternalUrlSuggestions(textBeforeCursor: string, cwd?: string, signal?: AbortSignal, getCaller?: () => InternalUrlCallerContext): Promise<{
    items: AutocompleteItem[];
    prefix: string;
} | null>;
/** Whether `prefix` (the token a completion was offered for) is an internal-url token. */
export declare function isInternalUrlPrefix(prefix: string): boolean;
/**
 * Replace the internal-url token with the selected candidate, appending a
 * trailing space (matching `@` file-reference behavior) so the user can keep
 * typing.
 */
export declare function applyInternalUrlCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string): {
    lines: string[];
    cursorLine: number;
    cursorCol: number;
};
