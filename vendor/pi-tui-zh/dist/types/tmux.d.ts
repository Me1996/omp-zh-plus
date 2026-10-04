/** Whether the process is running inside a tmux session. */
export declare function isInsideTmux(env?: NodeJS.ProcessEnv): boolean;
/** Wrap a control sequence in tmux's DCS passthrough envelope. */
export declare function wrapTmuxPassthrough(payload: string): string;
/** Pass a control sequence through tmux, leaving direct-terminal output unchanged. */
export declare function wrapTmuxPassthroughIfNeeded(payload: string, env?: NodeJS.ProcessEnv): string;
/**
 * Resolve the terminal emulator name recorded for this tmux client.
 *
 * tmux overwrites pane identity variables with its own values, but retains the
 * attached client's terminal-type reply in `#{client_termtype}`. The local IPC
 * query runs once per process and degrades to `null` when unavailable.
 */
export declare function resolveTmuxClientTerminalName(env?: NodeJS.ProcessEnv): string | null;
