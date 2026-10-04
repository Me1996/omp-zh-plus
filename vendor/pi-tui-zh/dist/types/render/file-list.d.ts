import type { NativeNode } from "../native/node.js";
import type { Theme } from "../theme/theme.js";
/** A file-list item with optional display metadata. */
export interface FileEntry {
    path: string;
    /** Absolute filesystem path. When provided together with {@link FileListOptions.hyperlinkFn}, the
     * rendered path text is wrapped in an OSC 8 hyperlink. */
    absPath?: string;
    isDirectory?: boolean;
    meta?: string;
}
/** Files and presentation options for a tree-style listing. */
export interface FileListOptions {
    files: FileEntry[];
    expanded?: boolean;
    maxCollapsed?: number;
    showIcons?: boolean;
    /** When provided, called with the entry's absolute path and the ANSI-styled display string to
     * optionally wrap the path in an OSC 8 hyperlink. Only invoked when {@link FileEntry.absPath} is set. */
    hyperlinkFn?: (absPath: string, displayText: string) => string;
}
/**
 * The native form of {@link renderFileList}: a `list` of path `item`s keyed
 * by path, linked to their absolute path, with language/folder icons and the
 * meta as detail. Collapsed, the list is clamped to `maxCollapsed` lines and
 * the terminal scrolls the rest.
 */
export declare function describeFileList(options: Omit<FileListOptions, "hyperlinkFn">): NativeNode;
/** Render file entries as a themed tree listing. */
export declare function renderFileList(options: FileListOptions, theme: Theme): string[];
