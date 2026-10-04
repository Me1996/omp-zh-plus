/** One allowlisted method invocation in a computer call chain. */
export interface ComputerCallStep {
    method: string;
    args: unknown[];
}
/** Approval tier a direct computer helper needs: inspection reads, input and mutation execute. */
export type ComputerCallPolicy = "read" | "exec";
type MethodPolicies = Readonly<Record<string, ComputerCallPolicy>>;
/** Helpers callable on the `desktop` root; `window` and `ref` also anchor one-hop handle chains. */
export declare const DESKTOP_METHODS: MethodPolicies;
/** Helpers callable on a window handle resolved through `desktop.window(id)`. */
export declare const WINDOW_METHODS: MethodPolicies;
/** Helpers callable on an AX element handle resolved through `desktop.ref(ref)`. */
export declare const ELEMENT_METHODS: MethodPolicies;
/** Whether every step of a direct computer call is inspection-only, so the run needs read approval. */
export declare function isReadOnlyComputerCall(chain: readonly ComputerCallStep[]): boolean;
/** Render an allowlisted desktop helper or handle call for the persistent computer runtime. */
export declare function renderComputerCall(chain: readonly ComputerCallStep[]): string;
export {};
