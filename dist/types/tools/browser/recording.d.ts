import { ToolError } from "@oh-my-pi/pi-tui-zh/tools/tool-errors";
import type { Page } from "puppeteer-core";
import type { RunOutput } from "./run-output.js";
/** Options accepted by browser video recording helpers. */
export interface RecordingOptions {
    /** Constant output frames per second, from 1 through 60. */
    fps?: number;
    /** Draw page mouse movement and click ripples into captured frames. */
    cursor?: boolean;
    /** Write and display a changed-frame PNG contact sheet after encoding. */
    contactSheet?: boolean;
    /** Changed-pixel ratio, from 0 through 1, needed for an intermediate contact-sheet tile. */
    contactSheetThreshold?: number;
    /** Capture and encoding quality, from 0 through 100. */
    quality?: number;
}
/** Result returned after recording starts. */
export interface RecordingStartResult {
    /** Absolute output video path. */
    readonly path: string;
    /** Constant output frames per second. */
    readonly fps: number;
}
/** Result returned after a recording is finalized. */
export interface RecordingStopResult {
    /** Absolute output video path. */
    readonly path: string;
    /** Elapsed recording time in milliseconds. */
    readonly durationMs: number;
    /** Number of CDP screencast frames captured before constant-rate duplication. */
    readonly frames: number;
    /** Encoded video size in bytes. */
    readonly bytes: number;
    /** Absolute changed-frame contact-sheet path when requested. */
    readonly contactSheet?: string;
}
/** Current persistent recording state for a tab worker. */
export interface RecordingStatus {
    /** Whether the tab is currently recording. */
    readonly active: boolean;
    /** Absolute destination path while active. */
    readonly path?: string;
    /** Requested constant frame rate while active. */
    readonly fps?: number;
    /** Elapsed milliseconds while active. */
    readonly durationMs?: number;
    /** Number of screencast frames accepted so far. */
    readonly frames?: number;
}
/** Context used to surface contact-sheet images from the active browser run. */
export interface RecordingStopContext {
    /** Active run cancellation signal. */
    readonly signal?: AbortSignal;
    /** Run output receiving the generated contact-sheet image. */
    readonly output?: RunOutput;
    /** Prevent WebP conversion when the active vision backend cannot decode it. */
    readonly excludeWebP?: boolean;
}
/** One captured viewport frame delivered by a `RecordingFrameSource`. */
export interface RecordingFrame {
    /** JPEG bytes. */
    data: Uint8Array;
    /** Capture time in milliseconds on a monotonic-enough clock shared by every frame of one recording. */
    timestampMs: number;
}
/** Parameters for `RecordingFrameSource.start`. */
export interface RecordingFrameSourceStartParams {
    /** JPEG quality, 0 through 100. */
    quality: number;
    /** Maximum frame width in CSS px. */
    maxWidth: number;
    /** Maximum frame height in CSS px. */
    maxHeight: number;
    /** Deliver every Nth rendered frame (60 Hz basis); sources without a render clock MAY ignore it. */
    everyNthFrame?: number;
    /** Persist one frame; resolves once persisted (backpressure/ack) and never rejects. */
    onFrame(frame: RecordingFrame): Promise<void>;
}
/** Delivers JPEG viewport frames to a recording. */
export interface RecordingFrameSource {
    /** Viewport size in CSS px, used to bound frame dimensions. */
    viewport(signal?: AbortSignal): Promise<{
        width: number;
        height: number;
    }>;
    /** Start delivering frames; `onFrame` resolves once the frame is persisted (backpressure/ack). */
    start(params: RecordingFrameSourceStartParams, signal?: AbortSignal): Promise<void>;
    /** Stop delivering frames (idempotent); no `onFrame` call starts after it resolves. */
    stop(): Promise<void>;
    /** Capture one JPEG of the viewport; used when a recording ends without any delivered frame. */
    captureFrame(quality: number, signal?: AbortSignal): Promise<Uint8Array>;
    /** Install the cursor overlay page script (`installCursorOverlay`) for current and future documents. */
    installCursor(signal?: AbortSignal): Promise<void>;
    /** Remove the cursor overlay from future and current documents; never throws. */
    removeCursor(): Promise<void>;
}
/** Named user-facing recording failure raised by every `tab.record*` helper. */
export declare class BrowserRecordingError extends ToolError {
    constructor(message: string);
}
/** Page function (self-contained): draw a pointer and click ripples that follow page mouse events. Re-entrant. */
export declare function installCursorOverlay(): void;
/** Page function removing the cursor overlay `installCursorOverlay` drew, and its listeners. */
export declare function removeCursorOverlay(): void;
/** Frame source backed by a CDP `Page.startScreencast` session on `page`. */
export declare function createCdpRecordingSource(page: Page): RecordingFrameSource;
/** Persistent, disk-backed recording state owned by one tab worker. */
export declare class RecordingController {
    #private;
    /** Start recording frames from `source` to an absolute cwd-resolved MP4 or WebM path. */
    start(source: RecordingFrameSource, rawPath: string, cwd: string, options?: RecordingOptions, signal?: AbortSignal): Promise<RecordingStartResult>;
    /** Stop and finalize the active recording. */
    stop(context?: RecordingStopContext): Promise<RecordingStopResult>;
    /** Finalize an active recording, then immediately begin another. */
    restart(source: RecordingFrameSource, rawPath: string, cwd: string, options: RecordingOptions | undefined, context?: RecordingStopContext): Promise<RecordingStartResult>;
    /** Return the current persistent recording state without touching the page. */
    status(): RecordingStatus;
    /** Finalize the active recording during tab teardown, discarding failed output. */
    close(): Promise<void>;
}
