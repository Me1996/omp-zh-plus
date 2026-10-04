/**
 * Process-wide registry of automatic downloads and installs: model weights,
 * tool binaries, browsers, side runtimes. The interactive TUI renders them in
 * its download HUD so a feature waiting on a first-use fetch is visibly busy
 * (or visibly failed) instead of silently idle.
 *
 * Producers wrap the work in {@link withDownload} (or drive a
 * {@link DownloadTracker} from {@link trackDownload}); the HUD subscribes with
 * {@link onDownloadActivity}. Headless modes simply have no subscriber.
 *
 * @example
 * await withDownload("SmolLM2-135M", tracker =>
 *   downloadFile(url, dest, { onProgress: (loaded, total) => tracker.update({ loaded, total }) }),
 * );
 */
/** Snapshot of one download or install. */
export interface DownloadActivity {
    /** Unique for the lifetime of the process. */
    id: number;
    /** What is being fetched, e.g. `SmolLM2-135M` or `yt-dlp`. */
    label: string;
    /** Current step or file, e.g. `model.safetensors` or `installing mlx-lm`. */
    detail?: string;
    /** Bytes received so far, when known. */
    loaded?: number;
    /** Total bytes, when known. */
    total?: number;
    state: "running" | "done" | "failed";
    /** Failure reason when `state` is `failed`. */
    error?: string;
}
/** Progress fields a producer may report; omitted fields keep their last value. */
export interface DownloadProgressUpdate {
    loaded?: number;
    total?: number;
    detail?: string;
}
/** Handle for one tracked download; `done`/`fail` end it and later calls are ignored. */
export interface DownloadTracker {
    update(progress: DownloadProgressUpdate): void;
    done(): void;
    fail(error: unknown): void;
}
type Listener = (activity: DownloadActivity) => void;
/** Subscribe to every download's updates; returns the unsubscribe function. */
export declare function onDownloadActivity(listener: Listener): () => void;
/** Start tracking a download or install labelled `label`. */
export declare function trackDownload(label: string, initial?: DownloadProgressUpdate): DownloadTracker;
/**
 * Run `work` as a tracked download: done when it resolves, failed (and
 * rethrown) when it rejects.
 */
export declare function withDownload<T>(label: string, work: (tracker: DownloadTracker) => Promise<T>, initial?: DownloadProgressUpdate): Promise<T>;
export {};
