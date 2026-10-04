/**
 * Minimal deterministic tar for Skillshare packages.
 *
 * The writer emits POSIX ustar with every non-content field fixed (mtime 0,
 * uid/gid 0, empty owner names, mode 0644 or 0755) and entries sorted by the
 * UTF-8 bytes of their path, so the same files always produce the same bytes
 * and therefore the same integrity hash. Paths longer than 100 bytes use the
 * ustar `prefix` field; paths that cannot be split into prefix (≤155) and name
 * (≤100) at a `/` are rejected.
 *
 * The reader accepts ustar, PAX `path` records, and GNU `L` long names so
 * archives produced by other tools can be inspected; directories are skipped
 * and anything that is not a regular file (symlinks, hard links, devices) is
 * rejected. Gzip is handled by callers (`Bun.gzipSync` / `Bun.gunzipSync`).
 */
export interface TarEntry {
    /** POSIX path relative to the archive root; no `.`/`..` segments, no leading `/`. */
    path: string;
    content: Uint8Array;
    executable: boolean;
}
/** Longest path the ustar name + prefix fields can carry. */
export declare const TAR_PATH_MAX = 255;
/** Throws when `path` is not a safe, normalized, relative POSIX path. */
export declare function assertTarPath(path: string): void;
/** Serialize `entries` to an uncompressed ustar archive (deterministic; input order is irrelevant). */
export declare function writeTar(entries: TarEntry[]): Uint8Array<ArrayBuffer>;
/** Parse an uncompressed tar archive into its regular files. */
export declare function readTar(bytes: Uint8Array): TarEntry[];
