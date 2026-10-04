import type { TUI } from "@oh-my-pi/pi-tui-zh";
/** Repository selection for the git command and overlay. */
export interface GitTuiOptions {
    cwd?: string;
    /** Pin the view to one commit (any rev-parse-able revision). */
    revision?: string;
}
/** Open repository review on an existing interactive session. */
export declare function showGitOverlay(ui: TUI, options?: GitTuiOptions): Promise<void>;
/** Run standalone repository review with application-owned capabilities. */
export declare function runGitTui(options?: GitTuiOptions): Promise<void>;
