import type { ToolSession } from "./index.js";
/**
 * Strip hashline display prefixes from write content.
 *
 * Only active when hashline edit mode is enabled — the model sees `[PATH#HASH]`
 * headers plus `LINE:` prefixes in read output and sometimes copies them into write content.
 */
export declare function stripWriteContent(session: ToolSession, content: string): {
    text: string;
    stripped: boolean;
};
/**
 * Record a snapshot of the freshly-written `content` for `absolutePath`
 * so subsequent hashline edits address the new file with a current tag,
 * and return the matching `[displayPath#TAG]` header (`displayPath` defaults to
 * `absolutePath` relative to cwd; URL writes pass their URL). Returns `undefined`
 * when the session is not in hashline mode so callers can no-op cheaply.
 *
 * Mirrors the post-commit snapshot recording the hashline patcher performs
 * after a successful edit — the model gets a tag without an extra `read` —
 * but with EMPTY seen-line provenance: a write displays no numbered lines,
 * so anchored edits against this tag must first see the anchor content (the
 * patcher rejects them with an inline reveal). Authoring content is not
 * knowing its line numbers.
 */
export declare function maybeWriteSnapshotHeader(session: ToolSession, absolutePath: string, content: string, displayPath?: string): string | undefined;
