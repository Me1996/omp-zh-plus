import { BaseKernel, type KernelExecuteOptions, type KernelExecuteResult, type KernelStartOptions } from "../kernel-base.js";
import { type BackendProbeOptions } from "../probe.js";
import type { ShadowPlan } from "../speculation/types.js";
import { type PythonRuntime } from "./runtime.js";
import type { PythonToolRequest } from "./executor.js";
export type { KernelExecuteOptions, KernelExecuteResult, KernelRuntimeEnv, KernelShutdownOptions, KernelShutdownResult, } from "../kernel-base.js";
export type { KernelDisplayOutput, PythonStatusEvent } from "./display.js";
export { renderKernelDisplay } from "./display.js";
export interface PythonKernelAvailability {
    ok: boolean;
    pythonPath?: string;
    reason?: string;
    /** The probed-working runtime, when one was found. */
    runtime?: PythonRuntime;
}
export interface PythonPreludeSource {
    name: string;
    exports: string[];
    source: string;
}
export interface PythonShadowSnapshot {
    revision: number;
    values: Readonly<Record<string, unknown>>;
    digest: string;
}
export interface PythonShadowPlan extends ShadowPlan {
    snapshot: PythonShadowSnapshot;
}
interface PythonKernelExecuteOptions extends KernelExecuteOptions {
    expectedShadowRevision?: number;
    expectedShadowDigest?: string;
}
export declare function checkPythonKernelAvailability(cwd: string, interpreter?: string, options?: {
    forceProbe?: boolean;
} & BackendProbeOptions): Promise<PythonKernelAvailability>;
export declare class PythonKernel extends BaseKernel<PythonKernelExecuteOptions> {
    #private;
    private constructor();
    /** Describe or invoke a tool defined in this retained Python kernel. */
    invokeTool(request: PythonToolRequest, options?: KernelExecuteOptions): Promise<KernelExecuteResult>;
    /** Synchronize enabled capability snippets before the next user cell. */
    syncPreludes(preludes: readonly PythonPreludeSource[], signal: AbortSignal | undefined, timeoutMs: number): Promise<void>;
    static start(options: KernelStartOptions): Promise<PythonKernel>;
    /**
     * Captures the runner's JSON-safe user namespace only when no Python cell is
     * executing. Ineligible or malformed responses deliberately fall back.
     */
    snapshotUserNamespace(timeoutMs?: number): Promise<PythonShadowSnapshot | null>;
    /** Projects a candidate against an already-running, idle Python kernel. */
    shadowPlan(code: string, timeoutMs?: number): Promise<PythonShadowPlan | null>;
    /** Atomically starts a cell only if its retained shadow snapshot is still current. */
    executeIfSnapshotMatches(code: string, snapshot: Pick<PythonShadowSnapshot, "revision" | "digest">, options?: KernelExecuteOptions): Promise<KernelExecuteResult | null>;
}
