import type { OutputArtifactError } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import type { ToolSession } from "../../tools/index.js";
import type { JsStatusEvent } from "../js/shared/types.js";
import type { EvalToolDescriptor, EvalToolInvokeResult } from "../types.js";
import type { PythonShadowPlan, PythonShadowSnapshot } from "./kernel.js";
import { type KernelDisplayOutput, type KernelExecuteOptions, type KernelExecuteResult, type PythonPreludeSource } from "./kernel.js";
export type PythonKernelMode = "session" | "per-call";
/** Raw request sent to a retained Python kernel's tool registry. */
export type PythonToolRequest = {
    op: "describe";
    names: string[];
} | {
    op: "call";
    name: string;
    args: Record<string, unknown>;
};
/** Session identity and bridge context for invoking a retained Python tool. */
export interface PythonToolInvokeOptions {
    cwd: string;
    sessionId: string;
    interpreter?: string;
    kernelOwnerId?: string;
    toolSession: ToolSession;
    signal?: AbortSignal;
}
export interface PythonExecutorOptions {
    /** Working directory for command execution */
    cwd?: string;
    /** Source filename for file-backed execution and tracebacks. */
    filename?: string;
    /** Timeout in milliseconds */
    timeoutMs?: number;
    /** Absolute wall-clock deadline in milliseconds since epoch */
    deadlineMs?: number;
    /**
     * Runtime-work budget (ms). Used only for timeout-annotation text when the
     * caller drives cancellation via the eval watchdog `signal` instead of a
     * wall-clock `deadlineMs`/`timeoutMs`. Does not arm a timer.
     */
    idleTimeoutMs?: number;
    /** Callback for streaming output chunks (already sanitized) */
    onChunk?: (chunk: string) => Promise<void> | void;
    /** AbortSignal for cancellation */
    signal?: AbortSignal;
    /** Session identifier for kernel reuse */
    sessionId?: string;
    /** Logical owner identifier for retained kernel cleanup */
    kernelOwnerId?: string;
    /** Kernel mode (session reuse vs per-call) */
    kernelMode?: PythonKernelMode;
    /**
     * Explicit interpreter path (`python.interpreter` resolved from the
     * session's settings). Skips automatic runtime discovery when set.
     */
    interpreter?: string;
    /** Restart the kernel before executing */
    reset?: boolean;
    /** Session file path for accessing task outputs */
    sessionFile?: string;
    /**
     * Effective artifacts directory for the current session. Subagents share
     * the parent's directory, so this can differ from `sessionFile`'s sibling
     * dir. When present, exported to the kernel as `PI_ARTIFACTS_DIR` and
     * preferred over `PI_SESSION_FILE`-derived paths.
     */
    artifactsDir?: string;
    /** Artifact path/id for full output storage */
    artifactPath?: string;
    artifactId?: string;
    /**
     * On-disk roots the prelude helpers (`read`/`write`) substitute for
     * internal-URL schemes (e.g. `{ local: "/…/artifacts/local" }`). Exported to
     * the kernel as `PI_EVAL_LOCAL_ROOTS` (JSON) so `write("local://x")` lands
     * where `read local://x` resolves instead of a literal `local:/` directory.
     */
    localRoots?: Record<string, string>;
    /**
     * ToolSession used to resolve host-side `tool.<name>(args)` calls made from
     * the Python prelude's bridge proxy. When omitted, the bridge env vars are
     * not injected and any `tool.foo(...)` raises in Python.
     */
    toolSession?: ToolSession;
    /** Callback for status events emitted by tool bridge invocations. */
    emitStatus?: (event: JsStatusEvent) => void;
    /**
     * Live status events streamed as they are emitted (both host-side bridge
     * helpers like `agent()` and kernel-side `display`/`log`/`phase`). Mirrors
     * what lands in `displayOutputs` so callers can render progress before the
     * cell finishes.
     */
    onStatus?: (event: JsStatusEvent) => void;
    /** @internal Bridge session id, set by `executePython` before delegating. */
    bridgeSessionId?: string;
    /** @internal Bridge endpoint info, set by `executePython` before delegating. */
    bridge?: {
        url: string;
        token: string;
    };
}
export interface PythonKernelExecutor {
    execute: (code: string, options?: KernelExecuteOptions) => Promise<KernelExecuteResult>;
    syncPreludes?: (preludes: readonly PythonPreludeSource[], signal: AbortSignal | undefined, timeoutMs: number) => Promise<void>;
}
export interface PythonResult {
    /** Combined stdout + stderr output (sanitized, possibly truncated) */
    output: string;
    /** Execution exit code (0 ok, 1 error, undefined if cancelled) */
    exitCode: number | undefined;
    /** Whether the execution was cancelled via signal */
    cancelled: boolean;
    /** Whether the output was truncated */
    truncated: boolean;
    /** Artifact ID if full output was saved to artifact storage */
    artifactId?: string;
    /** Bytes the artifact cap dropped from the saved file's middle (the artifact is a head/tail sample). */
    artifactElidedBytes?: number;
    artifactError?: OutputArtifactError;
    /** Total number of lines in the output stream */
    totalLines: number;
    /** Total number of bytes in the output stream */
    totalBytes: number;
    /** Number of lines included in the output text */
    outputLines: number;
    /** Number of bytes included in the output text */
    outputBytes: number;
    /** Rich display outputs captured from display_data/execute_result */
    displayOutputs: KernelDisplayOutput[];
    /** Whether stdin was requested */
    stdinRequested: boolean;
}
/** Describe named tools defined in a retained Python kernel. */
export declare function describePythonTools(names: string[], options: PythonToolInvokeOptions): Promise<{
    tools: EvalToolDescriptor[];
    missing: string[];
}>;
/** Invoke a named tool defined in a retained Python kernel. */
export declare function callPythonTool(name: string, args: Record<string, unknown>, options: PythonToolInvokeOptions): Promise<EvalToolInvokeResult>;
export declare function disposeAllKernelSessions(): Promise<void>;
export declare function disposeKernelSessionsByOwner(ownerId: string): Promise<void>;
/** Projects against an already-retained, idle Python session without starting a kernel. */
export declare function shadowPlanPythonIfPresent(options: {
    cwd: string;
    sessionId: string;
    kernelOwnerId?: string;
    code: string;
    timeoutMs?: number;
}): Promise<PythonShadowPlan | null>;
/** Captures the current retained-namespace token without planning or starting a kernel. */
export declare function snapshotPythonNamespaceIfPresent(options: {
    cwd: string;
    sessionId: string;
    kernelOwnerId?: string;
    timeoutMs?: number;
}): Promise<Pick<PythonShadowSnapshot, "revision" | "digest"> | null>;
export declare function executePythonWithKernel(kernel: PythonKernelExecutor, code: string, options?: PythonExecutorOptions): Promise<PythonResult>;
export declare function executePython(code: string, options?: PythonExecutorOptions): Promise<PythonResult>;
