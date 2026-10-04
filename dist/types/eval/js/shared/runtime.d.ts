import type { EvalPreludeSource } from "../worker-protocol.js";
import { type HelperBundle } from "./helpers.js";
import type { JsDisplayOutput } from "./types.js";
export interface RuntimeCallIdentity {
    siteId: string;
    occurrence: number;
}
/**
 * Per-run callbacks. Runtime globals resolve these from AsyncLocalStorage so
 * overlapping async cells can route output/tool calls back to their own run.
 */
export interface RuntimeHooks {
    onText(chunk: string): void;
    onDisplay(output: JsDisplayOutput): void;
    callTool(name: string, args: unknown, identity?: RuntimeCallIdentity): Promise<unknown>;
}
export interface RunContext {
    runId: string;
    hooks: RuntimeHooks;
    cwd: string;
    filename?: string;
    callOccurrences: Map<string, number>;
    finalExpressionSet: boolean;
    finalExpressionValue: unknown;
}
export interface RuntimeOptions {
    initialCwd: string;
    sessionId: string;
    /**
     * Extra globals installed alongside `__omp_helpers__` / prelude. Use for stable, lifetime-
     * of-the-worker bindings (e.g. browser's `page`, `browser`). Per-run scope should be set
     * via `setRunScope()` instead.
     */
    extraGlobals?: Record<string, unknown>;
    /**
     * On-disk roots the helpers substitute for internal-URL schemes (e.g.
     * `{ local: "/…/artifacts/local" }`). Stable for the worker's lifetime.
     */
    localRoots?: Record<string, string>;
    /** Selected package directory consulted after the importing file's project. */
    packageRoot?: string;
}
/**
 * Which mutable global intrinsics still have their original identity.
 *
 * A retained cell can replace e.g. `String` with an arbitrary value; the shadow
 * projector models `String(...)`/`JSON.stringify(...)`/`Array.prototype.join`
 * calls as pure transforms only for names flagged intact here, so speculation
 * never performs I/O from a branch the real cell cannot reach.
 */
export type ShadowInitialGlobals = Readonly<{
    String: boolean;
    JSON: boolean;
    "JSON.stringify": boolean;
    "Array.prototype.join": boolean;
    /**
     * Whether `Object.prototype.toString` still has its original identity.
     * Implicit string coercion (templates, `+`) dispatches it for objects
     * (including arrays containing objects); a retained replacement changes
     * authoritative paths while leaving no snapshot trace. Absent only for
     * hand-built snapshots, where the intrinsic is assumed intact.
     */
    "Object.prototype.toString"?: boolean;
    /**
     * Whether the prelude tool bridge dispatcher still has its installed
     * identity. The proxy resolves `__omp_call_tool__` per call, so the flag
     * must track this binding; it also joins the snapshot digest, invalidating
     * plans if the installation ever changes under them. Absent only for
     * hand-built snapshots, where the bridge is assumed intact.
     */
    __omp_call_tool__?: boolean;
}>;
export type ShadowSnapshot = Readonly<{
    revision: number;
    values: Readonly<Record<string, unknown>>;
    initialGlobals: ShadowInitialGlobals;
}>;
export declare function shadowSnapshotDigest(snapshot: ShadowSnapshot): string;
/**
 * Shared JS runtime for the eval worker and the browser tab worker. Owns the prelude,
 * helper bag, console bridge, and indirect-eval execution. Emits text/display/tool-call
 * back through `RuntimeHooks` that the embedder supplies — wire format is the embedder's
 * concern.
 */
export declare class JsRuntime {
    #private;
    readonly helpers: HelperBundle;
    readonly sessionId: string;
    snapshotUserGlobals(): ShadowSnapshot;
    constructor(opts: RuntimeOptions);
    get cwd(): string;
    setCwd(cwd: string): void;
    setPackageRoot(packageRoot: string | undefined): void;
    /**
     * Install per-run globals. Intended for run-scoped state (browser's `tab`, `display`
     * overrides, etc.). Overwrites previous assignments — caller is responsible for any
     * cleanup it wants.
     */
    setRunScope(scope: Record<string, unknown>): void;
    /**
     * Synchronize enabled capability snippets before an ordinary eval cell.
     * Unchanged sources retain their objects; removed or replaced definitions
     * release every declared global before replacement source runs.
     */
    syncPreludes(preludes: readonly EvalPreludeSource[]): void;
    /** Read a prelude-owned global from this runtime's active global set. */
    getGlobal(name: string): unknown;
    /** Invoke a callback inside this runtime's async run context. */
    runCallback<T>(runId: string, hooks: RuntimeHooks, callback: () => T | Promise<T>): Promise<T>;
    run(code: string, filename: string | undefined, hooks: RuntimeHooks, options?: {
        runId?: string;
        cwd?: string;
    }): Promise<unknown>;
    displayValue(value: unknown, hooks?: RuntimeHooks | undefined): void;
    dispose(): void;
}
