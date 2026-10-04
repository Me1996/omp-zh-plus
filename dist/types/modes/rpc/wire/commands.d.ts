/** One RPC command as described to generators. */
export interface RpcCommandSpec {
    /** Wire `type` of the command. */
    name: string;
    /** One-line description emitted on generated client methods. */
    doc: string;
    /** Command fields besides `id`/`type`: an object definition, or the name of one. */
    params?: Record<string, unknown> | string;
    /** `data` of a successful response; absent when the response carries none. */
    result?: Record<string, unknown> | string;
    /** `data` may be `null` (e.g. nothing to cycle to, no handoff produced). */
    nullable?: boolean;
    /** The result is a one-field envelope; client libraries return this field. */
    unwrap?: string;
    /** Response deadline that overrides the client default, in milliseconds. */
    timeoutMs?: number;
    /** The command's work ends with a `prompt_result` frame carrying the request id. */
    completion?: "prompt_result";
    /** Parameters client libraries intentionally leave to raw-protocol callers. */
    clientOmit?: string[];
}
export declare const rpcCommands: readonly RpcCommandSpec[];
