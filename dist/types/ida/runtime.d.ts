import { ToolError } from "@oh-my-pi/pi-tui-zh/tools/tool-errors";
import type { ToolSession } from "../tools/index.js";
/** Raised when no Python interpreter can load idalib (`ida_domain` + `idapro`). */
export declare class IdaUnavailableError extends ToolError {
    constructor(message: string);
}
/** Interpreter and environment used to spawn IDA worker processes. */
export interface IdaRuntime {
    pythonPath: string;
    env: Record<string, string>;
}
/**
 * Resolve the Python interpreter that can import `ida_domain` and `idapro`, memoized per
 * (`ida.python`, install dir, cwd). Throws {@link IdaUnavailableError} when IDA is disabled,
 * no install is found, or no interpreter qualifies.
 */
export declare function resolveIdaRuntime(session: ToolSession): Promise<IdaRuntime>;
