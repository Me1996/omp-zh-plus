import { type AgentRef } from "../../registry/agent-registry.js";
import type { AgentSession } from "../../session/agent-session.js";
import { type SubagentEventPayload, type SubagentLifecyclePayload, type SubagentProgressPayload } from "../../task/index.js";
import type { EventBus } from "../../utils/event-bus.js";
import type { RpcSubagentFrame, RpcSubagentMessagesResult, RpcSubagentSnapshot, RpcSubagentSubscriptionLevel } from "./rpc-types.js";
export interface RpcSubagentTranscriptSelector {
    subagentId?: string;
    sessionFile?: string;
    fromByte?: number;
}
type RpcSubagentOutput = (frame: RpcSubagentFrame) => void;
export declare function readRpcSubagentTranscript(sessionFile: string, fromByte?: number): Promise<RpcSubagentMessagesResult>;
export declare class RpcSubagentRegistry {
    #private;
    constructor(observabilityBus: EventBus, output: RpcSubagentOutput);
    dispose(): void;
    clear(): void;
    setSubscriptionLevel(level: RpcSubagentSubscriptionLevel): void;
    getSubscriptionLevel(): RpcSubagentSubscriptionLevel;
    getSubagents(): RpcSubagentSnapshot[];
    handleLifecycle(payload: SubagentLifecyclePayload): void;
    handleProgress(payload: SubagentProgressPayload): void;
    handleEvent(payload: SubagentEventPayload): void;
    resolveSessionFile(selector: RpcSubagentTranscriptSelector): string;
}
/** A running subagent from this session's roster, bound to its live registry ref. */
export interface RpcOwnedSubagent {
    ref: AgentRef;
    session: AgentSession;
}
/**
 * Resolve a `get_subagents` id to its running, live registry ref, or
 * `undefined` when the host must not reach it (unknown, finished, accepted,
 * parked, aborted, or another session's agent).
 *
 * Agent ids are unique only within one parent session's artifacts scope, and
 * the process-global registry keeps the latest ref per id, so the ref must
 * carry the transcript file this session's roster recorded
 * (`<artifactsDir>/<id>.jsonl`). The ref must also still be `running`: it goes
 * `idle` once the parent accepts its result, before the terminal lifecycle
 * frame prunes the roster, and a running ref always holds a live session.
 */
export declare function resolveOwnedLiveSubagent(subagentRegistry: Pick<RpcSubagentRegistry, "getSubagents">, subagentId: string): RpcOwnedSubagent | undefined;
export {};
