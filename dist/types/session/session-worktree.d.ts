import type { IsoBackendKind } from "@oh-my-pi/pi-natives";
import type { Settings } from "../config/settings.js";
export interface SessionWorktree {
    /** Absolute, realpath'd worktree root. */
    path: string;
    /** Branch checked out in the worktree (created from the source `HEAD`). */
    branch: string;
    /** Backend that cloned the checkout, or undefined for a plain checkout. */
    clonedWith?: IsoBackendKind;
    /** Why the clone fell back to a plain checkout, when it did. */
    cloneError?: string;
}
/** Default `/wt` branch name: `wt/<yyyymmdd-hhmmss>`. */
export declare function defaultSessionWorktreeBranch(now?: Date): string;
/** One-line confirmation shown after the session moved into `worktree`. */
export declare function formatSessionWorktreeSummary(worktree: SessionWorktree, sourceCleaned?: boolean): string;
/**
 * If `worktree.cleanSource` is enabled, resets and cleans the source checkout.
 * Catches git errors and returns `{ cleaned: true }` on success, or `{ cleaned: false, errorMessage }` on failure.
 */
export declare function cleanSourceCheckoutIfConfigured(sourceCwd: string, settings: Settings): Promise<{
    cleaned: boolean;
    errorMessage?: string;
}>;
/**
 * Create the worktree for `/wt`. Throws with a user-facing message when `cwd`
 * is not a git checkout, `branch` already exists, or git refuses.
 */
export declare function createSessionWorktree(cwd: string, settings: Settings, branch: string): Promise<SessionWorktree>;
