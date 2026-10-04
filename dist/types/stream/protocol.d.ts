/**
 * Local protocol between an interactive session and the `omp stream` process
 * in the same working directory.
 *
 * Transport: newline-delimited JSON over the Unix socket / named pipe at
 * {@link streamSocketEndpoint}. The streamer assigns each connected session a
 * wire pane id and forwards the session's frames as `StreamPaneFrame`s; the
 * session never learns about other panes or the stream server.
 *
 * Rows are already normalized and redacted when they cross this socket (see
 * `paint-encoder.ts`); the streamer is a pure multiplexer. The same screen
 * frames are persisted by session recordings (`recording.ts`).
 */
import { type StreamChatMessage, type StreamRow } from "@oh-my-pi/pi-wire";
export declare const STREAM_LOCAL_PROTO = 1;
/** Session → streamer. `hello` is the first frame on the socket. */
export type StreamSessionFrame = {
    t: "hello";
    proto: number;
    sessionId: string;
    title: string;
    cols: number;
    rows: number;
} | {
    t: "resize";
    cols: number;
    rows: number;
} | {
    t: "history";
    rows: StreamRow[];
} | {
    t: "viewport";
    rows: StreamRow[];
} | {
    t: "patch";
    ops: [index: number, row: StreamRow][];
    rows: number;
} | {
    t: "reset";
} | {
    t: "paused";
    paused: boolean;
};
/** Screen-content frames: everything a session emits after `hello` except the pause flag. */
export type StreamScreenFrame = Exclude<StreamSessionFrame, {
    t: "hello";
} | {
    t: "paused";
}>;
/** Materialized screen of one session: bounded scrollback plus the live viewport. */
export interface StreamScreen {
    cols: number;
    rows: number;
    history: StreamRow[];
    viewport: StreamRow[];
}
/** Streamer → session. `welcome` answers `hello`; `bye` precedes an orderly close. */
export type StreamStreamerFrame = {
    t: "welcome";
    proto: number;
    channel: string;
    url: string;
} | {
    t: "viewers";
    n: number;
} | {
    t: "chat";
    msg: StreamChatMessage;
} | {
    t: "bye";
    reason: string;
};
/** Encode one frame for the newline-delimited socket. */
export declare function encodeStreamFrame(frame: StreamSessionFrame | StreamStreamerFrame): string;
/**
 * Apply one screen frame to a materialized screen. Shared by the streamer's
 * reconnect-replay state and recording playback so both reconstruct identical
 * screens from the same frame sequence.
 */
export declare function applyScreenFrame(screen: StreamScreen, frame: StreamScreenFrame): void;
/** Structural validation of an untrusted session frame (socket peer or recording file). */
export declare function isSessionFrame(value: unknown): value is StreamSessionFrame;
/** Non-negative integer terminal dimension. */
export declare function isDimension(value: unknown): value is number;
