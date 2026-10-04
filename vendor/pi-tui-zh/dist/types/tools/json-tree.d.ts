import type { Theme } from "../theme/theme.js";
import type { NativeNode } from "../native/node.js";
/** Max depth for JSON tree rendering */
export declare const JSON_TREE_MAX_DEPTH_COLLAPSED = 2;
/** Maximum expanded JSON tree depth. */
export declare const JSON_TREE_MAX_DEPTH_EXPANDED = 6;
/** Maximum collapsed JSON tree rows. */
export declare const JSON_TREE_MAX_LINES_COLLAPSED = 6;
/** Maximum expanded JSON tree rows. */
export declare const JSON_TREE_MAX_LINES_EXPANDED = 200;
/** Maximum collapsed JSON scalar width. */
export declare const JSON_TREE_SCALAR_LEN_COLLAPSED = 60;
/** Maximum expanded JSON scalar width. */
export declare const JSON_TREE_SCALAR_LEN_EXPANDED = 2000;
/** Sanitization, string summary, and budgeting policy for inline JSON. */
export interface InlineFormatOptions {
    sanitizeText?: (text: string) => string;
    multilineSummary?: boolean;
    /** Character-count output budget, retaining the first pair even when oversized. */
    characterBudget?: boolean;
}
/** Format a scalar with optional sanitized multiline summaries. */
export declare function formatScalar(value: unknown, maxLen: number, options?: InlineFormatOptions): string;
/** Format args inline with either display-cell or legacy output character budgeting. */
export declare function formatArgsInline(args: Record<string, unknown>, maxWidth: number, options?: InlineFormatOptions): string;
/** Summarize a task's structured output without expanding its JSON tree. */
export declare function formatOutputInline(data: unknown, maxWidth?: number): string;
/** JSON hierarchy policy accepted by {@link renderJsonTreeLines}. */
export interface JsonTreeRenderOptions {
    maxDepth: number;
    maxLines: number;
    maxScalarLen: number;
    /** Sanitize object keys and string/scalar text before styling. */
    sanitizeText?: (text: string) => string;
    /** Root object keys omitted from display. Defaults to internal tool argument metadata. */
    hiddenRootKeys?: readonly string[];
    /** Preserve embedded newlines as continuation rows. Defaults to true. */
    multilineStrings?: boolean;
    /** Escape inline tabs/newlines as JSON-style sequences. Defaults to true. */
    escapeStringWhitespace?: boolean;
    /**
     * Root row gutter. `hooked` (default) attaches the tree to the block above:
     * the first root draws `└ •`, the rest ` •`, and nested rows branch from
     * under the bullet. `siblings` draws standard `├─`/`└─` root connectors.
     */
    rootConnectors?: "hooked" | "siblings";
}
/**
 * Render a JSON value as bounded tree lines. The positional form remains the
 * public tool-renderer contract; the options form exposes sanitization and root
 * connector policy for specialized adapters such as nested task output.
 */
export declare function renderJsonTreeLines(value: unknown, theme: Theme, maxDepth: number, maxLines: number, maxScalarLen: number): {
    lines: string[];
    truncated: boolean;
};
export declare function renderJsonTreeLines(value: unknown, theme: Theme, options: JsonTreeRenderOptions): {
    lines: string[];
    truncated: boolean;
};
/** Data caps for {@link describeJsonTree}. */
export interface JsonTreeDescribeOptions {
    /** Deepest level expanded into child nodes; deeper containers get a `…` child. */
    maxDepth?: number;
    /** Tree nodes emitted before the remaining siblings collapse into `… N more`. */
    maxNodes?: number;
    /** Characters kept per string scalar (data cap, not a width). */
    maxScalarLen?: number;
    /** Levels open initially; deeper containers start closed. */
    openDepth?: number;
    /** Root object keys omitted. Defaults to internal tool argument metadata. */
    hiddenRootKeys?: readonly string[];
}
/**
 * TSP `tree` of a JSON value: containers become expandable nodes labelled with
 * their key and size, scalars become `key: value` leaves styled by type.
 * Bounded by depth, node count and scalar length; no width math.
 */
export declare function describeJsonTree(value: unknown, options?: JsonTreeDescribeOptions): NativeNode;
