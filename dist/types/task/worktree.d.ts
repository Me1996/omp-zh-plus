import { type NestedRepoPatch } from "@oh-my-pi/pi-tui-zh/tools/task";
import * as natives from "@oh-my-pi/pi-natives";
import type { SettingValueOf } from "../config/registry.js";
import type { cfgIsolationBackend } from "./settings.js";
declare const IsoBackendKind: typeof natives.IsoBackendKind;
type IsoBackendKind = natives.IsoBackendKind;
/** Baseline state for a single git repository. */
export interface RepoBaseline {
    repoRoot: string;
    headCommit: string;
    staged: string;
    unstaged: string;
    untracked: string[];
    untrackedPatch: string;
}
/** Baseline state for the project, including any nested git repos. */
export interface WorktreeBaseline {
    root: RepoBaseline;
    /** Nested git repos (path relative to root.repoRoot). */
    nested: Array<{
        relativePath: string;
        baseline: RepoBaseline;
    }>;
}
export declare function getRepoRoot(cwd: string): Promise<string>;
export declare function getGitNoIndexNullPath(): string;
/**
 * Ceiling on the working-tree content a single repo baseline may buffer in
 * memory. Baseline capture embeds every uncommitted byte — staged/unstaged
 * binary diffs plus a `--no-index` binary diff of each untracked file — into
 * in-memory strings (see {@link captureUntrackedPatch}). A binary diff is
 * ~1.3x the raw bytes, so a multi-GB working tree produces a single string
 * that blows past the engine's string limit and the process's memory, taking
 * the whole host down (issue #8939). `git ls-files --others
 * --exclude-standard` already omits gitignored bulk, so this only trips on
 * pathological non-ignored content; when it does we refuse the isolated spawn
 * with an actionable error instead of trapping the host.
 *
 * The staged and unstaged diffs are rendered under this budget inside the
 * native renderer (`diffText({ maxBytes })`): their size is unknowable before
 * rendering and can dwarf the working tree itself (index-vs-HEAD of a jj
 * conflict commit exported to git spans every conflict side), so the cap has
 * to stop the renderer rather than measure its output afterwards. The budget
 * bounds content, not RSS: a patch is briefly held twice while it crosses the
 * native boundary, and each nested repo is captured against its own budget.
 */
export declare const ISOLATION_BASELINE_MAX_CONTENT_BYTES: number;
/**
 * Thrown when a repo's uncommitted content exceeds the isolation-snapshot
 * budget. Surfaced verbatim so the caller can report the real cause
 * (oversized working tree) rather than masking it as a missing git repository.
 *
 * `contentBytes` is the measured total when the untracked stat pass tripped
 * the budget, and `undefined` when a staged or unstaged diff crossed it while
 * rendering — the renderer stops at the cap, so the full size is unknown.
 */
export declare class IsolationBaselineTooLargeError extends Error {
    readonly repoRoot: string;
    readonly contentBytes: number | undefined;
    readonly budgetBytes: number;
    constructor(repoRoot: string, contentBytes: number | undefined, budgetBytes?: number);
}
/**
 * Capture the baseline of `repoRoot` and every nested repo under it. Each repo
 * baseline may buffer at most `budgetBytes` of uncommitted content (the
 * isolation-snapshot budget, {@link ISOLATION_BASELINE_MAX_CONTENT_BYTES}).
 */
export declare function captureBaseline(repoRoot: string, budgetBytes?: number): Promise<WorktreeBaseline>;
/**
 * Capture the baseline of a freshly materialised isolation and rebind it to
 * the parent checkout at `repoRoot`.
 *
 * The isolation is a point-in-time copy of the parent's working tree, so its
 * own state is the only exact baseline: a baseline read from the live parent
 * before or after the copy also absorbs whatever other agents or merges wrote
 * in between, and that drift would surface as this task's changes.
 */
export declare function captureIsolationBaseline(isolationDir: string, repoRoot: string, budgetBytes?: number): Promise<WorktreeBaseline>;
export interface DeltaPatchResult {
    rootPatch: string;
    nestedPatches: NestedRepoPatch[];
}
export declare function captureDeltaPatch(isolationDir: string, baseline: WorktreeBaseline): Promise<DeltaPatchResult>;
/**
 * Apply nested repo patches directly to their working directories after parent merge.
 *
 * Pre-existing dirty state in a nested repo is stashed before the patch is
 * applied and popped back (with `--index` so staged WIP stays staged) after
 * the commit, so unrelated user edits never get folded into the agent's
 * commit. A failing `git stash pop` (e.g. user edits collide with the patched
 * lines) leaves the stash entry intact, emits a `logger.warn`, and is
 * returned to the caller as a human-readable warning string — the agent
 * commit already landed, so this is a partial success the workflow needs to
 * see, not a thrown failure.
 *
 * Returns the collected stash-restore warnings (empty when every nested repo
 * was restored cleanly). Throws when the patch apply itself fails.
 *
 * @param commitMessage Optional async function to generate a commit message from the combined diff.
 *                      If omitted or returns null, falls back to a generic message.
 */
export declare function applyNestedPatches(repoRoot: string, patches: NestedRepoPatch[], commitMessage?: (diff: string) => Promise<string | null>): Promise<string[]>;
/** User-facing backend names exposed by the `isolation.backend` setting. */
export type IsolationBackendSetting = SettingValueOf<typeof cfgIsolationBackend>;
/**
 * Translate an {@link IsolationBackendSetting} to the native backend hint.
 * `"auto"` returns `undefined`, allowing the PAL resolver to pick.
 */
export declare function parseIsolationBackend(backend: IsolationBackendSetting): IsoBackendKind | undefined;
/** Return the canonical setting label for a resolved native backend. */
export declare function formatIsolationBackend(backend: IsoBackendKind): Exclude<IsolationBackendSetting, "auto">;
export interface IsolationHandle {
    /** Merged view materialised by the backend; pass this to the task. */
    mergedDir: string;
    /** Backend the PAL actually used. */
    backend: IsoBackendKind;
    /** True when the resolver downgraded from `preferred` to `backend`. */
    fellBack: boolean;
    /** Optional reason associated with `fellBack`. */
    fallbackReason: string | null;
}
export declare function ensureIsolation(baseCwd: string, id: string, preferred?: IsoBackendKind): Promise<IsolationHandle>;
/** Tear down a handle returned by {@link ensureIsolation}. */
export declare function cleanupIsolation(handle: IsolationHandle): Promise<void>;
export interface CommitToBranchResult {
    branchName?: string;
    /** Root delta the branch was built from; lets callers detect whether a later capture changed anything. */
    rootPatch: string;
    nestedPatches: NestedRepoPatch[];
    /**
     * SHA of the parent-repo commit the task branch was created on top of, so
     * {@link mergeTaskBranches} can cherry-pick the range `baseSha..branchName`
     * and preserve every agent commit's message and author.
     */
    baseSha?: string;
}
/**
 * Capture task-only changes from the isolation worktree onto a parent-repo
 * branch named `omp/task/${taskId}`. Only root-repo changes go on the branch;
 * nested-repo patches are returned separately because the parent git can't
 * track files inside gitlinks.
 *
 * Commits are built as detached objects through temporary indexes and the
 * branch ref is written once the whole chain exists, so no checkout is ever
 * materialised and a crash mid-capture leaves no branch or worktree behind.
 *
 * If the agent committed inside isolation (HEAD moved past
 * `baseline.root.headCommit`), clean-baseline runs fetch the raw commit range
 * into the parent repo and later cherry-pick `baseSha..branchName`, preserving
 * every message and author verbatim. Dirty-baseline runs rewrite each agent
 * commit against the captured baseline WIP before committing it to the task
 * branch, so user staged/unstaged/untracked changes present at isolation
 * start are not replayed into the parent commit history.
 *
 * If the agent did not commit, the captured delta is collapsed onto a single
 * branch commit with an AI-generated (or fallback) message.
 *
 * Returns `null` when no root or nested changes exist.
 */
export declare function commitToBranch(isolationDir: string, baseline: WorktreeBaseline, taskId: string, description: string | undefined, commitMessage?: (diff: string) => Promise<string | null>): Promise<CommitToBranchResult | null>;
export interface MergeBranchResult {
    merged: string[];
    failed: string[];
    conflict?: string;
}
/**
 * Cherry-pick task branch commits sequentially onto HEAD. When `baseSha` is
 * provided the cherry-pick uses the inclusive range `baseSha..branchName`,
 * replaying every commit individually and preserving each commit's message
 * and author. When omitted, the branch is cherry-picked as a single commit
 * (legacy callers).
 *
 * The working tree is never stashed: each pick rewrites only the paths it
 * changes and is refused when one of them carries uncommitted edits, so
 * unrelated dirty files (and LFS checkouts) are left untouched.
 *
 * Stops on the first conflict and reports which branches succeeded.
 */
export declare function mergeTaskBranches(repoRoot: string, branches: Array<{
    branchName: string;
    taskId: string;
    description?: string;
    baseSha?: string;
}>): Promise<MergeBranchResult>;
/** Clean up temporary task branches. */
export declare function cleanupTaskBranches(repoRoot: string, branches: string[]): Promise<void>;
export {};
