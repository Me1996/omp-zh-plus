/** Selected extension files and whether a manifest suppresses convention fallback. */
export interface ExtensionDirectoryResolution {
    /** Whether package.json declares a non-empty omp/pi extensions array. */
    declared: boolean;
    /** Existing files selected by the authoritative manifest or directory conventions. */
    files: string[];
}
/** Source-specific suffix, ordering, and error policies for extension discovery. */
export interface ExtensionDirectoryResolutionOptions {
    /** Ordered index filenames accepted for convention-based directory resolution. */
    indexNames: readonly string[];
    /** Selects direct child files during a one-level scan. */
    isScanFile(name: string): boolean;
    /** Preserve callers whose public ordering requires a sorted directory scan. */
    sortChildren?: boolean;
    /** Preserve callers that surface unexpected stat failures instead of skipping them. */
    throwUnexpectedStatErrors?: boolean;
    /** Receives malformed/unreadable manifest and directory scan diagnostics. */
    onReadError?: (filePath: string, error: unknown) => void;
}
/** Select the first loadable index file using the caller's suffix and error policy. */
export declare function findExtensionDirectoryIndex(dir: string, indexNames: readonly string[], options?: {
    throwUnexpectedStatErrors?: boolean;
}): string | null;
/**
 * Resolve an extension directory using manifest, index, then one-level scan
 * precedence. A declared manifest is authoritative even when none of its
 * entries resolve, so convention fallback never hides stale or missing entries.
 */
export declare function resolveExtensionDirectory(dir: string, options: ExtensionDirectoryResolutionOptions): ExtensionDirectoryResolution;
