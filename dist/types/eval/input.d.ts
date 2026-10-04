import type { ToolSession } from "../tools/index.js";
/** Code-only eval input; standalone percent commands prepare files or dependencies. */
export interface EvalSourceInput {
    language: "py" | "js";
    code: string;
}
/** A cell's source bytes and dependency requirements, resolved before execution. */
export interface PreparedEvalSource {
    code: string;
    filename?: string;
    packages?: string[];
    /** An explicit percent-command selection, committed only after successful execution. */
    environment?: "managed" | "project";
}
/**
 * Resolve standalone percent commands without downloads, execution, or source
 * echo. Python only intercepts `%load` (for internal URL paths); its `%pip`
 * runs through the runner's own magic in the kernel's interpreter.
 */
export declare function prepareEvalSource(input: EvalSourceInput, session: ToolSession, signal?: AbortSignal): Promise<PreparedEvalSource>;
