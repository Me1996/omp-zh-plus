import * as net from "node:net";
/**
 * Newline-delimited JSON framing over `node:net` sockets, shared by the tiny
 * worker daemon (both halves) and the MLX daemon client.
 */
/** Feed socket chunks and invoke `onLine` per complete, non-blank line. */
export declare class LineParser {
    #private;
    readonly onLine: (line: string) => void;
    constructor(onLine: (line: string) => void);
    push(chunk: string): void;
}
/** Write one JSON line; silently dropped once the socket is gone (the close handler reports that). */
export declare function writeJsonLine(socket: net.Socket, message: unknown): void;
/** Dial a Unix socket or named pipe with a bounded connect; the socket is switched to UTF-8 strings. */
export declare function connectJsonlSocket(endpoint: string, timeoutMs: number): Promise<net.Socket>;
