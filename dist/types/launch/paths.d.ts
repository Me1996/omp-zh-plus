import { getDaemonRuntimeDir } from "@oh-my-pi/pi-utils";
/** Resolve the private runtime directory shared by omp processes in one project directory. */
export { getDaemonRuntimeDir as daemonRuntimeDir };
/**
 * Small mutable lifecycle state (snapshot, completion bookkeeping) in
 * `<runtimeDir>/daemons/<name>/`. Rewritten on transitions, and only when its
 * serialized form changes.
 */
export declare const DAEMON_META_FILE = "meta.json";
/**
 * The launch spec, including its environment (often the whole parent env,
 * tens of KB). Written when the record is created or its mode changes, never
 * on lifecycle transitions. Older brokers embedded it in `meta.json`; readers
 * still accept that layout and broker recovery migrates it.
 */
export declare const DAEMON_SPEC_FILE = "spec.json";
/**
 * Canonicalize a project directory the same way every broker client does, so
 * hash-keyed runtime dirs and Windows pipe names agree across processes.
 * Missing paths and permission-denied lookups (EPERM/EACCES on protected
 * parent directories) resolve without realpath instead of failing.
 */
export declare function canonicalProjectDir(projectDir: string): Promise<string>;
/**
 * Record the scope's canonical project directory inside its runtime dir.
 * Written by the broker at startup so out-of-process inspectors (`omp ps`)
 * can map a hash-keyed runtime dir back to its project.
 */
export declare function writeDaemonScopeMeta(runtimeDir: string, projectDir: string): Promise<void>;
/** Read the project directory recorded for a runtime dir; undefined when absent or malformed. */
export declare function readDaemonScopeMeta(runtimeDir: string): Promise<string | undefined>;
/** One daemon record dir as stored on disk, before parsing. */
export interface StoredDaemonRecord {
    /** Decoded `meta.json`. */
    meta: object & {
        daemon: unknown;
    };
    /** Decoded launch spec, from `meta.json` (legacy layout) or `spec.json`. */
    spec: unknown;
    /** The spec was embedded in `meta.json` by an older broker. */
    legacyLayout: boolean;
}
/**
 * Read a daemon record dir in either layout. Undefined when `meta.json` has no
 * daemon snapshot; throws when a file is missing or malformed.
 */
export declare function readStoredDaemonRecord(dir: string): Promise<StoredDaemonRecord | undefined>;
/** Resolve the Unix socket or Windows named pipe used by one daemon broker scope. */
export declare function daemonBrokerEndpoint(projectDir: string, runtimeDir: string): string;
