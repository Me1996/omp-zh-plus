import type { ToolSession } from "./index.js";
export interface EvalBackendsAllowance {
    python: boolean;
    js: boolean;
}
/** Active eval backend allowance (`eval.py` / `eval.js`; `PI_PY` / `PI_JS` override). */
export declare function resolveEvalBackends(session: ToolSession): EvalBackendsAllowance;
