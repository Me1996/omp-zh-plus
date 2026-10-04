import type { Subprocess } from "bun";
import { type RefCountedWorkerHandle } from "../subprocess/worker-client.js";
import { type TinyLocalModelKey } from "./models.js";
import { type TinyChatMessage, type TinyTitleProgressEvent, type TinyWorkerBackend, type TinyWorkerRequest, type TinyWorkerResponse } from "./title-protocol.js";
type WorkerHandle = RefCountedWorkerHandle<TinyWorkerRequest, TinyWorkerResponse>;
export interface TinyTitleDownloadResult {
    ok: boolean;
    error?: string;
}
export interface TinyTitleDownloadOptions {
    signal?: AbortSignal;
    onProgress?: (event: TinyTitleProgressEvent) => void;
}
/**
 * Per-request controls for {@link TinyTitleClient.generate}.
 *
 * Carries the optional abort signal and title-system-prompt override used by
 * callers that customize automatic session-title generation.
 */
export interface TinyTitleGenerateOptions {
    signal?: AbortSignal;
    systemPrompt?: string;
}
export interface TinyModelChatOptions {
    maxTokens?: number;
    signal?: AbortSignal;
}
export interface TinyModelCompletionOptions extends TinyModelChatOptions {
    systemPrompt?: string;
}
/**
 * Map the resolved `providers.tinyModelDevice` / `providers.tinyModelDtype`
 * values onto the `PI_TINY_DEVICE` / `PI_TINY_DTYPE` vars a worker should run
 * with. Only resolved keys are returned — never the default sentinel — so the
 * worker's built-in defaults apply for anything absent. Pure for testability;
 * see {@link tinyModelEnv} for the settings glue.
 * @internal
 */
export declare function tinyWorkerEnvOverlay(deviceSetting: string | undefined, dtypeSetting: string | undefined): Record<string, string>;
/** Identity of the resolved device/dtype; a worker started under a different key is stale. */
export declare function tinyModelEnvKey(): string;
/**
 * Env for an ONNX inference subprocess with the resolved device/dtype —
 * used for the tiny worker and reused verbatim by the STT and TTS workers,
 * which share the same device/dtype resolution.
 */
export declare function tinyWorkerEnv(): Record<string, string>;
/** Whether a worker started now would run the MLX backend (device resolves to `mlx` on Apple silicon). */
export declare function tinyWorkerUsesMlx(): boolean;
/** Error surfaced when the worker closes the socket (idle exit or replacement); the client reconnects on demand. */
export declare const TINY_WORKER_CLOSED = "tiny worker connection closed";
interface SpawnedWorker {
    proc: Subprocess;
    logPath: string;
}
/** How to start one worker: its backend (socket name), launch tag, and spawn recipe. */
export interface WorkerLaunch {
    backend: TinyWorkerBackend;
    tag: string;
    spawn(endpoint: string, logPath: string): Promise<SpawnedWorker>;
}
/** How to start the ONNX worker for `modelKey` with the resolved device/dtype env. @internal */
export declare function onnxLaunch(modelKey: TinyLocalModelKey, modelEnv: Record<string, string>): WorkerLaunch;
/**
 * Connect to the worker serving `modelKey`, spawning it when absent or
 * replacing it when its launch tag is stale. A concurrent omp process may win
 * the spawn race; our child then fails to bind and exits while the probe
 * adopts the winner.
 */
export declare function connectTinyWorker(launch: WorkerLaunch, modelKey: TinyLocalModelKey, runtimeDir?: string): Promise<WorkerHandle>;
/**
 * Per-model worker connections. Device/dtype settings are read at use time: a
 * connection made under a different device/dtype is replaced on its next idle
 * use, and the launch-tag probe then swaps the machine-wide worker.
 */
export declare class TinyTitleClient {
    #private;
    constructor(connect?: (modelKey: TinyLocalModelKey) => Promise<WorkerHandle>);
    onProgress(listener: (event: TinyTitleProgressEvent) => void): () => void;
    /**
     * Reach the model's worker ahead of first use without loading anything, so
     * the first {@link generate} finds a live connection instead of paying the
     * probe/spawn latency on the submit hot path (issue #6462). No-ops for
     * online / non-local keys and for models already marked failed.
     */
    prewarm(modelKey: string): void;
    generate(modelKey: string, message: string, signal?: AbortSignal): Promise<string | null>;
    generate(modelKey: string, message: string, options?: TinyTitleGenerateOptions): Promise<string | null>;
    chat(modelKey: string, messages: readonly TinyChatMessage[], options?: TinyModelChatOptions): Promise<string | null>;
    complete(modelKey: string, promptText: string, options?: TinyModelCompletionOptions): Promise<string | null>;
    downloadModel(modelKey: string, options?: TinyTitleDownloadOptions): Promise<TinyTitleDownloadResult>;
    terminate(): Promise<void>;
}
export declare const tinyTitleClient: TinyTitleClient;
/** Alias for the shared tiny-model worker client (titles + generic chat completions). */
export declare const tinyModelClient: TinyTitleClient;
/** Drop this process's worker connections; the workers themselves keep serving others until idle. */
export declare function shutdownTinyTitleClient(): Promise<void>;
/** Exercise ONNX worker startup and the tagged ping handshake for distribution smoke tests. */
export declare function smokeTestTinyTitleWorker({ timeoutMs, }?: {
    timeoutMs?: number;
}): Promise<void>;
export {};
