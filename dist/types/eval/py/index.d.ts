import type { ToolSession } from "../../tools/index.js";
import { type ExecutorBackendExecOptions, type ExecutorBackendResult } from "../backend.js";
import type { BackendProbeOptions } from "../probe.js";
export declare function namespaceSessionId(sessionId: string): string;
/** Resolve the retained Python kernel identity owned by a tool session. */
export declare function resolvePythonKernelIdentity(session: ToolSession): {
    cwd: string;
    sessionId: string;
    interpreter: string | undefined;
    kernelOwnerId: string | undefined;
};
declare const _default: {
    id: "python";
    label: string;
    highlightLang: string;
    isAvailable(session: ToolSession, opts?: BackendProbeOptions): Promise<boolean>;
    execute(code: string, opts: ExecutorBackendExecOptions): Promise<ExecutorBackendResult>;
};
export default _default;
