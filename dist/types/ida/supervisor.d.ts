import { type FileLockHandle } from "@oh-my-pi/pi-utils";
import type { IdaRuntime } from "./runtime.js";
import { type FatSelection, type IdbLocation } from "./store.js";
/** RPC methods implemented by the IDA worker. */
export type IdaMethod = "open" | "view" | "exec" | "rename" | "comment" | "set_type" | "make_function" | "save" | "close";
/** Loader facts the worker reports when a database opens. */
export interface IdaDatabaseInfo {
    module: string;
    format: string;
    arch: string;
    bitness: number;
}
/** Per-request cancellation and deadline; either one interrupts a running request (SIGINT, then SIGKILL). */
export interface IdaRequestOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}
/** The request a worker is currently executing. */
export interface IdaRunningRequest {
    method: IdaMethod;
    startedAt: number;
}
/** One open IDA database backed by a dedicated Python worker process. */
export declare class IdaWorker {
    #private;
    /** Registry key from `locateIdb`. */
    readonly id: string;
    /** Absolute path of the binary or `.i64`/`.idb` the database was opened for. */
    readonly sourcePath: string;
    /** For universal binaries: the analyzed slice and its siblings. */
    readonly fat?: FatSelection;
    /** Worker process id. */
    readonly pid: number;
    private constructor();
    /**
     * Spawn a worker for `loc` and open its database. The caller holds `lock` and has run
     * `prepareStoreDir`; on failure the worker is killed, a half-created store IDB is removed,
     * and the lock stays with the caller. The open cannot be cancelled: idalib ignores SIGINT
     * while opening, so an interrupt would kill the worker mid-creation.
     */
    static start(loc: IdbLocation, runtime: IdaRuntime, lock: FileLockHandle, idleCloseMs: number): Promise<IdaWorker>;
    /** Reference `read` and `ida db=` resolve back to this database (see {@link idbRef}). */
    get ref(): string;
    /** Path of the IDB file as reported by IDA. */
    get idbPath(): string;
    /** Loader facts reported when the database opened. */
    get info(): IdaDatabaseInfo;
    /** Whether a close must save to keep every change: hook-tracked edits, or any `exec` since the last save. */
    get needsSave(): boolean;
    /** Resolves with the worker's exit code once the process is gone. */
    get exited(): Promise<number>;
    /** When the last request was issued (epoch ms); LRU eviction closes the oldest idle database first. */
    get lastUsed(): number;
    /** Whether requests are queued or in flight; busy databases are never evicted. */
    get busy(): boolean;
    /** The request the worker is executing now, if any. */
    get current(): IdaRunningRequest | null;
    /**
     * Send one request to the worker, serialized behind earlier requests. `timeoutMs` covers the
     * queue wait too: a request still queued at its deadline fails with a {@link ToolError} naming
     * the running request, without interrupting it (it belongs to another caller). A timeout or
     * abort while executing interrupts it (SIGINT; on Windows an `interrupt` frame on stdin) and
     * waits {@link INTERRUPT_GRACE_MS} for the answer; a worker that does not answer is killed.
     * Worker-side failures surface as {@link ToolError}.
     */
    request<T>(method: IdaMethod, params: object, options?: IdaRequestOptions): Promise<T>;
    /** Close the worker (saving first when `save`), wait for it to exit, then release the lock and unregister. */
    close(options: {
        save: boolean;
    }): Promise<void>;
}
