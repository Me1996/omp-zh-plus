/**
 * Cross-process contract between omp processes and the broker-supervised IDA host daemon.
 *
 * Each open database runs in one daemon named {@link idaDaemonName} under the project's daemon
 * broker (so it shows up in `omp ps`). The daemon is an omp worker (`host.ts`) that owns the
 * IDB lock and one Python worker, and serves NDJSON requests on {@link idaHostEndpoint}.
 */
import type * as net from "node:net";
export { IDA_HOST_WORKER_ARG } from "../cli/worker-selectors.js";
/** Environment key carrying the JSON {@link IdaHostConfig} for the daemon. */
export declare const IDA_HOST_CONFIG_ENV = "OMP_IDA_HOST_CONFIG";
/** Name prefix of every IDA daemon in a broker scope. */
export declare const IDA_DAEMON_PREFIX = "omp.ida.";
/** Broker readiness regex matched against the banner the host prints once it listens. */
export declare const IDA_HOST_READY_PATTERN: string;
/** Banner printed on stdout once the host socket accepts connections. */
export declare function idaHostReadyBanner(endpoint: string): string;
/** Message text of any thrown value, for logs and wire errors. */
export declare function errorMessage(error: unknown): string;
/** Feed every complete newline-terminated, non-blank line received on `socket` to `onLine`. */
export declare function readSocketLines(socket: net.Socket, onLine: (line: string) => void): void;
/** Write one NDJSON frame unless the socket is already gone. */
export declare function writeFrame(socket: net.Socket, frame: object): void;
/** Broker daemon name for the database registered under `id` (a `locateIdb` id). */
export declare function idaDaemonName(id: string): string;
/** Unix socket or Windows named pipe the host for `daemonName` listens on. */
export declare function idaHostEndpoint(projectDir: string, runtimeDir: string, daemonName: string): string;
/** RPC methods an omp process may forward to the worker through `call`. */
export declare const IDA_CALL_METHODS: readonly ["view", "exec", "rename", "comment", "set_type", "make_function", "save"];
/** A method forwarded with `call`. */
export type IdaCallMethod = (typeof IDA_CALL_METHODS)[number];
declare const hostRequestSchema: import("@oh-my-pi/omptype").FluentType<{
    id: number;
    method: "comment" | "exec" | "make_function" | "rename" | "save" | "set_type" | "view";
    op: "call";
    params: object;
    timeoutMs?: number | undefined;
} | {
    id: number;
    op: "cancel";
    target: number;
} | {
    id: number;
    op: "close";
    save: boolean;
} | {
    id: number;
    op: "flush" | "open" | "ping" | "status";
}, {
    id: number;
    op: "flush" | "open" | "ping" | "status";
} | {
    id: number;
    method: "comment" | "exec" | "make_function" | "rename" | "save" | "set_type" | "view";
    op: "call";
    params: object;
    timeoutMs?: number | undefined;
} | {
    id: number;
    op: "cancel";
    target: number;
} | {
    id: number;
    op: "close";
    save: boolean;
}>;
/**
 * One request frame sent to the host.
 * - `ping`: liveness probe, answered `"pong"` in any state.
 * - `open`: wait until the database is open; answers {@link IdaHostStatus} or the open failure.
 * - `status`: current {@link IdaHostStatus} without waiting.
 * - `call`: forward one worker request; `timeoutMs` covers the queue wait too.
 * - `cancel`: abort the caller's own pending `call` `target` (no answer).
 * - `flush`: save when there are unsaved changes; answers `{ saved }`.
 * - `close`: save (when `save`) and close; the host exits after answering.
 */
export type IdaHostRequest = typeof hostRequestSchema.infer;
/** Decode one request line; throws on a malformed frame. */
export declare function parseIdaHostRequest(line: string): IdaHostRequest;
declare const hostResponseSchema: import("@oh-my-pi/omptype").FluentType<{
    error: string;
    id: number;
    ok: false;
} | {
    id: number;
    ok: true;
    result?: unknown;
}, {
    id: number;
    ok: true;
    result?: unknown;
} | {
    error: string;
    id: number;
    ok: false;
}>;
/** One response frame from the host. */
export type IdaHostResponse = typeof hostResponseSchema.infer;
/** Decode one response line; throws on a malformed frame. */
export declare function parseIdaHostResponse(line: string): IdaHostResponse;
declare const hostStatusSchema: import("@oh-my-pi/omptype").FluentType<{
    busy: boolean;
    current: {
        method: string;
        startedAt: number;
    } | null;
    dirty: boolean;
    fat?: {
        slice: {
            arch: string;
            cpuType: number;
            offset: number;
            size: number;
        };
        slices: {
            arch: string;
            cpuType: number;
            offset: number;
            size: number;
        }[];
    } | undefined;
    id: string;
    idbPath: string;
    info: {
        arch: string;
        bitness: number;
        format: string;
        module: string;
    };
    lastUsed: number;
    ref: string;
    state: "open" | "opening";
}, {
    busy: boolean;
    current: {
        method: string;
        startedAt: number;
    } | null;
    dirty: boolean;
    fat?: {
        slice: {
            arch: string;
            cpuType: number;
            offset: number;
            size: number;
        };
        slices: {
            arch: string;
            cpuType: number;
            offset: number;
            size: number;
        }[];
    } | undefined;
    id: string;
    idbPath: string;
    info: {
        arch: string;
        bitness: number;
        format: string;
        module: string;
    };
    lastUsed: number;
    ref: string;
    state: "open" | "opening";
}>;
/**
 * A host's database as reported by `open`/`status`. `busy` counts queued and running requests
 * from every omp process; `lastUsed` drives LRU eviction; `dirty` means a close would save.
 */
export type IdaHostStatus = typeof hostStatusSchema.infer;
/** Validate a `status`/`open` result. */
export declare function parseIdaHostStatus(value: unknown): IdaHostStatus;
declare const hostConfigSchema: import("@oh-my-pi/omptype").FluentType<{
    endpoint: string;
    idleCloseMs: number;
    loc: {
        dir: string;
        fat?: {
            slice: {
                arch: string;
                cpuType: number;
                offset: number;
                size: number;
            };
            slices: {
                arch: string;
                cpuType: number;
                offset: number;
                size: number;
            }[];
        } | undefined;
        id: string;
        isNew: boolean;
        kind: "inplace" | "store";
        lockTarget: string;
        openPath: string;
        sourcePath: string;
    };
    runtime: {
        env: Record<string, string>;
        pythonPath: string;
    };
}, {
    endpoint: string;
    idleCloseMs: number;
    loc: {
        dir: string;
        fat?: {
            slice: {
                arch: string;
                cpuType: number;
                offset: number;
                size: number;
            };
            slices: {
                arch: string;
                cpuType: number;
                offset: number;
                size: number;
            }[];
        } | undefined;
        id: string;
        isNew: boolean;
        kind: "inplace" | "store";
        lockTarget: string;
        openPath: string;
        sourcePath: string;
    };
    runtime: {
        env: Record<string, string>;
        pythonPath: string;
    };
}>;
/** Everything the host needs to open its database; built by the omp process that starts it. */
export type IdaHostConfig = typeof hostConfigSchema.infer;
/** Decode the host config from {@link IDA_HOST_CONFIG_ENV}; throws on a malformed value. */
export declare function parseIdaHostConfig(json: string): IdaHostConfig;
