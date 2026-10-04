/** Captured result of a completed `gh` invocation. */
export interface GhCommandResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}
/** Options shaping `gh` failure messages and output handling. */
export interface GhCommandOptions {
    /** Caller passed an explicit repo; suppresses "run inside a checkout" hints. */
    repoProvided?: boolean;
    /** Trim captured output (default true). */
    trimOutput?: boolean;
}
/** Deadline for `gh` subprocesses spawned by the coding agent. */
export declare const GH_COMMAND_TIMEOUT_MS: number;
/** The sanctioned `gh` CLI runner: non-interactive env, bounded capture, deadline. */
export declare const github: {
    /** Check if the `gh` CLI is installed. */
    available(): boolean;
    /** Run a raw `gh` CLI command. Does not throw on non-zero exit. */
    run(cwd: string, args: string[], signal?: AbortSignal, options?: GhCommandOptions): Promise<GhCommandResult>;
    /** Run `gh` and parse stdout as JSON. Throws on non-zero exit or invalid JSON. */
    json<T>(cwd: string, args: string[], signal?: AbortSignal, options?: GhCommandOptions): Promise<T>;
    /** Run `gh` and return stdout as text. Throws on non-zero exit. */
    text(cwd: string, args: string[], signal?: AbortSignal, options?: GhCommandOptions): Promise<string>;
};
