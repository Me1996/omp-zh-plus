import { ToolError } from "@oh-my-pi/pi-tui-zh/tools/tool-errors";
/** Error kinds a Tern browser op answers with, plus the client's own failures. */
export type TernErrorKind = "invalid" | "not_found" | "no_window" | "window_closed" | "unsupported" | "js" | "failed" | "connect" | "closed" | "timeout" | "protocol";
/** A failed Tern browser op or connection, carrying the protocol's error kind. */
export declare class TernBrowserError extends ToolError {
    /** Why it failed (the protocol's `error.kind`, or the client's own). */
    readonly kind: TernErrorKind;
    constructor(kind: TernErrorKind, message: string);
}
/** Whether `error` says Tern cannot host a browser at all (auto mode falls back to Chromium). */
export declare function isTernUnavailable(error: unknown): error is TernBrowserError;
/** `message` as a frame: `u32` LE length then its JSON. Throws what `JSON.stringify` throws (cycles, bigints). */
export declare function encodeTernFrame(message: object): Uint8Array;
/** A reply the client understands; a kind it does not know (a newer Tern's) is `other`. */
export type TernReply = {
    type: "welcome";
} | {
    type: "browser";
    id: number;
    answer: unknown;
} | {
    type: "other";
};
/** Decode one reply payload. Throws a `protocol` error when it is not a JSON object or its browser answer has no id. */
export declare function decodeTernReply(payload: Uint8Array): TernReply;
/**
 * Incremental splitter of the socket byte stream into frame payloads. Chunks
 * are queued as they arrive and each frame is assembled once when complete,
 * so a large frame arriving in many chunks costs linear, not quadratic, copying.
 */
export declare class TernFrameReader {
    #private;
    /** Append `chunk` and return every complete payload it finished. */
    push(chunk: Uint8Array): Uint8Array[];
}
/** Options for one browser op. */
export interface TernRequestOptions {
    /** Give up after this long (default 30 s); the daemon never times out itself. */
    timeoutMs?: number;
    /** Abandon the op when this aborts. */
    signal?: AbortSignal;
    /**
     * Called with the `ok` result when the answer arrives after the op was
     * abandoned (timeout/abort): lets callers undo effects nobody awaited any
     * more (e.g. close a PiP an abandoned `open` created).
     */
    onLateAnswer?: (value: unknown) => void;
}
/**
 * One connection to the Tern daemon's browser relay. `connect` greets and
 * waits for the welcome; `request` sends one op and resolves its `ok`
 * result (rejecting with a {@link TernBrowserError}). Requests run
 * concurrently; closing rejects everything pending.
 */
export declare class TernSocketClient {
    #private;
    constructor(opts: {
        socketPath: string;
    });
    /** The daemon socket this client talks to. */
    get socketPath(): string;
    /** Whether the connection is up and welcomed. */
    get connected(): boolean;
    /** Open the socket and greet; resolves once the daemon welcomed omp. */
    connect(): Promise<void>;
    /** Send `op` (an object with an `op` field) and resolve its `ok` result. */
    request(op: Record<string, unknown>, opts?: TernRequestOptions): Promise<unknown>;
    /** Close the connection; every pending op rejects. */
    close(): void;
}
