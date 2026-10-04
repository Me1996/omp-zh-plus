import type { EvalShadowCellSession } from "./cell-session.js";
export declare function runWithEvalShadowCell<T>(cell: EvalShadowCellSession | undefined, action: () => T): T;
export declare function getActiveEvalShadowCell(): EvalShadowCellSession | undefined;
