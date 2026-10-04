/**
 * Rewrites supported `git worktree add` shell segments through omp so worktree
 * creation uses clone-first materialization. Unsupported shell syntax and git
 * flags are deliberately left for git to handle unchanged.
 */
export declare function rewriteGitWorktreeAdd(command: string, ompCmd: readonly string[]): string;
