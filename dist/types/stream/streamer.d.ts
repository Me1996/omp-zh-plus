import { type StreamChatMessage } from "@oh-my-pi/pi-wire";
export interface StreamUrls {
    hostUrl: string;
}
export type StreamConsoleEvent = {
    t: "link";
    state: "connecting" | "live" | "reconnecting" | "stopped";
    detail?: string;
    channel?: string;
    user?: string;
} | {
    t: "pane";
    action: "attached" | "closed";
    id: number;
    title: string;
    cols: number;
    rows: number;
} | {
    t: "viewers";
    n: number;
} | {
    t: "chat";
    msg: StreamChatMessage;
} | {
    t: "title";
    title: string;
} | {
    t: "error";
    message: string;
} | {
    t: "notice";
    message: string;
};
interface StreamConnectionOptions {
    projectDir: string;
    title: string;
    hostUrl: string;
    /** Bearer token resolver for the host socket (see `StencilCredential`). */
    token: () => Promise<string | null>;
    /** Test seam; production uses the server client's normal retry policy. */
    reconnectDelay?: (attempt: number) => number;
}
export interface StreamMuxHostOptions extends StreamConnectionOptions {
    onEvent: (event: StreamConsoleEvent) => void;
}
export interface StreamConsoleOptions extends StreamConnectionOptions {
    noTui?: boolean;
}
/** Convert a public stream base URL into its identity-derived host WebSocket route. */
export declare function resolveStreamUrls(baseUrl: string): StreamUrls;
/** Local session multiplexer and materialized-state owner for one live channel. */
export declare class StreamMuxHost {
    #private;
    constructor(options: StreamMuxHostOptions);
    start(): Promise<string>;
    wait(): Promise<number>;
    sendChat(text: string): void;
    setTitle(title: string): void;
    close(reason?: string, exitCode?: number): Promise<void>;
}
/** Render stream events as the original line-oriented console output. */
export declare function logConsoleSink(): (event: StreamConsoleEvent) => void;
/** Run the foreground console UX until a signal or fatal server rejection. */
export declare function runStreamConsole(options: StreamConsoleOptions): Promise<number>;
export {};
