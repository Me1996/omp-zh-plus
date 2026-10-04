import { type FileLockHandle } from "@oh-my-pi/pi-utils/file-lock";
import { type SessionTitleUpdate } from "./session-title-slot.js";
export interface SessionStorageStat {
    size: number;
    mtimeMs: number;
    mtime: Date;
}
export interface SessionStorageWriter {
    /**
     * Append one newline-terminated line.
     *
     * File and memory storage apply the line synchronously before the returned
     * promise settles, so a software crash after `append` returns (or after a
     * fire-and-forget call begins) still sees the entry on disk / in body. No
     * `fsync` — power loss may still drop the last page. Indexed backends update
     * the local index immediately and queue the remote publish in call order.
     *
     * `line` MUST include the trailing newline.
     */
    append(line: string): Promise<void>;
    /**
     * Synchronous append when the backend can apply the line before return.
     * File and memory implement this so {@link SessionManager} can latch the
     * first write failure before the appending call returns (surfaced by a later
     * flushSync/close/next append — the turn loop does not throw from append).
     * Indexed backends update the local index immediately and queue remote I/O.
     */
    appendSync?(line: string): void;
    /** Resolve once all queued appends complete. No fsync. */
    flush(): Promise<void>;
    /** Drain synchronously flushable queued work when the backend supports it. No fsync. */
    flushSync?(): void;
    /** False once close() has begun/finished. */
    isOpen(): boolean;
    close(): Promise<void>;
    getError(): Error | undefined;
}
/** Optimistic precondition for replacing a session file. */
export interface SessionStorageWriteOptions {
    /** Current UTF-8 byte length, or `null` when the target must not exist. */
    expectedSize?: number | null;
}
/**
 * The session changed after a writer loaded it, so replacing it would discard
 * another writer's durable entries.
 */
export declare class SessionWriteConflictError extends Error {
    readonly path: string;
    readonly expectedSize: number | null;
    readonly actualSize: number | null;
    constructor(path: string, expectedSize: number | null, actualSize: number | null);
}
/**
 * The file publish lock is held by another live writer, so freshness cannot
 * be established. Fail-closed: the staged rewrite is discarded without
 * publishing.
 */
export declare class SessionLockError extends Error {
    readonly path: string;
    constructor(path: string, detail: string);
}
/**
 * Optional guards applied by {@link SessionStorage.writeTextAtomic}. The
 * backend MUST check `expectedSize` and call `commitGuard()` synchronously
 * immediately before it makes the staged content visible at `path`. Failed
 * preconditions leave the target untouched. Backends MUST NOT yield between
 * the checks and publishing the write.
 */
export interface WriteTextAtomicOptions extends SessionStorageWriteOptions {
    commitGuard?: () => boolean;
}
export interface SessionStorage {
    /**
     * `true` when synchronous writes ({@link writeTextSync} and a writer's
     * {@link SessionStorageWriter.appendSync}) have reached the backing store by
     * the time they return. File and memory backends apply them in-body and
     * leave this unset. Indexed backends only update the local index and queue
     * the remote publish, so a caller that tracks a durable byte size (such as
     * `SessionManager`) must wait for {@link drain} to confirm before it
     * advances that size.
     */
    readonly defersSyncPublish?: boolean;
    /**
     * Resolve once every write this storage queued for `path` has been confirmed
     * by, or rejected by, the backing store. In-body backends never queue, so
     * they omit this; {@link defersSyncPublish} marks the backends that provide
     * it.
     */
    confirmWrites?(path: string): Promise<void>;
    ensureDirSync(dir: string): void;
    existsSync(path: string): boolean;
    writeTextSync(path: string, content: string, options?: SessionStorageWriteOptions): void;
    /**
     * Update the current session title through the storage backend.
     *
     * File-like backends rewrite the fixed-width JSONL title slot; indexed
     * backends can store the semantic title fields and synthesize the slot when
     * reading.
     */
    updateSessionTitle(path: string, update: SessionTitleUpdate): Promise<void>;
    statSync(path: string): SessionStorageStat;
    listFilesSync(dir: string, pattern: string): string[];
    exists(path: string): Promise<boolean>;
    readText(path: string): Promise<string>;
    /**
     * Synchronous {@link readText}. Optional: `SessionManager` reads the file
     * back to keep another writer's entries when a synchronous rewrite meets
     * them, and reports the conflict instead on backends without it.
     */
    readTextSync?(path: string): string;
    /** Read the requested UTF-8 byte windows from the head and tail of the file. */
    readTextSlices(path: string, prefixBytes: number, suffixBytes: number): Promise<[string, string]>;
    /**
     * True when any complete `message` record in the file carries an assistant
     * role. Scans line boundaries across the whole file (middle included) so a
     * >prefix assistant record before a fixed-size tail window still counts.
     * Optional: backends without cheap full scans omit it and callers fall back
     * to prefix/suffix marker evidence.
     */
    hasAssistantTurn?(path: string): Promise<boolean>;
    writeText(path: string, content: string): Promise<void>;
    writeTextAtomic(path: string, content: string, options?: WriteTextAtomicOptions): Promise<void>;
    rename(path: string, nextPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    deleteSessionWithArtifacts(sessionPath: string): Promise<void>;
    /**
     * Run a synchronous session mutation under the backend's cross-process
     * lock. Optional because only backends with a process-shared lock can
     * participate in close-time draft GC.
     */
    withSessionFileLockSync?<T>(sessionPath: string, operation: () => T): T;
    /**
     * Claim this process's ownership of the session `sessionId` it writes to
     * `sessionPath`, until the returned release callback runs. Returns `null`
     * while another live process holds the claim, or when `sessionPath` now
     * holds a different session (another session was moved onto it), so the
     * caller's appends would land in that session's journal; `SessionManager`
     * then moves its session to a sibling instead of writing that file.
     * Optional because only backends with a process-owned lock can tell that
     * another process writes a session.
     */
    claimSession?(sessionId: string, sessionPath: string): (() => void) | null;
    /**
     * Atomically delete a session and its artifacts only when `shouldDelete`
     * accepts the current session content. Optional because backends without a
     * cross-process conditional-delete primitive must skip opportunistic GC.
     */
    deleteSessionWithArtifactsIf?(sessionPath: string, shouldDelete: (content: string) => boolean): Promise<boolean>;
    openWriter(path: string, options?: {
        flags?: "a" | "w";
        onError?: (err: Error) => void;
    }): SessionStorageWriter;
    /**
     * Wait for every backing write scheduled by this storage to become durably
     * visible. Sync backends (file, memory) return immediately because their
     * writes complete in-body; async backends (Redis/SQL via
     * {@link IndexedSessionStorage}) await their per-path queues so a caller
     * driving a graceful shutdown does not exit while a fire-and-forget
     * `writeTextSync` publish is still on the wire.
     */
    drain(): Promise<void>;
}
/**
 * Take a session's ownership lease without waiting, or `null` while another
 * process holds it. A process writing the session holds it (see
 * `FileSessionStorage.claimSession`) until it exits; `omp gc` probes it to tell
 * whether a session is live. Keyed by the session id from the journal's
 * header, not by the file's path, so every process that reaches the journal
 * (through a symlink, a hard link, or after a move) meets the same lease. Ids
 * read from a file are untrusted: anything but a plain token is hashed so it
 * cannot name a path outside the directory. Throws when the lock cannot be
 * probed.
 */
export declare function tryAcquireSessionLease(sessionId: string): FileLockHandle | null;
export declare class FileSessionStorage implements SessionStorage {
    #private;
    ensureDirSync(dir: string): void;
    existsSync(path: string): boolean;
    writeTextSync(fpath: string, content: string, options?: SessionStorageWriteOptions): void;
    updateSessionTitle(fpath: string, update: SessionTitleUpdate): Promise<void>;
    statSync(path: string): SessionStorageStat;
    listFilesSync(dir: string, pattern: string): string[];
    exists(path: string): Promise<boolean>;
    readText(path: string): Promise<string>;
    readTextSync(path: string): string;
    readTextSlices(path: string, prefixBytes: number, suffixBytes: number): Promise<[string, string]>;
    hasAssistantTurn(path: string): Promise<boolean>;
    writeText(path: string, content: string): Promise<void>;
    writeTextAtomic(fpath: string, content: string, options?: WriteTextAtomicOptions): Promise<void>;
    /**
     * Sync rename hook. Split from `rename` so `writeTextAtomic` can perform its
     * guard-then-publish step without a yield, and so tests can inject
     * Windows-style EPERM at the sync layer used by the atomic path.
     */
    renameSync(source: string, target: string): void;
    rename(path: string, nextPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    drain(): Promise<void>;
    openWriter(path: string, options?: {
        flags?: "a" | "w";
        onError?: (err: Error) => void;
    }): SessionStorageWriter;
    /** Run a synchronous session mutation under its cross-process lock. */
    withSessionFileLockSync<T>(sessionPath: string, operation: () => T): T;
    /**
     * The lease is an OS lock (abstract socket, named mutex, or `flock` sidecar
     * under ~/.omp/run/session-owners), so the kernel drops a dead owner's claim.
     * Never throws: a lock that cannot be taken for another reason counts as
     * owned, so it never moves a session off its file.
     */
    claimSession(sessionId: string, sessionPath: string): (() => void) | null;
    /**
     * Conditionally delete under the same cross-process lock used by the first
     * durable append to a draft-only session.
     */
    deleteSessionWithArtifactsIf(sessionPath: string, shouldDelete: (content: string) => boolean): Promise<boolean>;
    /**
     * Delete a session file and its artifacts directory.
     * Artifacts are stored in a sibling directory with the same name minus .jsonl extension.
     */
    deleteSessionWithArtifacts(sessionPath: string): Promise<void>;
}
/**
 * Name of `key` when it sits directly inside `resolvedDir` (a `path.resolve`d
 * directory), else `undefined`. Key-indexed storages keep whatever spelling
 * callers wrote, so both sides are resolved: on Windows `/sessions/x` and the
 * `path.join`-built `\sessions\x\…` keys must list as the same directory.
 */
export declare function directChildKeyName(resolvedDir: string, key: string): string | undefined;
export declare class MemorySessionStorage implements SessionStorage {
    #private;
    ensureDirSync(_dir: string): void;
    existsSync(path: string): boolean;
    writeTextSync(path: string, content: string, options?: SessionStorageWriteOptions): void;
    updateSessionTitle(path: string, update: SessionTitleUpdate): Promise<void>;
    /**
     * Internal O(1) append used by {@link MemorySessionStorageWriter}. Lazily
     * creates the entry. External callers should go through `openWriter()`
     * rather than touching the mirror directly.
     */
    appendSync(path: string, chunk: string): void;
    statSync(path: string): SessionStorageStat;
    listFilesSync(dir: string, pattern: string): string[];
    exists(path: string): Promise<boolean>;
    readText(path: string): Promise<string>;
    readTextSync(path: string): string;
    readTextSlices(path: string, prefixBytes: number, suffixBytes: number): Promise<[string, string]>;
    hasAssistantTurn(path: string): Promise<boolean>;
    writeText(path: string, content: string): Promise<void>;
    writeTextAtomic(path: string, content: string, options?: WriteTextAtomicOptions): Promise<void>;
    rename(path: string, nextPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    deleteSessionWithArtifacts(_sessionPath: string): Promise<void>;
    drain(): Promise<void>;
    openWriter(path: string, options?: {
        flags?: "a" | "w";
        onError?: (err: Error) => void;
    }): SessionStorageWriter;
}
