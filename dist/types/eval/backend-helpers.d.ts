/**
 * Helpers shared by the per-language eval backend definitions (js/py
 * index modules): session-id namespacing and projection of
 * executor results into the ExecutorBackend result shape.
 */
import type { OutputArtifactError } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import type { ExecutorBackendResult } from "./backend.js";
import type { EvalDisplayOutput } from "./types.js";
export declare function namespaceSessionId(sessionId: string, prefix: string): string;
export declare function toExecutorBackendResult(result: {
    output: string;
    exitCode: number | undefined;
    cancelled: boolean;
    truncated: boolean;
    artifactId?: string | undefined;
    artifactElidedBytes?: number;
    artifactError?: OutputArtifactError;
    totalLines: number;
    totalBytes: number;
    outputLines: number;
    outputBytes: number;
    displayOutputs: EvalDisplayOutput[];
}): ExecutorBackendResult;
