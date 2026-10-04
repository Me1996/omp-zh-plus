import { type OutputArtifactError } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import type { ToolSession } from "../../tools/index.js";
import { type JsDisplayOutput } from "./context-manager.js";
import type { JsPackageEnvironmentMode } from "./package-installer.js";
import type { JsStatusEvent } from "./shared/types.js";
export interface JsExecutorOptions {
    cwd?: string;
    timeoutMs?: number;
    deadlineMs?: number;
    /**
     * Runtime-work budget (ms). Used for worker cold-start headroom and
     * timeout-annotation text when the caller drives cancellation via the eval
     * watchdog `signal` instead of `deadlineMs`/`timeoutMs`. Never arms a timer.
     */
    idleTimeoutMs?: number;
    onChunk?: (chunk: string) => Promise<void> | void;
    onStatus?: (event: JsStatusEvent) => void;
    signal?: AbortSignal;
    sessionId: string;
    /** Logical owner identifier; scopes retained-worker cleanup. */
    kernelOwnerId?: string;
    reset?: boolean;
    sessionFile?: string;
    /** Absolute source path for file-backed cells. */
    filename?: string;
    /** Explicit package requirements reconciled before cell execution. */
    packages?: string[];
    /** Package target. Repository mutation requires explicit project selection. */
    environment?: JsPackageEnvironmentMode;
    artifactPath?: string;
    artifactId?: string;
    session: ToolSession;
    /** On-disk roots the helpers substitute for internal-URL schemes (e.g. `local://`). */
    localRoots?: Record<string, string>;
}
export interface JsResult {
    output: string;
    exitCode: number | undefined;
    cancelled: boolean;
    truncated: boolean;
    artifactId?: string;
    /** Bytes the artifact cap dropped from the saved file's middle (the artifact is a head/tail sample). */
    artifactElidedBytes?: number;
    artifactError?: OutputArtifactError;
    totalLines: number;
    totalBytes: number;
    outputLines: number;
    outputBytes: number;
    displayOutputs: JsDisplayOutput[];
}
export declare function executeJs(code: string, options: JsExecutorOptions): Promise<JsResult>;
