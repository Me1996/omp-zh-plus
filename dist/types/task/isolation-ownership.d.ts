/** Marker file written into a task-isolation base dir identifying its owner. */
export declare const ISOLATION_OWNER_FILE = ".omp-isolation-owner.json";
/** Recorded owner of a task-isolation sandbox. */
export interface IsolationOwner {
    /** PID of the omp process that created and owns the sandbox. */
    pid: number;
    /** Task id the sandbox was materialised for. */
    id: string;
    /**
     * Process-instance start-time token for {@link pid}, when the OS can report
     * it. Distinguishes the owning process from an unrelated process that later
     * inherits a recycled pid, so a crashed sandbox is never pinned live.
     */
    startToken?: string;
}
/**
 * Record the current process as owner of the sandbox rooted at `baseDir`.
 *
 * Written before the isolation backend materialises `m` so a concurrent
 * `omp worktree clear` never sees an owner-less sandbox mid-creation.
 */
export declare function writeIsolationOwner(baseDir: string, id: string): Promise<void>;
/**
 * Whether a live omp process still owns the sandbox at `baseDir`.
 *
 * A missing or malformed marker means no verifiable owner — a crashed run or a
 * sandbox from before markers existed, both safe to reclaim. `process.kill(pid,
 * 0)` can fail with `EPERM` even when the process is alive, so only an explicit
 * `ESRCH` ("no such process") counts as dead; any other error is treated as
 * alive to avoid deleting a sandbox that is actually in use. When the marker
 * carries a {@link IsolationOwner.startToken}, a live pid whose current token no
 * longer matches is a recycled pid — a different process — and counts as dead.
 */
export declare function hasLiveIsolationOwner(baseDir: string): Promise<boolean>;
/** Sidecar recording the native-teardown backend of a retained workspace. */
export declare const RETAINED_BACKEND_FILE = ".omp-retained-backend.json";
/**
 * Backends whose workspaces `omp worktree clear` must not remove with plain
 * recursive `rm`, but route through native `isoStop` teardown instead:
 * mounts (overlayfs, projfs), where `rm` destroys the preserved layer and
 * fails on the mountpoint, and Btrfs subvolumes, whose root is only removable
 * via subvolume delete (its `stop` falls back to plain `rm` for ordinary
 * dirs, so routing it is always safe). Plain-copy and reflink backends need
 * no teardown — and their `stop` routines delete data themselves, so they
 * must never be routed through it.
 *
 * Notably absent: ZFS clones also need dataset-aware teardown, but `isoStop`
 * locates the dataset by its recorded mountpoint property, which no longer
 * matches after the retain rename — that needs pi-iso mount-table support
 * before a sidecar here could help.
 */
export declare function needsNativeTeardown(backend: unknown): backend is number;
/**
 * Record which backend built a retained workspace, so cleanup can route it
 * through native teardown before removal. Best-effort: retention stays valid
 * without it (the workspace merely falls back to plain recursive removal).
 */
export declare function writeRetainedBackend(baseDir: string, backend: number): Promise<void>;
/**
 * Backend recorded for a retained workspace when it needs native teardown
 * before remove. `undefined` only when no sidecar exists. Any other read
 * problem (permissions, I/O, malformed JSON) throws instead of reading as
 * absent: the workspace may be a live mount whose guard must not be silently
 * bypassed — the caller then leaves it in place rather than removing through
 * the mount. A well-formed record for a backend needing no teardown keeps
 * today's removal behavior.
 */
export declare function readRetainedMountBackend(dir: string): Promise<number | undefined>;
