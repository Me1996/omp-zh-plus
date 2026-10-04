import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type MinimizerOptions, type ShellFilesystem } from "@oh-my-pi/pi-natives";
import { type OutputArtifactError } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import { type ShellMinimizerSettings } from "./settings.js";
export interface BashExecutorOptions {
    cwd?: string;
    /** Milliseconds before aborting the command; 0 disables the executor deadline. */
    timeout?: number;
    onChunk?: (chunk: string) => void;
    chunkThrottleMs?: number;
    signal?: AbortSignal;
    /** Session key suffix to isolate shell sessions per agent */
    sessionKey?: string;
    /** Additional environment variables to inject */
    env?: Record<string, string>;
    /** Run through the configured user shell instead of brush parsing directly. */
    useUserShell?: boolean;
    /** Run supported user shells (zsh/fish) on a headless PTY; requires `useUserShell`. */
    pty?: BashPtyOptions;
    /**
     * Filesystem for `scheme://` paths in this run of the embedded shell (a URL
     * `cwd` included). External shells and processes never see it.
     */
    filesystem?: ShellFilesystem;
    /**
     * Invoked once the embedded shell starts the command, with a probe of the
     * live pids it spawned (empty once the run ends). Not called on the
     * user-shell paths.
     */
    onStart?: (pids: () => readonly number[]) => void;
    /** Artifact path/id for full output storage */
    artifactPath?: string;
    artifactId?: string;
    /**
     * Invoked when the native minimizer rewrote the command's output, giving
     * the caller a chance to persist the lossless original capture (typically
     * via the session's `ArtifactManager`). The returned id is spliced into
     * the sink output as `artifact://<id>` so the agent can retrieve the raw
     * bytes. Return `undefined` to skip the footer.
     */
    onMinimizedSave?: (originalText: string, info: {
        filter: string;
        inputBytes: number;
        outputBytes: number;
    }) => Promise<string | undefined>;
}
/** Viewport + raw-output callback enabling the user-shell PTY path (`!` hotkey). */
export interface BashPtyOptions {
    cols: number;
    rows: number;
    /** Receives raw PTY bytes (ANSI intact) for virtual-terminal rendering. */
    onChunk: (chunk: string) => void;
}
export interface BashResult {
    output: string;
    exitCode: number | undefined;
    cancelled: boolean;
    /** True when the command was killed by its timeout deadline (not a user abort). */
    timedOut?: boolean;
    truncated: boolean;
    totalLines: number;
    totalBytes: number;
    outputLines: number;
    outputBytes: number;
    artifactId?: string;
    /** Bytes the artifact cap dropped from the saved file's middle (the artifact is a head/tail sample). */
    artifactElidedBytes?: number;
    artifactError?: OutputArtifactError;
    workingDir?: string;
    /** Terminal graphics extracted from raw stdout before sanitization or truncation. */
    images?: ImageContent[];
}
export interface DirenvPreflightOptions {
    /** Caller-supplied env overlay; these values win over direnv-provided ones. */
    callerEnv?: Record<string, string>;
    signal?: AbortSignal;
    /** Full direnv-load budget (`bash.direnvLoadTimeoutMs`). A positive
     *  `callerTimeoutMs` clamps the effective load below this; `0`/undefined
     *  leaves the full budget. */
    timeoutMs?: number;
    /** The caller's command deadline (ms). A positive value clamps the direnv
     *  load so a cold `.envrc` can't outlast a short-timeout command; `0` or
     *  undefined means "no caller clamp" — the load keeps its full `timeoutMs`
     *  budget (a disabled command deadline is NOT a 0 ms load). Centralizing the
     *  clamp here keeps every backend (executeBash, ACP terminal, PTY) on one
     *  contract instead of each re-deriving it. */
    callerTimeoutMs?: number;
    /** `bash.direnv` setting — `"off"` skips the load entirely. */
    direnvSetting: "auto" | "off";
    /** Shell wrapper prefix (profiler/strace) to place *after* the unset prefix,
     *  matching `executeBash`'s ordering. Backends that apply their own shell
     *  wrapping (ACP `wrapShellLineForClientTerminal`) omit this. */
    commandPrefix?: string | undefined;
}
/**
 * Load the repo's direnv/devenv env and fold it into a `(command, env)` pair so
 * every bash backend (one-shot `executeBash`, ACP client terminal, PTY) exposes
 * the same devenv tools. Encapsulates: load the diff, merge `set` under the
 * caller's overlay (caller wins), and prepend a regex-gated `unset -v` for
 * variables the `.envrc` removes (skipping any the caller re-supplied).
 *
 * Returns the possibly-prefixed command plus the merged env, or the inputs
 * unchanged (`env` = `callerEnv`) when direnv is off, absent, or has no `.envrc`.
 * Pure transform: does NOT layer non-interactive env defaults — that stays the
 * caller's job (so interactive PTY/ACP paths keep their own env shape).
 */
export declare function applyDirenvPreflight(command: string, cwd: string, opts: DirenvPreflightOptions): Promise<{
    command: string;
    env: Record<string, string> | undefined;
}>;
/**
 * Drops every persistent Shell owned by an agent session (keys built with
 * `agentSessionKey` as the {@link BashExecutorOptions.sessionKey}). The map is
 * process-global, so without this each disposed session keeps its native shell
 * for the life of the process. A Shell with live background jobs is retained
 * until they exit, matching the `:async:` teardown; an in-flight run keeps its
 * own reference and drops the Shell when it settles.
 */
export declare function releaseShellSessions(agentSessionKey: string | undefined): void;
/** Translate `ShellMinimizerSettings` into native `MinimizerOptions`, or `undefined` when disabled. */
export declare function buildMinimizerOptions(group: ShellMinimizerSettings): MinimizerOptions | undefined;
export declare function isPersistentShellCdCommand(command: string): boolean;
export declare function executeBash(command: string, options?: BashExecutorOptions): Promise<BashResult>;
