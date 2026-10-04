import type { StreamConsoleEvent, StreamMuxHost } from "./streamer.js";
export interface StreamTuiInfo {
    title: string;
    initialEvents: readonly StreamConsoleEvent[];
    subscribe(listener: (event: StreamConsoleEvent) => void): () => void;
}
/** Run the fullscreen interactive stream chat console until the stream or user exits. */
export declare function runStreamTui(host: StreamMuxHost, info: StreamTuiInfo): Promise<void>;
