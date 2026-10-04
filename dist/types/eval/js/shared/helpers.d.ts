import type { JsStatusEvent } from "./types.js";
export interface HelperOptions {
    limit?: number;
    offset?: number;
}
/**
 * Inputs the helper factory needs from its host runtime. `cwd` is a getter so the runtime
 * can update it between cells (e.g. when the agent's session cwd changes) without
 * recreating helpers.
 */
export interface HelperContext {
    cwd(): string;
    env: Map<string, string>;
    /**
     * On-disk roots for internal-URL schemes the helpers accept, keyed by scheme
     * (see `buildEvalUrlRoots`). A path like `<scheme>://x.md` is rewritten to
     * `<root>/x.md` before any filesystem op; unknown schemes are rejected.
     */
    localRoots(): Record<string, string>;
    emitStatus(event: JsStatusEvent): void;
}
/**
 * The set of functions exposed to user code via `globalThis.__omp_helpers__`. The JS
 * prelude reads from this bag and attaches short aliases (`read`, `write`, `env`, ...)
 * onto the global scope.
 */
export interface HelperBundle {
    read(rawPath: string, options?: HelperOptions): Promise<string>;
    writeFile(rawPath: string, data: unknown): Promise<string>;
    env(key?: string, value?: string): string | Record<string, string> | undefined;
    /** Whether `rawPath` is an internal URL whose scheme has an injected root (served by these helpers, not delegated to the read tool). */
    hasRoot(rawPath: string): boolean;
}
export declare function createHelpers(ctx: HelperContext): HelperBundle;
