import type { ToolSession } from "../tools/index.js";
import { type IdaCallMethod, type IdaHostStatus } from "./protocol.js";
import { type FatSelection, type LocateIdbOptions } from "./store.js";
import type { IdaDatabaseInfo, IdaRequestOptions } from "./supervisor.js";
/**
 * An open IDA database as seen from this omp process: a connection to its host daemon plus the
 * last reported {@link IdaHostStatus}. Shared by every agent in the process.
 */
export declare class IdaDatabase {
    #private;
    /** Broker daemon name (`omp ps` row, `omp ps logs <name>`). */
    readonly name: string;
    private constructor();
    /**
     * Connect to the host for `name` and fetch its status (`open` waits for the database to open).
     * Undefined when no host listens; throws the host's open failure.
     */
    static attach(name: string, endpoint: string, op: "open" | "status"): Promise<IdaDatabase | undefined>;
    /** Registry key from `locateIdb`. */
    get id(): string;
    /** Reference `read` and `ida db=` resolve back to this database (see `idbRef`). */
    get ref(): string;
    /** For universal binaries: the analyzed slice and its siblings. */
    get fat(): FatSelection | undefined;
    /** Path of the IDB file as reported by IDA. */
    get idbPath(): string;
    /** Loader facts reported when the database opened. */
    get info(): IdaDatabaseInfo;
    /** Last status fetched from the host. */
    get status(): IdaHostStatus;
    /** Whether the host connection is still up. */
    get connected(): boolean;
    /** Refetch the host's status; `open` first waits for the database to finish opening. */
    refresh(op?: "open" | "status"): Promise<IdaHostStatus>;
    /**
     * Run one worker request on the host, queued behind requests from every omp process.
     * `timeoutMs` covers the queue wait; an abort cancels this request only (see `IdaWorker.request`).
     */
    request<T>(method: IdaCallMethod, params: object, options?: IdaRequestOptions): Promise<T>;
    /** Save when the database has unsaved changes. */
    flush(): Promise<void>;
    /** Close the database (saving first when `save`); its host exits afterwards. */
    close(options: {
        save: boolean;
    }): Promise<void>;
    /** Drop this process's connection; the host keeps running. */
    disconnect(): void;
}
/** Options for {@link acquireIdaDatabase}. */
export interface AcquireIdaDatabaseOptions extends LocateIdbOptions {
    signal?: AbortSignal;
}
/**
 * Return the open database for a binary (or one slice of a universal binary) or `.i64`/`.idb`,
 * starting its host and opening (or creating) it on first use. Concurrent callers share one open;
 * aborting `signal` or exceeding {@link OPEN_WAIT_MS} stops only this caller's wait, the open itself
 * always runs to completion.
 *
 * Throws a ToolError when the database is still opening after {@link OPEN_WAIT_MS}.
 */
export declare function acquireIdaDatabase(session: ToolSession, sourcePath: string, options?: AcquireIdaDatabaseOptions): Promise<IdaDatabase>;
/** The open database with `locateIdb` id (or daemon name) `ref` in this project, if any. */
export declare function findOpenIdaDatabase(session: ToolSession, ref: string): Promise<IdaDatabase | undefined>;
/** Every database hosted in this project, including ones other omp processes opened. */
export declare function listIdaDatabases(session: ToolSession): Promise<IdaDatabase[]>;
/**
 * Save every attached database with unsaved changes and drop this process's connections; the hosts
 * keep running for other omp processes and exit with the project's broker. Failures are logged.
 */
export declare function releaseIdaDatabases(): Promise<void>;
/** Exercise worker-host IDA host startup and the ping handshake for distribution smoke tests. */
export declare function smokeTestIdaHost(): Promise<void>;
