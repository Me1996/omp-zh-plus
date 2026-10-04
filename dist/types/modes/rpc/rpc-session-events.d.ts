import type { AgentSessionEvent } from "../../session/agent-session.js";
import type { RpcMessageUpdates, RpcProjectedSessionEventFrame } from "./rpc-types.js";
/**
 * Writes session events to the RPC output. Message ids are assigned whether or
 * not the frame passes the filter, so changing the filter mid-message never
 * splits one message across two ids.
 */
export declare class RpcSessionEventForwarder {
    #private;
    constructor(output: (frame: RpcProjectedSessionEventFrame) => void);
    /** Forward only the listed event types; `null` forwards everything. Returns the active selection. */
    setFilter(events: readonly string[] | null, messageUpdates?: RpcMessageUpdates): string[] | null;
    forward(event: AgentSessionEvent): void;
}
