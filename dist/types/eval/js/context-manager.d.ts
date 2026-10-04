import type { ToolSession } from "../../tools/index.js";
import type { ShadowPlan } from "../speculation/types.js";
import type { EvalToolDescriptor, EvalToolInvokeResult } from "../types.js";
import { type ShadowSnapshot } from "./shared/runtime.js";
import type { JsDisplayOutput, JsToolRequest, WorkerInbound, WorkerOutbound } from "./worker-protocol.js";
export { rewriteImports, wrapCode } from "./shared/rewrite-imports.js";
export type { JsDisplayOutput } from "./worker-protocol.js";
export interface VmRunState {
    signal?: AbortSignal;
    onText?: (chunk: string) => void;
    onDisplay?: (output: JsDisplayOutput) => void;
}
/** Isolated runtime transport used by the context manager and startup regression fixtures. */
export interface JsEvalWorkerHandle {
    mode: "process" | "worker";
    send(msg: WorkerInbound): void;
    onMessage(handler: (msg: WorkerOutbound) => void): () => void;
    onError(handler: (error: Error) => void): () => void;
    close(): Promise<boolean>;
    terminate(): Promise<void>;
}
/** Startup dependencies overridden by tests to exercise process-to-Worker recovery. */
export interface JsEvalWorkerFactories {
    spawnProcess(): JsEvalWorkerHandle;
    spawnWorker(): JsEvalWorkerHandle;
}
/**
 * Test-only seam for exercising isolated-runtime startup transitions. Returns
 * an idempotent restore callback so tests cannot strand a process-wide factory.
 */
export declare function setJsEvalWorkerFactoriesForTests(factories: JsEvalWorkerFactories): () => void;
export declare function executeInVmContext(options: {
    sessionKey: string;
    sessionId: string;
    /** Logical owner identifier; scopes retained-worker cleanup via {@link disposeVmContextsByOwner}. */
    ownerId?: string;
    cwd: string;
    session: ToolSession;
    localRoots?: Record<string, string>;
    /** Selected package directory consulted only after the importing file's project. */
    packageRoot?: string;
    /** Model-visible description of the selected package environment. */
    packageEnvironment?: string;
    reset?: boolean;
    code: string;
    filename: string;
    timeoutMs?: number;
    runState: VmRunState;
}): Promise<{
    value: unknown;
}>;
/** Describe or invoke tools defined in a retained JavaScript kernel. */
export declare function invokeJsTool(request: JsToolRequest, options: {
    sessionKey: string;
    session: ToolSession;
    signal?: AbortSignal;
}): Promise<EvalToolInvokeResult | {
    ok: true;
    tools: EvalToolDescriptor[];
    missing: string[];
}>;
/**
 * Captures a retained runtime's safe user-global snapshot without executing user
 * code. A busy runtime returns `null`; callers must execute normally.
 */
export declare function snapshotVmContext(options: {
    sessionKey: string;
    cwd: string;
    sessionId: string;
    localRoots?: Record<string, string>;
    timeoutMs?: number;
}): Promise<ShadowSnapshot | null>;
export interface JavaScriptShadowPlanningResult {
    snapshot: ShadowSnapshot;
    digest: string;
    plan: ShadowPlan;
}
/**
 * Retained-only planning seam. It never starts a worker and never executes the
 * candidate source; unavailable or busy runtimes fall back to normal eval.
 */
export declare function shadowPlanIfPresent(options: {
    sessionKey: string;
    cwd: string;
    sessionId: string;
    code: string;
    localRoots?: Record<string, string>;
    timeoutMs?: number;
}): Promise<JavaScriptShadowPlanningResult | null>;
/**
 * Atomically rechecks a retained runtime's snapshot before starting a real
 * cell. `null` means the caller must discard speculative outcomes and use the
 * normal execution path.
 */
export declare function runIfSnapshotMatches(options: {
    sessionKey: string;
    sessionId: string;
    cwd: string;
    session: ToolSession;
    localRoots?: Record<string, string>;
    code: string;
    filename: string;
    runState: VmRunState;
    expectedRevision: number;
    expectedDigest: string;
}): Promise<{
    value: unknown;
} | null>;
export declare function resetVmContext(sessionKey: string): Promise<void>;
export declare function disposeAllVmContexts(): Promise<void>;
/**
 * Shut down retained JS contexts owned solely by `ownerId`; contexts with other
 * owners (e.g. an in-memory session keyed only by cwd) just drop the registration.
 */
export declare function disposeVmContextsByOwner(ownerId: string): Promise<void>;
/**
 * Smoke probe: spawn the JS evaluator through the worker-host entry and prove
 * it answers the `init` handshake in a real isolated subprocess (not the inline
 * fallback). Catches silent process-load and init-message regressions
 * that otherwise strand every cell on the init timeout in a distribution build —
 * the failure mode that motivated `installWorkerInbox`. Wired into
 * `omp --smoke-test` so binary / source / tarball installs all exercise it.
 */
export declare function smokeTestJsEvalWorker(): Promise<void>;
