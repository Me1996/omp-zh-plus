import type { ResolveContext } from "../internal-urls/types.js";
/**
 * Creates a deduplicating recorder for relative file paths.
 * Preserves insertion order in `list`; subsequent duplicates are ignored.
 */
export declare function createFileRecorder(): {
    record: (relativePath: string) => void;
    list: string[];
};
/**
 * Display path of a native search result: URL results as-is, else native
 * virtual-root prefixes stripped and the result joined onto `basePath` (a host
 * directory or URL), relative to cwd when inside it. Paths outside cwd remain absolute.
 */
export declare function formatResultPath(filePath: string, isDirectory: boolean, basePath: string, cwd: string): string;
/**
 * Host file a hashline snapshot for the displayed result `resultPath` binds to:
 * cwd-resolved host paths, and the located backing file of a mutable
 * file-backed URL (`local://`). Undefined for immutable schemes and URLs
 * without a local file, whose results must not mint edit anchors.
 */
export declare function resultSnapshotPath(resultPath: string, cwd: string, context: ResolveContext): Promise<string | undefined>;
