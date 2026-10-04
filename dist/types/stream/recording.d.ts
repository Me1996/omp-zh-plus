import type { TUI } from "@oh-my-pi/pi-tui-zh";
import { type StreamScreenFrame } from "./protocol.js";
import type { StreamRedactor } from "./redactor.js";
export declare const RECORDING_VERSION = 1;
export declare const RECORDING_EXTENSION = ".ompcast";
/** First line of a recording file. */
export interface RecordingHeader {
    ompcast: number;
    cols: number;
    rows: number;
    title: string;
    createdAt: string;
    /** Clip description, set by `omp clip --description`. */
    description?: string;
    /** Uploading Stencil username, stamped by the clip server. */
    owner?: string;
}
/** One timestamped screen frame; `at` is milliseconds since the recording started. */
export interface RecordingEvent {
    at: number;
    frame: StreamScreenFrame;
}
export interface Recording {
    header: RecordingHeader;
    events: RecordingEvent[];
}
/** Directory `/record` writes into (temporary storage for now). */
export declare function recordingsDir(): string;
/** Fresh, sortable recording path for one session: `<recordingsDir>/<utc-stamp>-<session>.ompcast`. */
export declare function newRecordingPath(sessionId: string): string;
/** Newest recording in {@link recordingsDir}, or null when there is none. */
export declare function latestRecording(): Promise<string | null>;
/**
 * Parse a recording file's contents.
 *
 * @throws {Error} when the header is missing/unsupported or a complete line is
 *   not a valid `[ms, frame]` event.
 */
export declare function parseRecording(text: string): Recording;
export interface SessionRecorderOptions {
    tui: TUI;
    redactor: StreamRedactor;
    title: string;
    /** Destination file; parent directories are created. */
    path: string;
}
/** Records one interactive session's painted screen to an `.ompcast` file. */
export declare class SessionRecorder {
    #private;
    readonly path: string;
    /** Open the file, write the header, and start observing paints. */
    static start(options: SessionRecorderOptions): Promise<SessionRecorder>;
    private constructor();
    /** Milliseconds recorded so far. */
    get elapsedMs(): number;
    /** Stop observing, write pending frames, and close the file. Idempotent. */
    stop(): Promise<void>;
}
