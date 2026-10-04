import type { AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
/** Default maximum number of inline output lines. */
export declare const DEFAULT_MAX_LINES = 3000;
/** Default inline output budget in UTF-8 bytes. */
export declare const DEFAULT_MAX_BYTES: number;
/** Default UTF-8 byte budget per match line. */
export declare const DEFAULT_MAX_COLUMN = 512;
/**
 * Default artifact-on-disk cap for {@link OutputSink}: 16 MiB, split into a
 * {@link ARTIFACT_DEFAULT_HEAD_BYTES} head and a rolling tail. `0` means
 * unbounded (the complete raw stream is preserved).
 */
export declare const ARTIFACT_DEFAULT_MAX_BYTES: number;
/** Default head budget; the remainder becomes the rolling tail window. */
export declare const ARTIFACT_DEFAULT_HEAD_BYTES: number;
/** First failed artifact I/O operation; safe to persist without exposing filesystem errors. */
export type OutputArtifactError = "open" | "write" | "flush" | "end";
/** Captured output with inline truncation and artifact storage metadata. */
export interface OutputSummary {
    output: string;
    truncated: boolean;
    totalLines: number;
    totalBytes: number;
    outputLines: number;
    outputBytes: number;
    /** Bytes elided from the middle when head-retain mode is active. */
    elidedBytes?: number;
    /** Lines elided from the middle when head-retain mode is active. */
    elidedLines?: number;
    /** Bytes dropped by the per-line column cap (sum across all lines). */
    columnDroppedBytes?: number;
    /** Number of distinct lines that hit the per-line column cap. */
    columnTruncatedLines?: number;
    /** Configured per-line column cap in effect (UTF-8 bytes), when > 0. */
    columnMax?: number;
    /** Artifact ID for internal URL access (artifact://<id>) when truncated */
    artifactId?: string;
    /**
     * Bytes the artifact cap dropped from the middle of the saved file. When
     * set, `artifact://<id>` holds a head/tail sample, not the full output.
     */
    artifactElidedBytes?: number;
    /** Full raw output was not completely saved; artifactId is unavailable. */
    artifactError?: OutputArtifactError;
}
/** Inline capture, artifact storage, and streaming callback options. */
export interface OutputSinkOptions {
    artifactPath?: string;
    artifactId?: string;
    /**
     * Total inline body budget (bytes). Default DEFAULT_MAX_BYTES. The head
     * window and rolling tail window share this budget, so a composed
     * `dump()` body never exceeds it (plus the elision marker).
     */
    spillThreshold?: number;
    /**
     * When > 0, the sink keeps the first `headBytes` of output in addition to
     * the rolling tail window. Output between the two windows is elided
     * (middle elision). Clamped to `spillThreshold / 2` so the tail keeps at
     * least half the inline budget. Default 0 = tail-only behavior.
     */
    headBytes?: number;
    /**
     * Per-line byte cap. When > 0, lines wider than `maxColumns` bytes are
     * truncated with an ellipsis at write time; remaining bytes up to the next
     * `\n` are dropped. Cap state persists across chunks so split-mid-line
     * writes still respect the budget. Default 0 = no per-line cap.
     */
    maxColumns?: number;
    onChunk?: (chunk: string) => void;
    /** Minimum ms between onChunk calls. 0 = every chunk (default). */
    chunkThrottleMs?: number;
    /**
     * Cap on bytes written to the artifact-on-disk file. When the cap is hit,
     * the head window is preserved verbatim and subsequent output feeds a
     * rolling tail window; on close, the sink writes a single
     * `[ARTIFACT TRUNCATED: …]` notice between them. Default
     * {@link ARTIFACT_DEFAULT_MAX_BYTES} (16 MiB); `0` = unbounded.
     */
    artifactMaxBytes?: number;
    /**
     * Bytes reserved for the head window of the capped artifact file. The
     * tail window receives `artifactMaxBytes - artifactHeadBytes`. Default
     * {@link ARTIFACT_DEFAULT_HEAD_BYTES}, but at most half of
     * `artifactMaxBytes`; clamped to `[0, artifactMaxBytes]`.
     */
    artifactHeadBytes?: number;
}
/** Retained text and measurements describing a truncated output window. */
export interface TruncationResult {
    content: string;
    truncated?: boolean;
    truncatedBy?: "lines" | "bytes" | "middle";
    totalLines: number;
    totalBytes: number;
    outputLines?: number;
    outputBytes?: number;
    /** Bytes elided from the middle (truncateMiddle only). */
    elidedBytes?: number;
    /** Lines elided from the middle (truncateMiddle only). */
    elidedLines?: number;
    /** Exact source-line counts retained before/after the middle marker. */
    headLines?: number;
    tailLines?: number;
    /** True when either retained side is a partial byte range of a source line. */
    partialByteWindows?: boolean;
    /** True when the retained suffix ends with a partial final source line. */
    lastLinePartial?: boolean;
    firstLineExceedsLimit?: boolean;
}
/** Line and byte budgets for head, tail, or middle truncation. */
export interface TruncationOptions {
    /** Maximum number of lines (default: 3000) */
    maxLines?: number;
    /** Maximum number of bytes (default: 50KB) */
    maxBytes?: number;
    /**
     * For `truncateMiddle`: bytes reserved for the head window. The tail
     * window receives `maxBytes - maxHeadBytes`. Default `floor(maxBytes/2)`.
     */
    maxHeadBytes?: number;
    /**
     * For `truncateMiddle`: lines reserved for the head window. The tail
     * window receives `maxLines - maxHeadLines`. Default `floor(maxLines/2)`.
     */
    maxHeadLines?: number;
}
/** Result from byte-level truncation helpers. */
export interface ByteTruncationResult {
    text: string;
    bytes: number;
}
/** Context included in a notice for tail-retained output. */
export interface TailTruncationNoticeOptions {
    fullOutputPath?: string;
    originalContent?: string;
    suffix?: string;
}
/** File coordinates included in a notice for head-retained output. */
export interface HeadTruncationNoticeOptions {
    startLine?: number;
    totalFileLines?: number;
}
/**
 * Truncate a string/buffer to fit within a byte limit, keeping the tail.
 * Handles multi-byte UTF-8 boundaries correctly.
 */
export declare function truncateTailBytes(data: string | Uint8Array, maxBytes: number): ByteTruncationResult;
/**
 * Truncate a string/buffer to fit within a byte limit, keeping the head.
 * Handles multi-byte UTF-8 boundaries correctly.
 */
export declare function truncateHeadBytes(data: string | Uint8Array, maxBytes: number): ByteTruncationResult;
/**
 * Truncate a single line to max characters, appending '…' if truncated.
 */
export declare function truncateLine(line: string, maxChars?: number): {
    text: string;
    wasTruncated: boolean;
};
/**
 * Truncate a single line to a UTF-8 byte budget, appending '…' if truncated.
 * Mirrors the native grep `truncate_line` (reserves 3 bytes for the marker and
 * cuts on a char boundary) so JS-side virtual-resource matches truncate in the
 * same unit as on-disk matches from the Rust searcher.
 */
export declare function truncateLineBytes(line: string, maxBytes?: number): {
    text: string;
    wasTruncated: boolean;
};
/** Shared helper to build a no-truncation result. */
export declare function noTruncResult(content: string, totalLines?: number, totalBytes?: number): TruncationResult;
/**
 * Truncate content from the head (keep first N lines/bytes).
 * Never returns partial lines. If the first line exceeds the byte limit,
 * returns empty content with firstLineExceedsLimit=true.
 *
 * This implementation avoids Buffer.from(content) for the whole input.
 * It only computes UTF-8 byteLength for candidate lines that can still fit.
 */
export declare function truncateHead(content: string, options?: TruncationOptions): TruncationResult;
/**
 * Truncate content from the tail (keep last N lines/bytes).
 * May return a partial first line if the last line exceeds the byte limit.
 *
 * Also avoids Buffer.from(content) for the whole input.
 */
export declare function truncateTail(content: string, options?: TruncationOptions): TruncationResult;
/**
 * Format the inline marker substituted for the elided middle region.
 * Returned without surrounding newlines so callers can position it freely.
 */
export declare function formatMiddleElisionMarker(elidedLines: number, elidedBytes: number): string;
/**
 * Truncate content keeping a head window and a tail window, eliding the middle.
 *
 * The combined output is `<head>\n<marker>\n<tail>` when truncation is needed.
 * `maxHeadBytes` defaults to `floor(maxBytes / 2)`; the tail receives the
 * remainder. Falls back to `truncateTail` / `truncateHead` if either side's
 * budget is empty or the content already fits.
 */
export declare function truncateMiddle(content: string, options?: TruncationOptions): TruncationResult;
/** Options for {@link enforceInlineByteCap}. */
export interface InlineByteCapOptions {
    /** Inline byte budget. Defaults to {@link DEFAULT_MAX_BYTES}. */
    maxBytes?: number;
    /**
     * Persist the full text as a session artifact. When an artifact id is
     * returned, a `[raw output: artifact://<id>]` footer is appended so the
     * elided bytes stay recoverable.
     */
    saveArtifact?: (full: string) => string | undefined | Promise<string | undefined>;
}
/**
 * Final-defense inline size guard for tool results.
 *
 * No-op when `text` fits within `maxBytes` (the common path). Otherwise keeps
 * ~60% of the budget from the head and ~25% from the tail — cut on line
 * boundaries, never splitting a multi-byte UTF-8 sequence — with an elision
 * marker between. The remaining ~15% is slack for the marker and the optional
 * `[raw output: artifact://<id>]` footer, so the result stays under `maxBytes`.
 */
export declare function enforceInlineByteCap(text: string, options: InlineByteCapOptions): Promise<string>;
/** Byte-bounded rolling text window with lazy chunk joining. */
export declare class TailBuffer {
    #private;
    readonly maxBytes: number;
    constructor(maxBytes: number);
    append(text: string): void;
    text(): string;
    bytes(): number;
}
/** Captures bounded inline output while optionally preserving a full artifact. */
export declare class OutputSink {
    #private;
    constructor(options?: OutputSinkOptions);
    /**
     * Push a chunk of output. The buffer management and onChunk callback run
     * synchronously. File sink writes are deferred and serialized internally.
     *
     * `inline` substitutes a bounded representation for the in-memory buffer and
     * live preview while the complete chunk is mirrored to the artifact.
     * `emitInline: false` keeps that representation out of the live callback.
     */
    push(chunk: string, options?: {
        inline?: string;
        emitInline?: boolean;
    }): void;
    createInput(): WritableStream<Uint8Array | string>;
    /**
     * Replace the in-memory buffer with the given text. Used when an upstream
     * minimizer rewrites the captured output after the raw bytes have already
     * been streamed.
     *
     * After this call the buffer is authoritative: streaming counters realign
     * to the replacement, the retained head window is cleared, and head
     * retention is disabled so subsequent `push()` calls append directly to the
     * tail buffer instead of repopulating the (now meaningless) head window
     * — which would otherwise reorder content and trip the middle-elision
     * branch in `dump()` against stale totals.
     */
    replace(text: string): void;
    dump(notice?: string): Promise<OutputSummary>;
    /**
     * Release the artifact spill descriptor on an exit path that skips
     * {@link dump} — a thrown error or abort. Idempotent and safe in a
     * `finally`: if {@link dump} already ran this is a no-op, otherwise it
     * flushes the capped tail and closes the sink so the descriptor is not
     * leaked until a later unrelated read hits `EMFILE` (issue #6463).
     */
    dispose(): Promise<void>;
}
/**
 * Format a truncation notice for tail-truncated output (bash, python, ssh).
 * Returns empty string if not truncated.
 */
export declare function formatTailTruncationNotice(truncation: TruncationResult, options?: TailTruncationNoticeOptions): string;
/**
 * Format a truncation notice for head-truncated output (read tool).
 * Returns empty string if not truncated.
 */
export declare function formatHeadTruncationNotice(truncation: TruncationResult, options?: HeadTruncationNoticeOptions): string;
/**
 * Build an onChunk handler that appends to a TailBuffer and emits a streaming
 * update (when `onUpdate` is defined) with the buffer's current text.
 */
export declare function streamTailUpdates<TDetails, TInput = unknown>(tailBuffer: TailBuffer, onUpdate: AgentToolUpdateCallback<TDetails, TInput> | undefined): (chunk: string) => void;
