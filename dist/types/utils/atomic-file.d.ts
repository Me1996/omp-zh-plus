/**
 * Publish a staged sibling file atomically, preserving an existing destination
 * across Windows `EPERM`/`EEXIST` replacement failures.
 */
export declare function replaceFileAtomically(tempPath: string, targetPath: string): Promise<void>;
/**
 * Move a live file across devices without exposing a partial destination.
 * The source remains authoritative while the copy is staged. Publication and
 * source removal are synchronous so in-process writers cannot land between them.
 */
export declare function moveFileAcrossDevices(source: string, destination: string): Promise<void>;
