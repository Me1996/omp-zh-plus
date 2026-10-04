import type { AgentToolCall, AgentToolResult, SpeculativeOperationSink, ToolSpeculationStreamSession } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../../tools/index.js";
import type { RuntimeCallIdentity } from "../js/shared/runtime.js";
import type { JsStatusEvent } from "../js/shared/types.js";
export interface EvalShadowCellOptions {
    coordinator: SpeculativeOperationSink;
    parentToolCallId: string;
    session: ToolSession;
    cwd: string;
    sessionId: string;
    kernelOwnerId?: string;
    emitStatus?: (event: JsStatusEvent) => void;
    onDiscard?: () => void;
}
export declare class EvalShadowCellSession implements ToolSpeculationStreamSession {
    #private;
    readonly contextIndependent = true;
    constructor(options: EvalShadowCellOptions);
    update(_toolCall: AgentToolCall, partialJson?: string): Promise<void>;
    finalize(context: {
        args: Readonly<Record<string, unknown>>;
    }): Promise<void>;
    /**
     * Whether the streamed plan still authorizes these final arguments. The
     * coordinator re-checks after hook/transform reconciliation and discards
     * the session on mismatch. The decoder check alone accepts any extension
     * of the streamed prefix, so additionally require the exact source the
     * stream finalize verified: appended source (e.g. a hoisted `tool` shadow
     * after the read) invalidates previously projected operations. Pure: safe
     * to call any number of times.
     */
    matchesFinalArgs(args: Readonly<Record<string, unknown>>): boolean;
    /** Revision/digest captured by the first shadow plan, if any planning ran. */
    get snapshotToken(): {
        language: string;
        revision: number;
        digest: string;
    } | undefined;
    /**
     * Re-checks the retained namespace against the planning snapshot.
     *
     * Retained state may change between streamed planning and dispatch (timers,
     * background work, concurrent session users). A mismatch means admitted
     * children were projected from stale state: the caller must discard this
     * session and run the cell without it. Fail-closed on any error or when no
     * retained backend answers. Known residual: the check and the later cell
     * start are two round trips, so a mutation landing exactly between them is
     * still caught only by claim fingerprinting — use the atomic
     * runIfSnapshotMatches/executeIfSnapshotMatches paths where available.
     */
    verifySnapshotCurrent(): Promise<boolean>;
    commit(): void;
    discard(reason: string): Promise<void>;
    claim(name: string, args: unknown, identity: RuntimeCallIdentity, remainingTimeoutMs: number, signal?: AbortSignal): Promise<AgentToolResult<unknown> | undefined>;
    claimValue(name: string, args: unknown, identity: RuntimeCallIdentity, remainingTimeoutMs: number): Promise<unknown | undefined>;
}
