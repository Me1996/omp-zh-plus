import { type LineRange } from "@oh-my-pi/pi-tui-zh/tools/line-ranges";
import { glob } from "@oh-my-pi/pi-natives";
import { type InternalUrlFilesystem } from "../internal-urls/url-filesystem.js";
/** POSIX absolute, Windows drive, or UNC (`\\server\share` / `//server/share`). */
export declare function isFilesystemSourcePath(value: string): boolean;
export declare function expandTilde(filePath: string, home?: string): string;
export declare function expandPath(filePath: string): string;
/**
 * Reconcile a drive-alias path with the current host so filesystem reads land
 * on the same bytes the user meant, in either translation direction:
 *
 * - On native Windows (`win32`), MSYS/WSL mount roots (`/c/...`, `/mnt/c/...`)
 *   map to native drive paths (`C:\...`).
 * - Under WSL, pasted Windows drive paths (`C:\...`, `C:/...`) map to their
 *   `/mnt/<drive>/...` mount so the file resolves on the Linux side instead of
 *   being `path.resolve`d into a nonexistent path under cwd (issue #10426).
 */
export declare function normalizeWindowsDriveAliasPath(filePath: string, platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv): string;
/**
 * Parse a `-N` tail selector into its line count (`:-60` → 60 last lines).
 * Returns `null` when `sel` is not tail-shaped; throws {@link ToolError} for `-0`.
 */
export declare function parseTailCount(sel: string): number | null;
/** Return `true` when `lineNumber` (1-indexed) falls in any of the supplied ranges. */
export declare function isLineInRanges(lineNumber: number, ranges: readonly LineRange[]): boolean;
/**
 * Three-way probe for whether the exact filesystem entry named by `filePath`
 * exists. `stat` (used earlier) failed for reasons other than "no such file"
 * (dangling symlink, `EACCES` on a parent, transient I/O), and each of those
 * silently reinterpreted a real literal path such as `test:1-2` as `test`
 * plus selector `1-2` (issue #4618). `lstat` inspects the entry itself, so a
 * dangling symlink is still detected as present; ambiguous errors resolve to
 * `"unknown"` so callers keep the raw path instead of guessing.
 *
 * `ENAMETOOLONG` resolves to `"missing"` rather than `"unknown"`: a path whose
 * component or whole length exceeds the OS limit can never name a real single
 * entry, so it is strictly stronger evidence of non-existence than `ENOENT`.
 * Without this, a semicolon-joined `path` list long enough to trip the limit
 * (bare filenames past `NAME_MAX`, or a total past `PATH_MAX`) was read as one
 * literal path and the delimited split was suppressed (issue #7597).
 *
 * On Windows a colon after the root names an NTFS alternate data stream, and
 * `lstat` of a nonexistent stream such as `file.md:1-40` can intermittently
 * succeed with the base file's metadata while `open` fails with `ENOENT`. That
 * false positive made the literal-preferring splitters drop a valid selector and
 * `read` open `file.md:1-40` verbatim. Such paths are confirmed with an `F_OK`
 * access check, which rejects missing streams and accepts real ones.
 */
export declare function probeLiteralPathExists(filePath: string, cwd: string): Promise<"exists" | "missing" | "unknown">;
/**
 * Async sibling of {@link splitPathAndSel} that prefers a literal filesystem
 * path over selector interpretation. Selector-shaped tails may be POSIX
 * filenames or NTFS alternate data streams, so a confirmed `lstat` always
 * preserves the literal path. Ambiguous probe errors preserve the literal on
 * POSIX, where colon filenames are valid, but fall back to the strict split on
 * Windows, where only a confirmed alternate data stream can be literal.
 */
export declare function splitPathAndSelPreferringLiteral(rawPath: string, cwd: string): Promise<{
    path: string;
    sel?: string;
}>;
/**
 * Synchronous sibling of {@link probeLiteralPathExists}. Some callers resolve
 * paths on a synchronous hot path (the ACP event mapper builds tool-call
 * notifications synchronously), so the async `lstat` probe is unavailable. The
 * error-code handling matches the async version exactly.
 */
export declare function probeLiteralPathExistsSync(filePath: string, cwd: string): "exists" | "missing" | "unknown";
/**
 * Synchronous sibling of {@link splitPathAndSelPreferringLiteral}. It applies
 * the same platform-specific handling for inconclusive literal-path probes.
 */
export declare function splitPathAndSelPreferringLiteralSync(rawPath: string, cwd: string): {
    path: string;
    sel?: string;
};
/**
 * Resolve a path relative to the given cwd.
 * Handles ~ expansion and absolute paths.
 *
 * A bare root slash is treated as a workspace-root alias for tool inputs. Users
 * often pass `/` to mean “search from here”, and letting tools escape to the
 * filesystem root is almost never what they intended.
 */
export declare function resolveToCwd(filePath: string, cwd: string): string;
/**
 * Resolve a path that MUST stay inside `cwd`, or `null` when it would escape.
 *
 * {@link resolveToCwd} deliberately honors absolute paths, `~`, and `..` —
 * correct for a path a user typed, wrong for one a remote peer supplied.
 * Callers handling untrusted input (Cursor's `download_path`) use this instead:
 * only a non-empty relative path landing under the live cwd is accepted, so
 * neither `/etc/passwd` nor `../../escape` can be written through.
 *
 * The lexical check alone is not containment: a symlink inside the workspace
 * can point anywhere, so `out/config` under a `ws/out -> /elsewhere` link is
 * relative, `..`-free, and still writes outside. Both the target and its
 * deepest existing ancestor are therefore realpath-resolved — the ancestor
 * because a download names a file that does not exist yet, so the link in its
 * path is the only thing that can be resolved before the write.
 *
 * The cwd itself is rejected: a download names a file, never the directory.
 */
export declare function confineToWorkspace(filePath: string, cwd: string): string | null;
/**
 * Resolve the path a syscall on `filePath` would really act on, or `null` when
 * that cannot be established.
 *
 * A lexical path is not a destination. The kernel follows every component above
 * the last, so `ws/link/file` under a `ws/link -> /elsewhere` link lands outside
 * `ws` while still looking relative and `..`-free. Handing such a path to a
 * privileged helper defeats the defence a helper author reaches for first — a
 * prefix allowlist passes, because the link sits inside the allowed root while
 * its target does not. Callers that hand a path to something more privileged
 * than the syscall that just failed resolve it here first.
 *
 * Rejecting symlinked components outright is not an option: `/var` and `/tmp`
 * are links on macOS, so every path under `os.tmpdir()` traverses one. They are
 * resolved instead, and only a path whose real destination cannot be established
 * is refused, because "where would this land" then has no answer to hand over.
 * {@link confineToWorkspace} refuses an unresolvable link for the same reason.
 *
 * @param followFinal `true` for a syscall that follows a link at the final
 *   component (`open`, so every write), `false` for one that acts on the link
 *   itself (`unlink`) and therefore needs it left alone.
 */
export declare function resolveSyscallTarget(filePath: string, followFinal: boolean): Promise<string | null>;
export declare function formatPathRelativeToCwd(filePath: string, cwd: string, options?: {
    trailingSlash?: boolean;
}): string;
/**
 * Strip matching surrounding double quotes from a path string.
 * Common when users paste quoted paths from Windows Explorer or shell copy-paste.
 * Only double quotes — single quotes are valid POSIX filename characters.
 * Tradeoff: a POSIX path literally starting AND ending with " would also be unquoted.
 * Accepted because such names are virtually nonexistent in practice.
 */
export declare function stripOuterDoubleQuotes(input: string): string;
/** Search root for a parsed base path: a registered internal URL as spelled (single-slash alias normalized), else {@link resolveToCwd}. */
export declare function resolveSearchBase(basePath: string, cwd: string): string;
/**
 * Absolute spelling of a native search result `rel` (root-relative `/`-separated
 * raw entry names; `""` names the root itself) under the search root `base`.
 * Absolute paths and URLs pass through; below a URL root each name joins as a
 * percent-encoded segment.
 */
export declare function resolveSearchResultPath(base: string, rel: string): string;
/** `target` relative to the host directory `base` with `/` separators; `target` itself when either is an internal URL. */
export declare function relativeSearchResultPath(base: string, target: string): string;
export declare function normalizePathLikeInput(input: string): string;
export declare function hasGlobPathChars(filePath: string): boolean;
type PathEntrySplitter = (item: string) => {
    basePath: string;
};
/**
 * Split one path-like entry whose multiple targets were flattened into one
 * string. Existing paths are kept intact, so real filenames containing spaces,
 * commas, or semicolons win over delimiter recovery.
 */
export declare function splitDelimitedPathEntry(entry: string, cwd: string, options?: {
    splitter?: PathEntrySplitter;
    routedUrlPredicate?: (entry: string) => boolean;
}): Promise<string[] | null>;
/**
 * Split a `;` list that names URLs alongside local paths
 * (`https://x;src/a.ts:1-20`, `omp://;Makefile:1-3`). Engages only when URL
 * detection would otherwise claim the whole entry; everything else keeps the
 * normal image/sqlite/archive/literal ordering. Every part must be a URL (per
 * `isUrl`) or an existing literal path without glob characters, so a URL that
 * merely contains `;` (`https://a/x;v=1`) and a literal file named with `;`
 * (including `a;b.md:1-2`, issue #4618) stay whole.
 */
export declare function splitMixedUrlPathList(entry: string, cwd: string, isUrl: (part: string) => boolean): Promise<string[] | null>;
/** Expand delimited entries in-place while preserving unsplit entries. */
export declare function expandDelimitedPathEntries(entries: readonly string[], cwd: string, options?: {
    splitter?: PathEntrySplitter;
}): Promise<string[]>;
export interface ParsedSearchPath {
    basePath: string;
    glob?: string;
}
export interface ParsedFindPattern {
    basePath: string;
    globPattern: string;
    hasGlob: boolean;
}
export interface ResolvedSearchTarget {
    basePath: string;
    glob?: string;
    bareGlob?: boolean;
}
export interface ResolvedMultiSearchPath {
    basePath: string;
    glob?: string;
    scopePath: string;
    exactFilePaths?: string[];
    targets?: ResolvedSearchTarget[];
}
export interface ResolvedFindTarget {
    basePath: string;
    globPattern: string;
    hasGlob: boolean;
}
export interface ResolvedMultiFindPattern {
    targets: ResolvedFindTarget[];
    scopePath: string;
}
export declare function parseSearchPath(filePath: string): ParsedSearchPath;
/**
 * Async sibling of {@link parseSearchPath} that prefers literal interpretation
 * when a path containing glob metacharacters resolves to an existing entry on
 * disk. Disambiguates Next.js/SvelteKit routes like `apps/[id]/page.tsx` —
 * without this, `[id]` is parsed as a glob character class and silently
 * matches nothing.
 */
export declare function parseSearchPathPreferringLiteral(filePath: string, cwd: string): Promise<ParsedSearchPath>;
export declare function parseFindPattern(pattern: string): ParsedFindPattern;
export declare function combineSearchGlobs(prefixGlob?: string, suffixGlob?: string): string | undefined;
export declare function resolveExplicitSearchPaths(pathItems: string[], cwd: string, filesystem: InternalUrlFilesystem, suffixGlob?: string, fanOutFileItems?: boolean): Promise<ResolvedMultiSearchPath | undefined>;
export declare function resolveExplicitFindPatterns(patternItems: string[], cwd: string): Promise<ResolvedMultiFindPattern | undefined>;
/**
 * Result of partitioning a list of user-supplied paths/globs into entries whose
 * base directory currently exists on disk versus those that do not.
 *
 * Used by multi-path tools (search, find, ast_grep, ast_edit) to tolerate one
 * or more missing entries in a multi-path call: the surviving entries should
 * still be searched, with the missing entries surfaced as a non-fatal warning.
 */
export interface PartitionedPaths {
    /** Raw input strings whose resolved base path exists. */
    valid: string[];
    /** Raw input strings whose resolved base path is missing (ENOENT). */
    missing: string[];
}
/**
 * Stat each input's base path concurrently; return entries split by existence.
 *
 * `splitter` is expected to be {@link parseFindPattern} or
 * {@link parseSearchPath}: both return a `basePath` field that this helper
 * resolves against `cwd` ({@link resolveSearchBase}) and stats through
 * `filesystem`. ENOENT is the only swallowed error — every other stat failure
 * (permission, IO, tier refusal, etc.) propagates so callers do not silently
 * skip paths that exist but are unreadable.
 *
 * Order of `valid` and `missing` follows the input order, so callers can rely
 * on `valid[0]` matching the first surviving user-supplied entry.
 */
export declare function partitionExistingPaths(items: string[], cwd: string, splitter: (item: string) => {
    basePath: string;
}, filesystem: InternalUrlFilesystem): Promise<PartitionedPaths>;
/**
 * Async variant of {@link resolveReadPath} for async tool paths: identical
 * variant order and winner semantics, but non-blocking probes. The sync
 * variant stays for genuinely synchronous contexts (renderers, ACP mapper).
 *
 * The macOS-only filename variants (NFD storage, curly quotes, AM/PM narrow
 * spaces) run on every platform, exactly like the sync resolver: a file
 * copied from macOS keeps its NFD/curly bytes wherever it lands, so the
 * normalization must not be darwin-gated. The wins here are non-blocking
 * probes, not fewer probes.
 */
export declare function resolveReadPathAsync(filePath: string, cwd: string): Promise<string>;
export declare function resolveReadPath(filePath: string, cwd: string): string;
/**
 * Find a unique workspace entry whose trailing path matches a missing authored path.
 * Returns `null` for no match, ambiguity, timeout, or scan failure.
 */
export declare function findUniqueWorkspaceSuffix(rawPath: string, cwd: string, signal?: AbortSignal): Promise<{
    absolutePath: string;
    displayPath: string;
} | null>;
/** Exercise the post-native cancellation boundary without a real filesystem walk. */
export declare function findUniqueWorkspaceSuffixWithGlobForTest(rawPath: string, cwd: string, signal: AbortSignal | undefined, globImpl: typeof glob): Promise<{
    absolutePath: string;
    displayPath: string;
} | null>;
/** Local file materialized from a readable external URL for shared tool-scope resolution. */
export interface ResolvedExternalSearchUrl {
    /** Absolute or cwd-relative file path to search. */
    sourcePath: string;
    /** True when the materialized file must not mint editable anchors. */
    immutable?: boolean;
}
export interface ToolScopeOptions {
    rawPaths: string[];
    cwd: string;
    /** Verb used in the "Cannot {action} …" errors for unreachable internal URLs and external URLs. */
    internalUrlAction: string;
    /** Filesystem every scope path resolves through; the native search must get its `shellFilesystem()`. */
    filesystem: InternalUrlFilesystem;
    /** Collect absolute paths of immutable external materializations. */
    trackImmutableSources?: boolean;
    /** Refuse internal URLs whose files tools may not write ({@link InternalUrlRouter.fileWritable}); rewrite tools. */
    fileWritableOnly?: boolean;
    /** Honor `exactFilePaths` from {@link resolveExplicitSearchPaths} (search-only). */
    surfaceExactFilePaths?: boolean;
    /** Fan plain-file entries out into per-target scans instead of folding them
     * into a directory walk's glob union (search-only: the caller must dedupe
     * matches from overlapping targets). */
    fanOutFileTargets?: boolean;
    /** Extra hint appended to "Path not found" when stat fails and the user supplied multiple paths. */
    multipathStatHint?: string;
    /** Materialize readable external URLs to local text files before scope derivation. */
    resolveExternalUrl?: (rawPath: string) => Promise<ResolvedExternalSearchUrl | undefined>;
}
export interface ToolScopeResolution {
    searchPath: string;
    scopePath: string;
    globFilter: string | undefined;
    bareGlob: boolean;
    isDirectory: boolean;
    multiTargets?: ResolvedSearchTarget[];
    exactFilePaths?: string[];
    missingPaths: string[];
    immutableSourcePaths: Set<string>;
}
/**
 * Shared path-input pipeline for `search`, `ast_grep`, and `ast_edit`:
 *  1. normalize + reject empty paths,
 *  2. materialize external URLs; internal URLs stay URLs for the native search's filesystem,
 *  3. partition existing vs missing when multiple paths are supplied,
 *  4. derive a single search base path / glob, or a multi-target list,
 *  5. stat the resolved base path through `filesystem` so callers can branch on directory vs file scope.
 */
export declare function resolveToolSearchScope(opts: ToolScopeOptions): Promise<ToolScopeResolution>;
export {};
