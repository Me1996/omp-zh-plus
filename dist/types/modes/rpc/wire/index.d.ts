export type { RpcCommandSpec } from "./commands.js";
/** Generator-facing description of one command; definitions are referenced by name. */
export interface RpcWireCommand {
    name: string;
    doc: string;
    params: string | null;
    result: string | null;
    nullable: boolean;
    unwrap: string | null;
    timeoutMs: number | null;
    completion: "prompt_result" | null;
    clientOmit: string[];
}
/** JSON Schema bundle consumed by language generators. */
export interface RpcWireBundle {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    "x-rpc": {
        /** Definition of every unsolicited outbound frame, dispatched by `type`. */
        notification: string;
        /** Definition of the session event union (the frames `set_event_filter` applies to). */
        sessionEvent: string;
        /**
         * Definition of every stdout frame, dispatched by `type`: responses, host requests, and
         * notifications. An unrecognized `type` is an unknown notification, not an error.
         */
        serverFrame: string;
        /** Definition of every non-command frame the host writes to stdin, dispatched by `type`. */
        inbound: string;
        commands: RpcWireCommand[];
    };
    $defs: Record<string, Record<string, unknown>>;
}
/**
 * Resolves every wire definition in one scope and emits the generator bundle.
 *
 * @throws when two definitions emit conflicting JSON Schema for one name, or an
 * inline command definition collides with a shared one.
 */
export declare function buildRpcWireBundle(): RpcWireBundle;
