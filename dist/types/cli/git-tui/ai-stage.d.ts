import type { ChangedFile } from "@oh-my-pi/pi-tui-zh/apps/git/state";
import type { AiStageOutcome } from "@oh-my-pi/pi-tui-zh/apps/git/git-tui";
/** Options for {@link aiStage}. */
export interface AiStageOptions {
    cwd: string;
    /** The user's natural-language description of what to stage. */
    instruction: string;
    /** Unstaged sidebar entries; conflicted files are skipped. */
    files: readonly Pick<ChangedFile, "path" | "kind">[];
    signal?: AbortSignal;
    onProgress?: (message: string) => void;
}
/**
 * Filter the unstaged tree against `instruction` with the resolved judge and
 * stage the matching units. Called by the git TUI's unstaged-header wand pill.
 * @throws when no judge resolves, git fails, the run is aborted, or every judgment errors.
 */
export declare function aiStage(options: AiStageOptions): Promise<AiStageOutcome>;
