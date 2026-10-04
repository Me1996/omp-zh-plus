/** Built-in tools whose availability depends on the selected memory backend. */
export declare const MEMORY_BACKEND_TOOL_NAMES: readonly ["retain", "recall", "reflect", "memory_edit", "learn"];
/**
 * Prompt references for memory tools: `xd://<name>` when the tool is mounted
 * as an xd:// device (the only way to call it), else its bare name.
 */
export declare function memoryToolRefs(mountedDevices?: readonly {
    name: string;
}[]): Record<string, string>;
/**
 * {@link memoryToolRefs} for a tool session. Reads mounted names only: xd://
 * device entries compute catalog summaries from tool descriptions, which would
 * recurse when called from a memory tool's own description getter.
 */
export declare function sessionMemoryToolRefs(session: {
    xdev?: {
        mountedNames: ReadonlySet<string>;
    };
}): Record<string, string>;
