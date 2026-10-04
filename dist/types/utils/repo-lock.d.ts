/**
 * Serialize an async block that mutates a git repository against other
 * in-process callers operating on the same repository. Keyed by the primary
 * repo root so worktrees of the same repo share one queue. A failing block
 * does not poison the queue for the next caller.
 *
 * Not reentrant: do NOT nest acquisitions for the same repo.
 */
export declare function withRepoLock<T>(cwd: string, fn: () => Promise<T>, signal?: AbortSignal): Promise<T>;
