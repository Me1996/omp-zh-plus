import type { Page } from "puppeteer-core";
/** Options controlling React component tree traversal. */
export interface ReactTreeOptions {
    maxDepth?: number;
    includeHost?: boolean;
}
/** A bounded React component entry with nested rendered children. */
export interface ReactTreeNode {
    id: number;
    name: string;
    type: string;
    key?: string;
    props: Record<string, unknown>;
    children: ReactTreeNode[];
}
/** One hook state entry returned by React component inspection. */
export interface ReactHookState {
    index: number;
    kind: string;
    value: unknown;
}
/** Source metadata available on a development React fiber. */
export interface ReactSourceInfo {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    owner?: string;
}
/** Bounded details for one React fiber selected by its tree id. */
export interface ReactInspectResult {
    name: string;
    props: unknown;
    state?: unknown | ReactHookState[];
    source?: ReactSourceInfo;
    domSelector?: string;
}
/** Page expression walking every mounted fiber root; evaluates to a `ReactPageEnvelope<ReactTreeNode[]>`. */
export declare function reactTreeSource(options: ReactTreeOptions): string;
/** Page expression inspecting fiber `id`; evaluates to a `ReactPageEnvelope<ReactInspectResult>`. Rejects non-positive-integer ids. */
export declare function reactInspectSource(id: number): string;
/** Unwrap the page result of `reactInspectSource(id)`, mapping a missing fiber or hook to `ToolError`. */
export declare function reactInspectResult(envelope: unknown, id: number): ReactInspectResult;
/** Walk every mounted React fiber root into a bounded nested component tree. */
export declare function readReactTree(page: Page, options?: ReactTreeOptions, signal?: AbortSignal): Promise<ReactTreeNode[]>;
/** Inspect props, state, source, and host DOM location for one React fiber id. */
export declare function inspectReactFiber(page: Page, id: number, signal?: AbortSignal): Promise<ReactInspectResult>;
