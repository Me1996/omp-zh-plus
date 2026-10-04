import { type ModelLoadProgressEvent } from "../downloads/model-downloads.js";
import { type RefCountedWorkerHandle, type SpawnedSubprocess } from "./worker-client.js";
/**
 * Shared parent-side plumbing for the warm, ref-counted model workers (speech-
 * to-text and text-to-speech): subprocess wrapping, lazy (re)spawn keyed on the
 * tiny-model env, pending-request bookkeeping that keeps the worker referenced
 * only while work is in flight, progress fan-out, model downloads, and teardown.
 * Each client keeps its own request kinds, streaming, and message semantics.
 */
/** Outcome of a {@link ModelWorkerHost.downloadModel} request. */
export interface ModelDownloadResult {
    ok: boolean;
    error?: string;
}
export interface ModelDownloadOptions<Progress> {
    signal?: AbortSignal;
    onProgress?: (event: Progress) => void;
}
/** Pending model download, owned and settled by the host. */
export interface ModelDownloadRequest<Key extends string> {
    kind: "download";
    modelKey: Key;
    resolve: (result: ModelDownloadResult) => void;
}
/** Worker messages left for the client once the host consumed log/progress/pong/downloaded. */
export type ModelWorkerMessage<Outbound> = Exclude<Outbound, {
    type: "log" | "progress" | "pong" | "downloaded";
}>;
export interface ModelWorkerHostOptions<Inbound, Outbound, Request> {
    /** Log/error prefix, e.g. `"stt"`. */
    name: string;
    spawnWorker: () => RefCountedWorkerHandle<Inbound, Outbound>;
    /** Display label for a model key in the download registry. */
    modelLabel: (modelKey: string) => string;
    handleMessage: (message: ModelWorkerMessage<Outbound>) => void;
    /** Settle a client request when the worker is torn down (`terminated`) or faults. */
    failRequest: (request: Request, error: Error, terminated: boolean) => void;
    /** Whether work tracked outside the pending map (live streams) is active. */
    hasStreams?: () => boolean;
    /** Fail work tracked outside the pending map when the worker goes away. */
    failStreams?: (error: Error) => void;
}
/** Wrap a spawned subprocess as a ref-counted handle sending over `safeSend`. */
export declare function wrapRefCountedSubprocess<Inbound, Outbound>(spawned: SpawnedSubprocess<Outbound>, label: string): RefCountedWorkerHandle<Inbound, Outbound>;
/** Spawn a ref-counted worker, degrading to an inline unavailable stub when the subprocess cannot start. */
export declare function spawnRefCountedWorker<Inbound extends {
    type: string;
    id: string;
}, Outbound extends {
    type: string;
}>(createSubprocess: () => SpawnedSubprocess<Outbound>, label: string, warnMessage: string): RefCountedWorkerHandle<Inbound, Outbound>;
export declare class ModelWorkerHost<Key extends string, Inbound extends {
    type: string;
    id: string;
}, Outbound extends {
    type: string;
    id?: string;
    event?: Progress;
}, Request extends {
    kind: string;
    modelKey: Key;
}, Progress extends ModelLoadProgressEvent & {
    modelKey: Key;
}> {
    #private;
    /** In-flight correlated requests by id; any entry keeps the worker referenced. */
    readonly pending: Map<string, Request | ModelDownloadRequest<Key>>;
    constructor(options: ModelWorkerHostOptions<Inbound, Outbound, Request>);
    nextId(): string;
    onProgress(listener: (event: Progress) => void): () => void;
    emitProgress(event: Progress, error?: string): void;
    ensureWorker(): RefCountedWorkerHandle<Inbound, Outbound>;
    /** Register a pending request and keep the worker referenced while work is in flight. */
    addPending(id: string, request: Request | ModelDownloadRequest<Key>): void;
    /** Drop a pending request and unref the worker once nothing is in flight. */
    deletePending(id: string): void;
    /**
     * Workers start unreferenced so an idle warm model never blocks exit. A
     * short-lived command (`omp say`, STT setup/download) awaiting IPC would
     * otherwise let Bun drain the event loop and exit before the reply arrives,
     * so the worker is `ref`'d exactly while a request or stream is active.
     */
    syncWorkerRef(): void;
    /**
     * Send one correlated request and await its settlement. The request stays
     * registered (keeping the worker referenced) until it settles; an abort
     * unregisters it and settles it through `onAbort`.
     */
    request<T>(signal: AbortSignal | undefined, message: (id: string) => Inbound, pending: (resolve: (value: T) => void, reject: (error: Error) => void) => Request | ModelDownloadRequest<Key>, onAbort: (resolve: (value: T) => void, reject: (error: Error) => void) => void): Promise<T>;
    downloadModel(modelKey: Key, options?: ModelDownloadOptions<Progress>): Promise<ModelDownloadResult>;
    terminate(): Promise<void>;
}
