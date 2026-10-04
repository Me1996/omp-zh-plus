import type { InternalResource } from "./types.js";
/** Resource content type inferred from a file extension: markdown, JSON, or plain text. */
export declare function contentTypeForPath(filePath: string): InternalResource["contentType"];
/**
 * Validate that a URL-relative path is safe (no traversal, no absolute paths).
 * Error messages name `scheme` so callers surface them unchanged.
 */
export declare function validateRelativePath(relativePath: string, scheme: string): void;
/** Thrown when an internal URL resolves outside its scheme root. */
export declare class UrlContainmentError extends Error {
    name: string;
}
/**
 * Throw `<scheme>:// URL escapes <scheme> root[: <url>]` unless `targetPath` is `rootPath` or lies beneath it.
 * The message names the URL, never the on-disk path.
 */
export declare function ensureWithinRoot(targetPath: string, rootPath: string, scheme: string, url?: string): void;
/**
 * Realpath of an existing `targetPath` under the already-realpathed `realRoot`,
 * checking the lexical target, its real parent (when it exists), and its real
 * path for containment so symlinks cannot escape the root. Returns `undefined`
 * when the target does not exist; write paths use {@link ensureCreatableWithinRoot}.
 * Escape errors name `url`.
 */
export declare function containedRealPath(targetPath: string, realRoot: string, scheme: string, url: string): Promise<string | undefined>;
/**
 * Throw {@link UrlContainmentError} unless creating `targetPath` (lexically under
 * the already-realpathed `realRoot`) stays inside the root: the deepest existing
 * entry on the way must canonically resolve within it, and no entry may be a
 * dangling symlink a `mkdir -p` + write would follow out of the root. Errors name
 * `url`, never the on-disk path; symlink loops and file ancestors fail closed.
 */
export declare function ensureCreatableWithinRoot(targetPath: string, realRoot: string, scheme: string, url: string): Promise<void>;
/** Plain directory listing: directories first (`name/`), then files, by name; `(empty directory)` when empty. */
export declare function formatDirectoryListing(entries: ReadonlyArray<{
    name: string;
    isDirectory: boolean;
}>): string;
/**
 * Builds a text resource for a filesystem directory resolved by an internal URL handler.
 *
 * The resource is flagged immutable so the read tool never mints hashline edit
 * anchors against a directory listing — only file resources from the same
 * handler stay editable.
 */
export declare function buildDirectoryResource(url: string, directoryPath: string, notes?: string[]): Promise<InternalResource>;
