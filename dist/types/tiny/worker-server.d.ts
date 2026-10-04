import type { TinyWorkerRequest, TinyWorkerResponse } from "./title-protocol.js";
/** Writes one JSON line back to the connection a request arrived on. */
export interface JsonLineReply<Res> {
    send(message: Res): void;
}
export interface JsonLineServerOptions<Req, Res> {
    /** Log scope. */
    name: string;
    /** `postmortem` cleanup label. */
    cleanupLabel: string;
    /** Subject of the "already listening" bind error. */
    subject: string;
    /** Idle window (nothing {@link JsonLineServer.busy}, no request received) after which the process exits. */
    idleMs: number;
    /** Stdout line announcing the bound endpoint. */
    banner(endpoint: string): string;
    /** Handle one parsed request line; `reply` reaches only the requesting connection. */
    onRequest(request: Req, reply: JsonLineReply<Res>): void;
    /** Runs synchronously as stop begins, before connections and the listener close. */
    beforeStop?(): void;
    /** Runs once during stop, after the listener closes and before the socket file is removed. */
    onStop?(): Promise<void>;
}
/**
 * Socket-owning newline-JSON request loop (`mlx-server.py` mirrors it in Python).
 * Owns one endpoint: clears a stale socket file under a file lock (a crashed
 * predecessor) but defers to a live one (a concurrent spawn that won), feeds
 * every connection's request lines to `onRequest`, and exits the process once idle.
 */
export declare class JsonLineServer<Req, Res> {
    #private;
    constructor(options: JsonLineServerOptions<Req, Res>);
    /** Bind `endpoint` and serve until idle exit or {@link exit}; resolves once the socket is released. */
    serve(endpoint: string): Promise<void>;
    /** Count `work` as in flight, holding off idle exit until it settles. */
    busy<T>(work: () => Promise<T>): Promise<T>;
    /** Release the endpoint, then exit the process. */
    exit(reason: string): void;
}
export interface TinyWorkerServerOptions {
    /** Launch identity echoed in `pong`; clients replace a worker whose tag differs. */
    tag: string;
    /** Idle window (nothing in flight, no request received) after which the process exits. */
    idleMs: number;
    /** Serve one `load`/`chat`; `reply.send` reaches only the requesting client. Errors become `error` replies. */
    handle(request: Extract<TinyWorkerRequest, {
        type: "load" | "chat";
    }>, reply: JsonLineReply<TinyWorkerResponse>): Promise<void>;
}
/** The ONNX worker's endpoint: answers `ping`/`shutdown` inline and serializes `load`/`chat` through one queue. */
export declare class TinyWorkerServer {
    #private;
    constructor(options: TinyWorkerServerOptions);
    /** Bind `endpoint` and serve until idle exit or `shutdown`; resolves once the socket is released. */
    serve(endpoint: string): Promise<void>;
}
/** True when something accepts a connection at `endpoint`. */
export declare function endpointAlive(endpoint: string): Promise<boolean>;
