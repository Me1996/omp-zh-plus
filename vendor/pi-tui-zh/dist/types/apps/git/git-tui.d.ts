/**
 * `omp git` — fullscreen repository TUI.
 *
 * Layout: header (file path, encoding, stage-file button, close), toolbar
 * (scope chip, file/diff toggle, hunk navigation, hunk/inline/split view
 * buttons, whitespace + word-wrap toggles), center diff pane with a minimap
 * scrollbar, right sidebar (file management + commit form while dirty, HEAD
 * commit details with author avatar when clean). Submitting an empty commit
 * form generates an llm-git-compatible message; submitting populated fields
 * commits them. A footer shows key hints.
 *
 * `tab` moves focus between the diff and the sidebar; both panes take
 * arrows/PgUp/PgDn, vim motions (`j`/`k`/`h`/`l`/`g`/`G`), and mouse
 * clicks/wheel. All toolbar buttons are clickable and mirrored by keys:
 * `v` cycles the view (`1`–`4` pick one), `alt+↓`/`alt+↑` jump hunks and roll
 * into the adjacent file at the edges, `]`/`[` switch files, `s`/`u`
 * stage/unstage (hunk-aware), `x` discards a hunk, `delete` discards the
 * whole file (press twice to confirm), `w` wraps, `b` cycles
 * whitespace handling (exact → ignore whitespace → ignore
 * formatting/import-only changes), `c` jumps to the commit form, `r`
 * refreshes. In the sidebar tree `←`/`→` collapse/expand directories,
 * `enter` opens the selected file in the diff pane, `space` stages or
 * unstages the selected row, and `delete` discards it — on a directory,
 * every file underneath it.
 */
import { TUI } from "../../tui.js";
import type { AvatarSource } from "./avatar.js";
import { type GitCommitMessage } from "./sidebar.js";
import type { ChangedFile, GitTuiModel } from "./state.js";
/** AI staging counts displayed after filtering the working tree. */
export interface AiStageOutcome {
    matchedFiles: number;
    totalFiles: number;
    stagedHunks: number;
    totalHunks: number;
    wholeFiles: number;
}
/** Repository, avatar, and generation capabilities owned by the command host. */
export interface GitTuiHost {
    model: GitTuiModel;
    createAvatarSource(onReady: () => void): AvatarSource;
    aiStage(options: {
        cwd: string;
        instruction: string;
        files: readonly Pick<ChangedFile, "path" | "kind">[];
        signal?: AbortSignal;
        onProgress?: (message: string) => void;
    }): Promise<AiStageOutcome>;
    generateCommitMessage(options: {
        cwd: string;
        stageIfEmpty: boolean;
        signal?: AbortSignal;
        onProgress?: (message: string) => void;
    }): Promise<{
        commit: GitCommitMessage;
        validationError?: string | null;
        stagedAll: boolean;
    }>;
}
/**
 * Mount the git TUI as a fullscreen overlay on an existing TUI (the `/git`
 * slash command). Resolves when the user closes it; the caller restores focus.
 */
export declare function showGitOverlay(ui: TUI, host: GitTuiHost): Promise<void>;
/** Run the fullscreen git TUI standalone (`omp git`) until the user quits. */
export declare function runGitTui(host: GitTuiHost): Promise<void>;
