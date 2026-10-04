import type { InternalWriteResult } from "../internal-urls/types.js";
import type { ToolSession } from "./index.js";
/** A rendered `conflict://<N>[/<scope>]` region. */
export interface ConflictRegionRead {
    /** Model-facing text: hashline header + anchored lines, or numbered/plain lines per display mode. */
    text: string;
    /** Prefix-free region lines for transcript display. */
    rawText: string;
    /** 1-based file line number of the first rendered line. */
    startLine: number;
    /** File the conflict block lives in. */
    absolutePath: string;
}
/**
 * Render a `conflict://<N>` (or `conflict://<N>/<scope>`) region as regular
 * file content. Lines keep their original file line numbers and, in hashline
 * mode, a snapshot tag is recorded against the underlying file so anchors
 * line up with the source for `edit`.
 */
export declare function readConflictUri(session: ToolSession, raw: string): ConflictRegionRead;
/**
 * Resolve a `conflict://<N>` or `conflict://*` write. `content` is the raw
 * model payload: hashline prefixes are stripped here (per-id `conflict://*`
 * directives are parsed before stripping, which would eat their `<id>:` heads).
 * Scoped URIs (`/ours`, `/theirs`, `/base`) are read-only.
 */
export declare function writeConflictUri(session: ToolSession, raw: string, content: string, signal: AbortSignal | undefined): Promise<InternalWriteResult>;
