/** Structural subset of the tiny/STT/TTS worker progress events. */
export interface ModelLoadProgressEvent {
    modelKey: string;
    status: "initiate" | "download" | "progress" | "progress_total" | "done" | "ready" | "error";
    name?: string;
    file?: string;
    loaded?: number;
    total?: number;
    files?: Record<string, {
        loaded: number;
        total: number;
    }>;
}
/**
 * Per-client model load tracking. The client feeds every progress event to
 * {@link observe}; a load ends on `ready`, and on `error` when the client passes
 * the failure reason. Cache hits never create a tracker. A model that fails
 * before reporting any progress (offline first use) still shows its failure,
 * once, until a later load attempt reports progress again.
 */
export declare class ModelDownloadActivity {
    #private;
    constructor(label: (modelKey: string) => string);
    observe(event: ModelLoadProgressEvent, error?: string): void;
}
