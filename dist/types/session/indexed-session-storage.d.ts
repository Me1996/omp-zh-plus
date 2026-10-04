import { type SessionStorage, type SessionStorageStat, type SessionStorageWriter, type SessionStorageWriteOptions, type WriteTextAtomicOptions } from "./session-storage.js";
import { type SessionTitleUpdate } from "./session-title-slot.js";
export interface SessionStorageIndexEntry {
    path: string;
    size: number;
    mtimeMs: number;
    title?: string;
    titleSource?: SessionTitleUpdate["source"];
    titleUpdatedAt?: string;
}
export interface SessionStorageBackend {
    init(): Promise<void>;
    loadIndex(): Promise<Iterable<SessionStorageIndexEntry>>;
    readFull(path: string): Promise<string | null>;
    readSlices(path: string, prefixBytes: number, suffixBytes: number): Promise<[string, string]>;
    /**
     * Replace content, atomically rejecting when the shared backend's current
     * UTF-8 byte length differs from `expectedSize`.
     */
    writeFull(path: string, content: string, mtimeMs: number, title?: SessionTitleUpdate, expectedSize?: number | null): Promise<void>;
    append(path: string, line: string, mtimeMs: number): Promise<void>;
    updateSessionTitle(path: string, title: SessionTitleUpdate, mtimeMs: number): Promise<void>;
    truncate(path: string, mtimeMs: number): Promise<void>;
    remove(paths: string[]): Promise<void>;
    move(src: string, dst: string, mtimeMs: number): Promise<void>;
}
interface IndexEntry {
    size: number;
    mtimeMs: number;
    title?: string;
    titleSource?: SessionTitleUpdate["source"];
    titleUpdatedAt?: string;
}
/** Optimistic index entry a queued append installed, kept for failure rollback. */
interface IndexAppend {
    mtimeMs: number;
    previous: IndexEntry | undefined;
}
export declare class IndexedSessionStorage implements SessionStorage {
    #private;
    /**
     * Sync writes only update {@link #index} and queue the remote publish, so a
     * caller tracking a durable byte size must wait for {@link drain}.
     */
    readonly defersSyncPublish = true;
    constructor(backend: SessionStorageBackend);
    initialize(): Promise<void>;
    refresh(): Promise<void>;
    drain(): Promise<void>;
    ensureDirSync(_dir: string): void;
    existsSync(path: string): boolean;
    /**
     * Resolve once the publishes queued for `path` have settled, rejecting when
     * one failed. The path tail is installed synchronously by `#enqueuePaths`,
     * so a caller confirming immediately after `writeTextSync` observes its own
     * write rather than a later one.
     */
    confirmWrites(path: string): Promise<void>;
    writeTextSync(path: string, content: string, options?: SessionStorageWriteOptions): void;
    updateSessionTitle(path: string, title: SessionTitleUpdate): Promise<void>;
    statSync(path: string): SessionStorageStat;
    listFilesSync(dir: string, pattern: string): string[];
    exists(path: string): Promise<boolean>;
    readText(path: string): Promise<string>;
    readTextSlices(path: string, prefixBytes: number, suffixBytes: number): Promise<[string, string]>;
    hasAssistantTurn(path: string): Promise<boolean>;
    writeText(path: string, content: string): Promise<void>;
    writeTextAtomic(path: string, content: string, options?: WriteTextAtomicOptions): Promise<void>;
    rename(src: string, dst: string): Promise<void>;
    unlink(path: string): Promise<void>;
    deleteSessionWithArtifacts(sessionPath: string): Promise<void>;
    openWriter(path: string, options?: {
        flags?: "a" | "w";
        onError?: (err: Error) => void;
    }): SessionStorageWriter;
    _writerClosed(writer: IndexedSessionStorageWriter): void;
    _truncateForWriter(path: string): number;
    _queueTruncate(path: string, mtimeMs: number, getError?: () => Error | undefined): Promise<void>;
    _appendForWriter(path: string, line: string): IndexAppend;
    _queueAppend(path: string, line: string, append: IndexAppend, getError?: () => Error | undefined): Promise<void>;
}
declare class IndexedSessionStorageWriter implements SessionStorageWriter {
    #private;
    constructor(storage: IndexedSessionStorage, path: string, options?: {
        flags?: "a" | "w";
        onError?: (err: Error) => void;
    });
    appendSync(line: string): void;
    append(line: string): Promise<void>;
    flush(): Promise<void>;
    isOpen(): boolean;
    close(): Promise<void>;
    getError(): Error | undefined;
}
export {};
