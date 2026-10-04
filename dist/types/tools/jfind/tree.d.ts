import * as natives from "@oh-my-pi/pi-natives";
import { type InternalUrlFilesystem } from "../../internal-urls/url-filesystem.js";
/** One eligible file under the search root. */
export interface FileEntry {
    /** Absolute host path or internal URL. */
    path: string;
    /** Root-relative display path with `/` separators; a file root's own {@link path}. */
    rel: string;
    size: number;
}
/** Validated `find` scope: a directory to walk, or one file searched alone. */
export type SearchRoot = {
    path: string;
    type: "directory";
} | {
    path: string;
    type: "file";
    size: number;
};
/**
 * Resolve a `find` scope (empty = `cwd`) to an existing directory or file,
 * host path or internal URL alike, through `filesystem`.
 * @throws {ToolError} line-range selector, missing path, or neither file nor directory.
 */
export declare function resolveSearchRoot(filesystem: InternalUrlFilesystem, input: string, cwd: string): Promise<SearchRoot>;
/** Whether a root-relative regular file is searchable. */
export declare function eligibleFile(rel: string, size: number, includeHidden: boolean): boolean;
export interface ListFilesOptions {
    includeHidden: boolean;
    /** Filesystem URL roots and their entries resolve through. */
    filesystem: natives.ShellFilesystem;
    signal?: AbortSignal;
}
/**
 * Every eligible, non-gitignored regular file under `root`, in path order.
 * Symlinks are never followed. A file root is its only entry unless it is
 * credential material, a binary, or empty; being named explicitly admits it
 * even when hidden.
 */
export declare function listFiles(root: SearchRoot, options: ListFilesOptions): Promise<FileEntry[]>;
/** `812 B`, `3.4 KB`, … */
export declare function humanSize(bytes: number): string;
/**
 * Model-facing listing of `entries` as a prefix-folded directory tree: one `#`
 * per depth, `# dir/` headers, and every file line tagged with its question key
 * (`# e017 name (size)`), with a blank line before every directory header and
 * every root-level file after the first line.
 */
export declare function renderTree(entries: readonly FileEntry[], tagOf: (index: number) => string): string;
