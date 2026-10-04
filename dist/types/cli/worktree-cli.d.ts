type WorktreeKind = "pr-checkout" | "task-isolation" | "empty" | "stray";
export interface WorktreeEntry {
    /** Absolute path to the worktree dir (or stray container) under `~/.omp/wt/`. */
    path: string;
    /** Classification of what we found on disk. */
    kind: WorktreeKind;
    /** Parent repo root, when this is a registered git worktree. */
    parentRepo?: string;
    /** Branch name extracted from the parent's tracking file, when available. */
    branch?: string;
    /** When set, the entry is unhealthy and `omp worktree clear` will remove it. */
    orphanReason?: string;
}
export interface AddWorktreeOptions {
    cwd?: string;
    path: string;
    commit?: string;
    branch?: string;
    forceBranch?: string;
    detach: boolean;
    quiet: boolean;
}
export interface ListWorktreesOptions {
    json: boolean;
}
export interface ClearWorktreesOptions {
    /** Remove every entry, including live PR-checkout worktrees. */
    all: boolean;
    /** Print what would be removed without touching the filesystem. */
    dryRun: boolean;
    json: boolean;
}
/**
 * Run native teardown on a retained workspace before recursive removal.
 * Recursive `rm` through a live overlay mount destroys the preserved upper
 * layer entry by entry and then fails on the mountpoint itself (likewise a
 * Btrfs subvolume root, removable only via subvolume delete) — and mounts
 * survive the owning session, so the reclaim path (unlike teardown) cannot
 * rely on the creator to stop them. Side-effect-free without a retained-
 * backend sidecar (returns false); throws when the sidecar cannot be read
 * or teardown itself fails, so the caller skips removal instead of
 * traversing a possibly live mount — the entry is then reported failed
 * with the error, data intact.
 */
export declare function stopRetainedMount(dir: string): Promise<boolean>;
export declare function addWorktree(options: AddWorktreeOptions): Promise<void>;
export declare function listWorktrees(options: ListWorktreesOptions): Promise<void>;
export declare function clearWorktrees(options: ClearWorktreesOptions): Promise<{
    removed: number;
    failed: number;
}>;
export {};
