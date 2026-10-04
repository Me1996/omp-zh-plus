import type { NativeNode } from "../native/node.js";
/**
 * One file's contribution to a grouped file output. The header itself is generated
 * by `formatGroupedFiles` (one `#` per nesting level); use `headerSuffix` to tack
 * on extras like ` (1 replacement)`.
 */
export interface GroupedFileSection {
    /** Optional suffix appended to the file header. */
    headerSuffix?: string;
    /** Body lines emitted into the textual model output. */
    modelLines: string[];
    /** Body lines emitted into the display output. Defaults to `modelLines`. */
    displayLines?: string[];
    /** When true, the file (and its header) is omitted entirely. */
    skip?: boolean;
}
/** Parallel model-facing and display-facing lines for grouped files. */
export interface GroupedFilesOutput {
    model: string[];
    display: string[];
}
/**
 * Render a list of files as a multi-level, prefix-folded directory tree shared by
 * grep, ast-grep, ast-edit, and the LSP diagnostic formatter.
 *
 * Layout (one `#` per level; the shared prefix folds into the top header):
 *   # packages/pkg/src/
 *   ## root.ts
 *   …body…
 *   ## nested/
 *   ### child.ts
 *   …body…
 *
 * Files in the (folded) project root become single-`#` headers with no parent
 * directory line. A blank line precedes every directory header and every
 * root-level file so the renderers can split the output into collapsible groups.
 */
export declare function formatGroupedFiles(files: string[], renderFile: (filePath: string) => GroupedFileSection): GroupedFilesOutput;
/** One file's rendered search matches, plus its hashline tag when editable. */
export interface FileMatchSection {
    model: string[];
    display: string[];
    tag?: string;
}
/**
 * Render per-file search matches (grep / ast-grep). Grouped mode nests files
 * via {@link formatGroupedFiles}, appending `#tag` to headers; flat mode
 * blank-separates files and prefixes each with a hashline header when tagged.
 * Files with no model lines are omitted.
 */
export declare function formatFileMatches(files: string[], grouped: boolean, renderFile: (filePath: string) => FileMatchSection): GroupedFilesOutput;
/** Per-line classification of grouped output, used by renderers for hyperlinks. */
export interface GroupedLineContext {
    /** Directory header, file header, or any non-header body/content line. */
    kind: "dir" | "file" | "content";
    /** Number of leading `#` for headers; 0 for content lines. */
    depth: number;
    /** Resolved absolute path of the dir/file a header points at (when resolvable). */
    headerPath?: string;
    /** For content lines, the absolute path of the owning file (line hyperlinks). */
    filePath?: string;
    /** Header is an internal/url-like target the caller resolves itself. */
    isUrl?: boolean;
}
/**
 * Walk grouped output lines, tracking a directory stack keyed by header depth, so
 * each header and body line can be linked back to its absolute filesystem path.
 * Reconstruction is stack-based (not per-blank-group) so nested directory headers
 * resolve correctly across the whole output.
 *
 * `headerBase` is the directory the displayed (folded) header paths are relative
 * to — for grep/ast tools that is the session cwd, since display paths are
 * formatted relative to cwd regardless of the (sub)directory the search was
 * scoped to. `fileScope` is the initial owning file for body lines that appear
 * before any header (single-file scopes have no `#` headers); it defaults to
 * `headerBase` and should be passed the scoped file's absolute path.
 */
export declare function classifyGroupedLines(lines: readonly string[], headerBase: string | undefined, fileScope?: string | undefined): GroupedLineContext[];
/**
 * Split line indices into blank-line-separated groups, mirroring
 * `splitGroupsByBlankLine`: when any blank line is present, break on runs of
 * blanks; otherwise return a single group of the non-empty lines. Returning
 * indices lets callers slice parallel arrays (raw lines, styled lines, contexts).
 */
export declare function groupLineIndicesByBlank(rawLines: readonly string[]): number[][];
/** One event of {@link walkGroupedOutput}: a directory header, a file header, or a non-blank body line. */
export type GroupedOutputEvent = {
    readonly kind: "dir";
} | {
    readonly kind: "file";
    readonly path: string;
    readonly suffix?: string;
} | {
    readonly kind: "line";
    readonly text: string;
};
/**
 * Walk grouped output (`# dir/`, `## file.ts (suffix)`, body lines), resolving
 * each file header to its full display path (the folded directory chain
 * joined with the name) and dropping blank separator lines.
 */
export declare function walkGroupedOutput(lines: readonly string[]): Generator<GroupedOutputEvent>;
/** One source line for {@link numberedCode}: its number (`null` for an elision marker), text and match mark. */
export interface NumberedLine {
    n: number | null;
    text: string;
    mark?: boolean;
}
/**
 * Numbered `code` for possibly non-contiguous source lines: one block per run
 * of consecutive line numbers (`start` = the run's first line, match lines
 * `mark`ed), with a `…` row wherever the numbers jump or an elision marker
 * (`n: null`) sits. No path header: the row or head above names the file.
 */
export declare function numberedCode(lines: readonly NumberedLine[], opts?: {
    lang?: string;
}): NativeNode[];
/**
 * Describe grouped search output (grep / ast-grep / ast-edit display content)
 * by file (§7.3 grep): per file a 22px path row (dim dir, strong name, the
 * header's suffix or the match count as a chip), then its lines as
 * {@link numberedCode} with match lines marked and `…` between non-adjacent
 * runs. Unnumbered body lines stay plain `code`. `maxFiles` keeps only the
 * first files (the caller says how many were left out).
 */
export declare function describeGroupedOutput(lines: readonly string[], options?: {
    lang?: (path: string) => string | undefined;
    maxFiles?: number;
}): NativeNode[];
