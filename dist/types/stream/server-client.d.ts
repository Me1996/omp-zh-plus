import { type StreamHostFrame, type StreamPaneFrame, type StreamServerToHost } from "@oh-my-pi/pi-wire";
export interface StreamServerFatalError {
    code: number;
    message: string;
}
export interface StreamServerClientOptions {
    url: string;
    title: string;
    /** Bearer token for the host socket, resolved before every dial; null aborts with an unauthorized fatal. */
    token: () => Promise<string | null>;
    /** Current pane snapshots, emitted immediately after every host hello. */
    replay: () => Iterable<StreamPaneFrame>;
    onFrame: (frame: StreamServerToHost) => void;
    onFatal: (error: StreamServerFatalError) => void;
    /** Non-fatal drop; `delayMs` is the wait before the next dial. */
    onDisconnect?: (delayMs: number) => void;
    /** Test seam; production uses capped exponential backoff with jitter. */
    reconnectDelay?: (attempt: number) => number;
}
/** Reconnecting host-side link to the public stream server. Live deltas are never queued. */
export declare class StreamServerClient {
    #private;
    constructor(options: StreamServerClientOptions);
    start(): void;
    /** Send only on the current open socket. Disconnected deltas are represented by the next replay. */
    send(frame: StreamHostFrame): boolean;
    setTitle(title: string): void;
    close(): void;
}
