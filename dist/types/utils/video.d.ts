/** Container MIME for a video path, or undefined for non-video. */
export declare function videoMimeForPath(filePath: string): string | undefined;
/** Frame (`clip.mp4:412`) or timestamp (`clip.mp4:1h5m42s`) subread selector. */
export type VideoSelector = {
    kind: "frame";
    frame: number;
} | {
    kind: "time";
    seconds: number;
    raw: string;
};
/**
 * Parse a read-selector suffix for a video path. Bare integers are frame
 * indices; colon/unit timestamps and fractional seconds are seek positions.
 * Returns null when the suffix is not video-selector-shaped.
 */
export declare function parseVideoSelector(sel: string | undefined): VideoSelector | null;
/** Parse a timestamp suffix into seconds, or null when not timestamp-shaped. */
export declare function parseVideoTimestamp(value: string): number | null;
export declare function splitVideoReadTarget(rawPath: string): {
    path: string;
    sel: string;
} | null;
/** Stream-level facts surfaced in the text details block. */
export interface VideoMetadata {
    readonly durationSec: number | undefined;
    readonly videoCodec: string | undefined;
    readonly audioCodec: string | undefined;
    readonly width: number | undefined;
    readonly height: number | undefined;
    readonly fps: number | undefined;
    readonly formatName: string | undefined;
}
/** Raised when ffmpeg/ffprobe is missing or a video operation fails. Message is user-facing. */
export declare class VideoError extends Error {
}
/** Resolve a system media binary or throw a user-facing install hint. */
export declare function requireMediaBinary(name: "ffmpeg" | "ffprobe"): string;
/**
 * Probe container metadata with ffprobe. Never throws on unparseable output —
 * unknown fields come back undefined so the read still yields a contact sheet.
 */
export declare function probeVideo(absolutePath: string, signal?: AbortSignal): Promise<VideoMetadata>;
/** Format seconds as `1h5m42s` (or `m:ss` below an hour) for details blocks. */
export declare function formatVideoTimestamp(totalSeconds: number): string;
/**
 * One-line text details for a video: name, container, duration, resolution,
 * fps, codecs, file size. Shared by reads and @mention/CLI attachments.
 */
export declare function formatVideoDetails(displayPath: string, meta: VideoMetadata, fileSize: number, mimeType: string | undefined): string;
/** Binary-unit size (`512 B`, `1.5 KiB`, `3.2 MiB`) for resource details. */
export declare function formatByteSize(bytes: number): string;
/** Base64 PNG bytes plus its MIME, ready to attach as an image block. */
export interface VideoPng {
    readonly data: string;
    readonly mimeType: "image/png";
}
/** Run ffmpeg with bounded, abort-aware process cleanup and a user-facing failure. */
export declare function runFfmpeg(args: string[], signal?: AbortSignal): Promise<void>;
/**
 * Extract one frame as PNG: timestamp selectors seek (`-ss` before `-i`),
 * frame indices use the `select` filter from the start.
 */
export declare function extractVideoFramePng(absolutePath: string, selector: VideoSelector, signal?: AbortSignal): Promise<VideoPng>;
/** Contact-sheet layout: thumbnails, grid columns/rows. */
export interface ContactSheet {
    readonly png: VideoPng;
    readonly thumbs: number;
    readonly cols: number;
    readonly rows: number;
}
/**
 * Build a contact-sheet preview: evenly spaced frames across the duration,
 * tiled into one PNG. Input seeks keep each extraction cheap even on long
 * files; the tile pass only ever sees thumbnail-sized inputs.
 */
export declare function buildVideoContactSheetPng(absolutePath: string, meta: VideoMetadata, signal?: AbortSignal): Promise<ContactSheet>;
/** Options for selecting changed frames and composing a labeled recording contact sheet. */
export interface ChangedFrameContactSheetOptions {
    /** Destination PNG path. */
    readonly outputPath: string;
    /** Constant frame rate of the encoded source. */
    readonly fps: number;
    /** Minimum changed-pixel ratio needed to retain an intermediate frame. */
    readonly threshold: number;
    /** Maximum number of tiles, including the first and last frames. */
    readonly maxTiles?: number;
}
/** A labeled contact sheet built from visually changed frames. */
export interface ChangedFrameContactSheet {
    /** Absolute destination path. */
    readonly path: string;
    /** PNG bytes ready for a vision image block. */
    readonly png: VideoPng;
    /** Number of rendered thumbnails. */
    readonly thumbs: number;
    /** Tile-grid columns. */
    readonly cols: number;
    /** Tile-grid rows. */
    readonly rows: number;
    /** Output PNG width. */
    readonly width: number;
    /** Output PNG height. */
    readonly height: number;
}
/**
 * Select visually changed frames from a constant-frame-rate video and write a
 * timestamp-labeled PNG contact sheet. Analysis is disk-backed and streamed.
 */
export declare function buildChangedFrameContactSheetPng(absolutePath: string, options: ChangedFrameContactSheetOptions, signal?: AbortSignal): Promise<ChangedFrameContactSheet>;
