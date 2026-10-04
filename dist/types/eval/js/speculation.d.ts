import type { ShadowPlan } from "../speculation/types.js";
import type { ShadowInitialGlobals } from "./shared/runtime.js";
export interface JavaScriptShadowProjectionOptions {
    readonly snapshot?: Readonly<Record<string, unknown>>;
    /** Retained-intrinsic identity flags from the runtime snapshot. Absent only for
     * hand-built snapshots (unit tests); production snapshots always carry it. */
    readonly initialGlobals?: ShadowInitialGlobals;
}
/** Projects a closed, non-executing IR for the supported eval source subset. */
export declare function projectJavaScriptShadowPlan(code: string, options?: JavaScriptShadowProjectionOptions): Promise<ShadowPlan>;
