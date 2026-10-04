/** One allowlisted method invocation in a tab call chain. */
export interface TabCallStep {
    method: string;
    args: unknown[];
}
/** Tab helpers whose resolved value is returned directly. */
export declare const TAB_VALUE_METHODS: readonly string[];
/** Tab helpers whose handle-or-null result is returned as a boolean. */
export declare const TAB_PRESENCE_METHODS: readonly string[];
/** Tab helpers that return an element or frame handle for one subsequent method call. */
export declare const TAB_HANDLE_METHODS: readonly string[];
/** Methods allowed on element handles returned by tab.id() and tab.ref(). */
export declare const ELEMENT_METHODS: readonly string[];
/** Methods allowed on frame handles returned by tab.frame(). */
export declare const FRAME_METHODS: readonly string[];
/** Render an allowlisted tab helper or element-handle call for browser execution. */
export declare function renderTabCall(chain: readonly TabCallStep[]): string;
