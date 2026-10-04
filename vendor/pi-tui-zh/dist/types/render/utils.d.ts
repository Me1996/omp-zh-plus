/**
 * Shared helpers for tool-rendered UI components.
 */
import type { Theme, ThemeBg } from "../theme/theme.js";
import type { State } from "./types.js";
/**
 * Incremental xxHash64 key builder.
 *
 * Chains `Bun.hash.xxHash64` calls via seeding — each fed value
 * mixes into the running hash without intermediate string allocations.
 * Accepts strings, numbers (u32), booleans, bigints, and `undefined`/`null`
 * (hashed as a sentinel byte) natively.
 */
export declare class Hasher {
    #private;
    /** Feed a string. */
    str(s: string): this;
    /** Feed an unsigned 32-bit integer. */
    u32(n: number): this;
    /** Feed a 64-bit bigint. */
    u64(n: bigint): this;
    /** Feed a boolean (single byte: 1 = true, 0 = false). */
    bool(b: boolean): this;
    /** Feed a value that may be `undefined` or `null` (hashed as a 0xFF sentinel byte). */
    optional(v: string | undefined | null): this;
    /** Return the final hash digest. */
    digest(): bigint;
}
/** Render-cache entry used by tool renderers. */
export interface RenderCache {
    key: bigint;
    lines: string[];
}
/** Build indentation and continuing branches for ancestor levels. */
export declare function buildTreePrefix(ancestors: boolean[], theme: Theme): string;
/** Return the branch glyph for a final or continuing tree item. */
export declare function getTreeBranch(isLast: boolean, theme: Theme): string;
/** Return the continuation prefix for subsequent lines of a tree item. */
export declare function getTreeContinuePrefix(isLast: boolean, theme: Theme): string;
/** Pad or truncate visible text to exactly `width` columns and optionally apply a background. */
export declare function padToWidth(text: string, width: number, bgFn?: (s: string) => string): string;
/** Resolve a tool output state to its background color token. */
export declare function getStateBgColor(state: State): ThemeBg;
