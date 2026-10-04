import { type BashToolDetails } from "@oh-my-pi/pi-tui-zh/tools/bash";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
import { type ServiceReady } from "../launch/services.js";
/**
 * Shape a shell command line for an ACP-conformant `terminal/create` request.
 *
 * ACP's `command` field is documented as the executable and `args` as its
 * argv tail (see https://agentclientprotocol.com/protocol/v1/terminals), so a
 * spec-conformant client `spawn(command, args)`s them directly — no implicit
 * shell. A raw `bash` tool line ("git status && echo x | head") therefore has
 * to be wrapped in an explicit shell invocation, otherwise the client tries
 * to spawn the whole line as argv[0] and fails with `ENOENT` for anything
 * containing a space, pipe, `&&`, redirect, or `$(...)`.
 *
 * The wrap reuses the same shell binary + args the local `bash-executor` would
 * pick via `settings.getShellConfig()` — Git Bash / `bash.exe` on Windows
 * (`cmd.exe /c` as the last-resort fallback when no bash exists on the host),
 * `$SHELL` (bash/zsh) with the `sh` fallback on POSIX — so the ACP path
 * preserves `bash` tool semantics (`$VAR`, `$(...)`, `source`, POSIX quoting,
 * `-l`) wherever a POSIX shell is available. The agent host's shell path is
 * used as a proxy for the client's, matching the near-universal ACP
 * deployment shape of an editor spawning omp as a co-hosted subprocess.
 */
export declare function wrapShellLineForClientTerminal(line: string, shellConfig: {
    shell: string;
    args: string[];
    prefix?: string | undefined;
}): {
    command: string;
    args: string[];
};
/**
 * Bash patterns flagged as safety critical for approval policy.
 *
 * Kept intentionally tight — the cost of a false negative is data loss or a compromised host,
 * while false positives remain actionable through user policy control.
 * New patterns should target shapes that are virtually never legitimate in automation.
 */
export declare const CRITICAL_BASH_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
declare const bashSchemaBase: import("@oh-my-pi/omptype").FluentType<{
    command: string;
    cwd?: string | undefined;
    pty?: boolean | undefined;
    timeout?: number | undefined;
}, {
    command: string;
    cwd?: string | undefined;
    pty?: boolean | undefined;
    timeout?: number | undefined;
}>;
declare const bashSchemaWithAsync: import("@oh-my-pi/omptype").FluentType<{
    async?: boolean | undefined;
    command: string;
    cwd?: string | undefined;
    pty?: boolean | undefined;
    timeout?: number | undefined;
}, {
    async?: boolean | undefined;
    command: string;
    cwd?: string | undefined;
    pty?: boolean | undefined;
    timeout?: number | undefined;
}>;
declare const bashSchemaWithService: import("@oh-my-pi/omptype").FluentType<{
    command: string;
    cwd?: string | undefined;
    name?: string | undefined;
    pty?: boolean | undefined;
    ready?: {
        host?: string | undefined;
        log?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
    } | undefined;
    timeout?: number | undefined;
}, {
    command: string;
    cwd?: string | undefined;
    name?: string | undefined;
    pty?: boolean | undefined;
    ready?: {
        host?: string | undefined;
        log?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
    } | undefined;
    timeout?: number | undefined;
}>;
declare const bashSchemaWithAsyncAndService: import("@oh-my-pi/omptype").FluentType<{
    async?: boolean | undefined;
    command: string;
    cwd?: string | undefined;
    name?: string | undefined;
    pty?: boolean | undefined;
    ready?: {
        host?: string | undefined;
        log?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
    } | undefined;
    timeout?: number | undefined;
}, {
    async?: boolean | undefined;
    command: string;
    cwd?: string | undefined;
    name?: string | undefined;
    pty?: boolean | undefined;
    ready?: {
        host?: string | undefined;
        log?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
    } | undefined;
    timeout?: number | undefined;
}>;
type BashToolSchema = typeof bashSchemaBase | typeof bashSchemaWithAsync | typeof bashSchemaWithService | typeof bashSchemaWithAsyncAndService;
export interface BashToolInput {
    command: string;
    timeout?: number;
    cwd?: string;
    name?: string;
    ready?: ServiceReady;
    async?: boolean;
    pty?: boolean;
}
export interface BashToolOptions {
}
/**
 * Bash tool implementation.
 *
 * Executes bash commands with optional timeout and working directory.
 */
export declare class BashTool implements AgentTool<BashToolSchema, BashToolDetails> {
    #private;
    private readonly session;
    readonly name = "bash";
    /** Bash reads `skill://` paths through its shell filesystem, including as a working directory. */
    readonly readsSkillUris = true;
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly formatApprovalDetails: (args: unknown) => string[];
    readonly label = "Bash";
    readonly loadMode = "essential";
    get description(): string;
    /** Schema variant for the live `async.enabled` and `launch.enabled` settings. */
    get parameters(): BashToolSchema;
    readonly concurrency: (args: Partial<BashToolInput>) => "shared" | "exclusive";
    readonly strict = true;
    constructor(session: ToolSession);
    execute(_toolCallId: string, { command: rawCommand, timeout: rawTimeout, cwd, name: rawName, ready: rawReady, async: rawAsync, pty, }: BashToolInput, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<BashToolDetails>, ctx?: AgentToolContext): Promise<AgentToolResult<BashToolDetails>>;
}
export {};
