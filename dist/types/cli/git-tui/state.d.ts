import { type ChangedFile, type HeadCommit, type FileContents, type FileStreamUpdate } from "@oh-my-pi/pi-tui-zh/apps/git/state";
/**
 * Repository state backing the git TUI. `refresh()` re-reads everything and
 * returns whether the observable state changed since the previous refresh.
 */
export declare class GitModel {
    #private;
    readonly cwd: string;
    /** Resolved SHA when the TUI is pinned to one commit (`omp git <rev>`). */
    readonly pinnedSha: string | null;
    branch: string | null;
    unstaged: ChangedFile[];
    staged: ChangedFile[];
    headCommit: HeadCommit | null;
    constructor(cwd: string, options?: {
        pinnedSha?: string;
    });
    /** True when the working tree and index carry no changes. */
    get clean(): boolean;
    /** Re-read fast repository state; expensive numstats load separately. */
    refresh(): Promise<boolean>;
    /** Populate changed-line counts after the file list is already interactive. */
    loadChangeStats(): Promise<boolean>;
    /** Load changed-file details for the clean commit view without delaying initial paint. */
    loadHeadFiles(): Promise<boolean>;
    /** Stream old/new sources concurrently, emitting complete lines as they arrive. */
    streamContents(file: ChangedFile, onProgress: (update: FileStreamUpdate) => void, signal?: AbortSignal): Promise<FileContents>;
    /** Stage the given files (or everything when omitted). */
    stage(files?: readonly ChangedFile[]): Promise<void>;
    /** Unstage the given files (or everything when omitted). */
    unstage(files?: readonly ChangedFile[]): Promise<void>;
    /**
     * Throw away the given files' changes. Unstaged entries revert the
     * worktree to the index (untracked files are deleted); staged entries
     * reset both index and worktree to HEAD, which also drops any unstaged
     * edits on the same path. Conflicted entries are skipped.
     */
    discard(files: readonly ChangedFile[]): Promise<void>;
    /** Create (or amend) a commit from the staged changes. */
    commit(message: string, options?: {
        amend?: boolean;
    }): Promise<void>;
    /** Apply a patch to the index (`cached`) and/or worktree; `reverse` undoes it. */
    applyPatch(patchText: string, options?: {
        cached?: boolean;
        reverse?: boolean;
    }): Promise<void>;
}
