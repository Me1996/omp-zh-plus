import type { ShadowEvaluationContext, ShadowExpression, ShadowOperation, ShadowPlan, ShadowValue } from "./types.js";
export declare function mergeShadowValues(value: unknown, inputs: readonly ShadowValue[]): ShadowValue;
export declare function evaluateShadowExpression(expression: ShadowExpression, context: ShadowEvaluationContext): ShadowValue;
export interface EvaluatedShadowOperation {
    readonly operation: ShadowOperation;
    readonly args: ShadowValue;
}
export declare function evaluateShadowOperation(operation: ShadowOperation, context: ShadowEvaluationContext): EvaluatedShadowOperation;
export declare function evaluateShadowPlan(plan: ShadowPlan, context: ShadowEvaluationContext): {
    operations: readonly EvaluatedShadowOperation[];
    barrier?: ShadowPlan["barrier"];
};
