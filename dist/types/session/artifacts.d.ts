/**
 * Persist an artifact only when the filesystem confirms the complete payload is
 * readable, then swap it into place atomically.
 *
 * Content is staged to a temporary sibling and verified (byte count, on-disk
 * size, readability) before an atomic `rename` publishes it. `agent://<id>`
 * discovers `${id}.md` by scanning the artifacts directory rather than reading
 * `result.outputPath`, so a direct in-place write that fell short would leave a
 * truncated file resolvable as incomplete output and a failed follow-up write
 * would destroy the prior valid artifact. Staging keeps both hazards out: on
 * any failure the temp file is removed and the existing artifact at `path` is
 * untouched.
 *
 * Returns the verified UTF-8 byte count.
 */
export declare function writeArtifact(path: string, content: string): Promise<number>;
/**
 * Manages artifact storage for a session.
 *
 * Artifacts are stored with sequential IDs in the session's artifact directory.
 * The directory is created lazily on first write.
 *
 * Subagents do not own their own `ArtifactManager`. The parent's instance is
 * adopted via `SessionManager.adoptArtifactManager`, so the whole parent +
 * subagent tree shares one ID space and one directory.
 */
export declare class ArtifactManager {
    #private;
    /**
     * @param dir Directory that will hold artifact files. Created lazily on first save.
     * @param ready Settles once `dir` is seeded (a session move copying the previous
     *   session's artifacts in the background). Id scans and lookups wait for it,
     *   so new ids never collide with copied ones. Must not reject.
     */
    constructor(dir: string, ready?: Promise<void>);
    /**
     * Artifact directory path.
     * Directory may not exist until first artifact is saved.
     */
    get dir(): string;
    /**
     * Atomically allocate next artifact ID.
     * IDs are sequential within the session.
     */
    allocateId(): number;
    /**
     * Allocate a new artifact path and ID without writing content.
     *
     * @param toolType Tool name for file extension (e.g., "bash", "read")
     */
    allocatePath(toolType: string): Promise<{
        id: string;
        path: string;
    }>;
    /**
     * Save content as an artifact and return the artifact ID.
     *
     * @param content Full content to save
     * @param toolType Tool name for file extension (e.g., "bash", "read")
     * @returns Artifact ID (numeric string)
     */
    save(content: string, toolType: string): Promise<string>;
    /**
     * Check if an artifact exists.
     * @param id Artifact ID (numeric string)
     */
    exists(id: string): Promise<boolean>;
    /**
     * List all artifact files in the directory.
     * Returns empty array if directory doesn't exist.
     */
    listFiles(): Promise<string[]>;
    /**
     * Get the full path to an artifact file.
     * Returns null if artifact doesn't exist.
     *
     * @param id Artifact ID (numeric string)
     */
    getPath(id: string): Promise<string | null>;
}
