import type { Model, ProviderResponseMetadata, RawSseEvent } from "@oh-my-pi/pi-ai";
/** A captured provider response or raw server-sent event. */
export type RawSseDebugRecord = {
    kind: "response";
    sequence: number;
    timestamp: number;
    provider?: string;
    model?: string;
    api?: string;
    status: number;
    requestId?: string | null;
    transport?: string;
} | {
    kind: "event";
    sequence: number;
    timestamp: number;
    provider?: string;
    model?: string;
    api?: string;
    event: string | null;
    raw: string[];
    truncated: boolean;
    originalChars: number;
};
/** Retained events and eviction counters at a point in time. */
export interface RawSseDebugSnapshot {
    records: readonly RawSseDebugRecord[];
    droppedRecords: number;
    droppedChars: number;
    totalEvents: number;
    lastUpdatedAt?: number;
}
/** Format a captured event timestamp as an ISO instant. */
export declare function formatRawSseIsoTime(timestamp: number): string;
/** Encode response metadata as an SSE comment. */
export declare function formatRawSseResponseComment(record: Extract<RawSseDebugRecord, {
    kind: "response";
}>): string;
/** Return wire-format lines for a captured record. */
export declare function rawSseRecordLines(record: RawSseDebugRecord): string[];
/** Bounded, observable capture of raw provider responses and SSE frames. */
export declare class RawSseDebugBuffer {
    #private;
    subscribe(listener: () => void): () => void;
    recordResponse(response: ProviderResponseMetadata, model?: Model): void;
    recordEvent(event: RawSseEvent, model?: Model): void;
    snapshot(): RawSseDebugSnapshot;
    toRawText(): string;
    /**
     * Drop every retained record and reset accounting. Called from
     * {@link AgentSession} teardown so a disposed (e.g. parked subagent) session
     * releases its bounded captured wire records. Notifies subscribers so a live
     * debug viewer redraws empty.
     */
    clear(): void;
}
/** Resolve an owner's capture buffer or the process-wide fallback. */
export declare function resolveRawSseDebugBuffer(owner?: object): RawSseDebugBuffer;
