/** Marker that renders a serialized function as an executable run argument. */
export interface FnArgMarker {
    __omp_fn: string;
}
/** Marker that renders a serialized regular expression as an executable run argument. */
export interface RegExpArgMarker {
    __omp_re: {
        source: string;
        flags?: string;
    };
}
/** Renders one host value as a JavaScript argument for an evaluated run. */
export declare function renderRunArg(value: unknown): string;
/** Renders a helper call chain (`id(5).click()`) with arguments as JavaScript literals. */
export declare function renderCallChain(chain: readonly {
    method: string;
    args: readonly unknown[];
}[]): string;
/** Renders a function invocation with the requested run scope and positional arguments. */
export declare function renderFunctionRun(fnSource: string, scopeNames: readonly string[], args: readonly unknown[]): string;
