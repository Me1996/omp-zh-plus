import type * as natives from "@oh-my-pi/pi-natives";
import type { ToolSession } from "../tools/index.js";
import type { ExecutorOptions } from "./executor.js";
import type { NestedRepoPatch, SingleResult } from "@oh-my-pi/pi-tui-zh/tools/task";
type IsoBackendKind = natives.IsoBackendKind;
/** Which isolation outcome `isolation-summary.md` should describe. */
export type IsolationSummaryKind = "captured" | "capture-error" | "nested-apply-failed" | "not-applied" | "branch-merge-failed" | "branch-capture-failed" | "merge-error";
/** Context for `isolation-summary.md`; unused fields are simply absent. */
export interface IsolationSummaryContext {
    kind: IsolationSummaryKind;
    branchName?: string;
    /** Root patch path, only when it holds changes. */
    rootPatchPath?: string;
    nestedCount?: number;
    nestedPatchPaths?: string[];
    error?: string;
    conflict?: string;
}
/**
 * Render one isolation outcome as the model-facing suffix appended to a task
 * result. Always starts with a blank line so it separates from the output it
 * follows.
 */
export declare function renderIsolationSummary(context: IsolationSummaryContext): string;
/** Resolved repo shared by every isolated spawn in a single call. */
export interface IsolationContext {
    repoRoot: string;
}
/**
 * Resolve the git repo root isolated spawns are copied from and merged back
 * into. Throws when the cwd is not inside a git repository; callers surface
 * the error as a task-tool failure. Each spawn captures its own baseline from
 * its isolation copy (see {@link captureIsolationBaseline}).
 */
export declare function prepareIsolationContext(cwd: string): Promise<IsolationContext>;
/** Build a commit-message callback for branch/nested commits; `undefined` ⇒ fall back to generic message. */
export type BuildCommitMessage = () => undefined | ((diff: string) => Promise<string | null>);
/**
 * Construct the commit-message factory used by isolation branch commits and
 * nested-repo patch commits. Returns a closure that, each time it's called,
 * either yields an AI-backed `(diff) => Promise<string|null>` callback (when
 * `task.isolation.commits === "ai"` and a model registry is available) or
 * `undefined` so the caller falls back to a generic commit message.
 *
 * Centralized so `TaskTool` and the eval `agent()` bridge share one wiring;
 * a drift here previously meant the two callers built subtly different
 * generators for the same setting.
 */
export declare function makeIsolationCommitMessage(session: ToolSession): BuildCommitMessage;
export interface IsolatedRunOptions {
    /**
     * Base run options handed to the subagent subprocess. This helper sets
     * `worktree`, clears prepared/path extension preloads and custom-tool paths
     * (isolated runs re-discover inside the worktree), and forwards everything
     * else unchanged.
     */
    baseOptions: ExecutorOptions;
    /** Context returned by {@link prepareIsolationContext}. */
    context: IsolationContext;
    /** PAL backend hint from `parseIsolationBackend(...)` (undefined ⇒ resolver picks). */
    preferredBackend: IsoBackendKind | undefined;
    /** Stable id used as the isolation worktree namespace and as the branch suffix. */
    agentId: string;
    /** Merge mode driving how changes are captured ("branch" commits, "patch" diffs). */
    mergeMode: "patch" | "branch";
    /** Output dir for `${agentId}.patch` artifacts (patch mode and branch-mode commit failures). */
    artifactsDir: string;
    /** Human description carried onto the branch commit (branch mode). */
    description?: string;
    /** Build a commit-message callback (`task.isolation.commits === "ai"`). */
    buildCommitMessage?: BuildCommitMessage;
    /**
     * Construct a `SingleResult` when isolation setup throws — the caller has
     * the full metadata (index, agent, assignment, modelOverride) needed to
     * build a result shape consistent with their non-isolated path.
     */
    buildFailureResult: (err: unknown) => SingleResult;
    /** Observe the real child result before post-run isolation work. */
    onSubprocessResult?: (result: SingleResult) => void;
}
/**
 * Write each nested-repo patch to `${artifactsDir}/${agentId}.nested-<n>-<path>.patch`
 * and return the paths. Throws on the first write failure: the caller must
 * then keep the isolation workspace alive, because it is the only other copy.
 * Every attempted destination is removed best-effort on failure — including
 * the in-progress file, which `Bun.write` may have created or truncated
 * before rejecting — so a half-written set cannot be mistaken for the
 * complete capture by the persisted-agent scanner.
 */
export declare function persistNestedPatches(artifactsDir: string, agentId: string, nestedPatches: readonly NestedRepoPatch[]): Promise<string[]>;
/**
 * Move a retained isolation workspace out of its deterministic
 * (`repoRoot` + agent id) slot into a globally unique sibling, so a later
 * isolated run with the same id cannot wipe it: `ensureIsolation`
 * unconditionally removes the deterministic base dir before writing its
 * owner marker. The owner marker, `m` mount, and backend sidecar move along,
 * so `omp worktree clear` still classifies and reclaims the workspace with
 * native teardown. Backends needing it (mounts, Btrfs subvolumes) record the
 * sidecar BEFORE the move so it travels atomically — a crash between rename
 * and a later write would leave a mounted workspace with a dead owner and
 * no metadata, and cleanup would traverse the live mount.
 */
export interface RetainedWorkspace {
    /** Workspace path to report (unique sibling on success, original dir when the move fails). */
    dir: string;
    /**
     * False when cleanup metadata is missing that `clear` would need: the
     * sidecar could not be written (plausible under the same disk pressure
     * that forced retention). The error must then say the mount needs a
     * manual unmount instead of advertising plain `worktree clear`.
     */
    sidecarOk: boolean;
}
export declare function retainIsolationWorkspace(isolationDir: string, backend?: natives.IsoBackendKind): Promise<RetainedWorkspace>;
/**
 * Run a subagent inside an isolation worktree and capture its changes.
 *
 * Branch mode: on success, commits the diff onto `omp/task/${agentId}` and
 * returns `branchName` + `nestedPatches` (+ `nestedPatchPaths`). On commit
 * failure the still-live isolation diff is written to
 * `${artifactsDir}/${agentId}.patch`, the task branch is kept when it already
 * carries commits (deleted otherwise), and `result.error` carries the
 * merge-failure message plus recovery hint.
 *
 * Patch mode: on success, writes `${artifactsDir}/${agentId}.patch` plus one
 * `${agentId}.nested-<n>-<path>.patch` per nested repo and returns
 * `patchPath` + `nestedPatches` + `nestedPatchPaths`.
 *
 * Failure paths preserve the underlying `SingleResult` whenever possible so
 * the caller can still surface the subagent's output; only isolation setup
 * itself routes through {@link IsolatedRunOptions.buildFailureResult}.
 *
 * Kept-alive runs retain the isolation handle through idle/parked lifecycle
 * transitions, then capture final changes and clean up on release. One-shot
 * and failed startup paths clean up in `finally`. If captured changes cannot
 * be written to disk, the workspace is retained under a unique `.retained-*`
 * sibling and its path is named in the resulting error.
 */
export declare function runIsolatedSubprocess(opts: IsolatedRunOptions): Promise<SingleResult>;
export interface IsolationMergeOptions {
    result: SingleResult;
    repoRoot: string;
    mergeMode: "patch" | "branch";
}
export interface IsolationMergeOutcome {
    /** Trailing summary appended to the subagent's result text. May be empty. */
    summary: string;
    /**
     * Tri-state apply outcome:
     * - `true`  — merge ran (or had nothing to apply) and left the repo clean.
     * - `false` — merge attempted and failed; artifacts are preserved.
     * - `null`  — caller skipped the merge phase entirely (e.g. `apply=false`).
     */
    changesApplied: boolean | null;
    hadAnyChanges: boolean;
    /** True iff the root branch actually merged — gates nested-repo patch application. */
    mergedBranchForNestedPatches: boolean;
}
/**
 * Apply changes captured by {@link runIsolatedSubprocess} back to the parent
 * repo: patch apply (patch mode) or cherry-pick + cleanup (branch mode).
 *
 * The caller decides whether to run this at all — eval `agent()` with
 * `apply=False` skips this step and surfaces the patch artifact / branch name
 * instead.
 */
export declare function mergeIsolatedChanges(opts: IsolationMergeOptions): Promise<IsolationMergeOutcome>;
export interface NestedPatchApplyOptions {
    /** Subagent result carrying `nestedPatches`/`exitCode`/`aborted`. */
    result: SingleResult;
    repoRoot: string;
    mergeMode: "patch" | "branch";
    /** Parent merge outcome — patch mode skips nested apply when this is `false`. */
    changesApplied: boolean | null;
    /** Branch mode gates nested apply on whether the root branch merged. */
    mergedBranchForNestedPatches: boolean;
    /** Optional AI commit-message callback for nested commits; falls back to a generic message. */
    commitMessage?: (diff: string) => Promise<string | null>;
}
/**
 * Apply nested-repo patches after the parent merge phase. Centralizes the
 * three-way gate (exitCode/aborted, patch-mode failed parent, branch-mode
 * branch-merged) and the non-fatal failure handling so `TaskTool` and the
 * eval `agent()` bridge use one implementation.
 *
 * Returns a system-notification suffix to append to the parent merge summary,
 * or an empty string when nothing was applied or the nested apply succeeded.
 */
export declare function applyEligibleNestedPatches(opts: NestedPatchApplyOptions): Promise<string>;
export {};
