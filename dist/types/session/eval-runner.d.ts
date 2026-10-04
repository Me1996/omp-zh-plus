import type { Agent } from "@oh-my-pi/pi-agent-core";
import type { Settings } from "../config/settings.js";
import { type PythonResult } from "../eval/py/executor.js";
import type { ExtensionRunner } from "../extensibility/extensions/index.js";
import type { ToolSession } from "../tools/index.js";
import type { PythonExecutionMessage } from "./messages.js";
import type { SessionManager } from "./session-manager.js";
/** Capabilities the eval runner borrows from its owning session. */
export interface EvalRunnerHost {
    agent: Agent;
    sessionManager: SessionManager;
    settings: Settings;
    extensionRunner(): ExtensionRunner | undefined;
    evalToolSession?: ToolSession;
    isStreaming(): boolean;
    appendSessionMessage(message: PythonExecutionMessage): void;
}
/** Owns user-initiated Python execution and retained eval-kernel lifecycle. */
export declare class EvalRunner {
    #private;
    constructor(host: EvalRunnerHost, options: {
        kernelOwnerId: string;
    });
    /** Executes Python in the session's shared kernel. */
    executePython(code: string, onChunk?: (chunk: string) => void, options?: {
        excludeFromContext?: boolean;
    }): Promise<PythonResult>;
    /** Rejects new eval work once session disposal begins. */
    assertExecutionAllowed(): void;
    /** Tracks externally started Python work so disposal can await and abort it. */
    trackExecution<T>(execution: Promise<T>, abortController: AbortController): Promise<T>;
    /** Records a Python execution result in session history. */
    recordPythonResult(code: string, result: PythonResult, options?: {
        excludeFromContext?: boolean;
    }): void;
    /** Cancels every running Python execution. */
    abort(): void;
    /** Whether a Python execution is currently running. */
    get isRunning(): boolean;
    /** Whether Python results are waiting for a safe persistence boundary. */
    get hasPendingMessages(): boolean;
    /** Returns the stable owner shared by eval and session-owned tools. */
    getKernelOwnerId(): string;
    /** Returns this session's eval executor id, shared by the eval tool and user Python shortcuts. */
    getSessionId(): string;
    /** Flushes deferred Python results into agent state and persistence. */
    flushPending(): void;
    /** Prevents new Python executions before asynchronous disposal starts. */
    beginDispose(): void;
    /** Waits for active work and disposes every retained eval kernel owned by the session. */
    disposeKernels(): Promise<void>;
}
