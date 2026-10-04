import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import { BlobStore } from "./blob-store.js";
import type { FileEntry } from "./session-entries.js";
import { type SessionStorage } from "./session-storage.js";
import { type SessionTitleUpdate } from "./session-title-slot.js";
/**
 * Complete optional accounting fields from persisted/imported assistant turns.
 * Complete provider usage is left untouched; missing prices never discard reported tokens.
 */
export declare function normalizeAssistantUsage(message: Extract<AgentMessage, {
    role: "assistant";
}>): boolean;
export interface VisitEntriesFromFileStreamOptions {
    /** Stop after the visitor returns `false`. */
    shouldContinue?: () => boolean;
    /** Stop after this many valid or malformed JSONL records have been consumed. */
    maxRecords?: number;
    /** Read at most this many bytes from the file's current prefix. */
    maxBytes?: number;
    /** Yield to the macrotask queue after this many bytes have been consumed. */
    yieldEveryBytes?: number;
    /** Yield to the macrotask queue after this many entries have been visited. */
    yieldEveryEntries?: number;
    /** Called once for every malformed JSONL record skipped by the stream. */
    onMalformedRecord?: () => void;
    /** Rethrow missing source instead of visiting nothing (fork backstop). */
    throwIfMissing?: boolean;
    /**
     * Called with each stream chunk's byte length as it is consumed. Lets
     * callers derive the exact snapshot size without re-stating the file.
     */
    onBytesConsumed?: (bytes: number) => void;
}
/** Controls how a missing session file is handled. */
export interface LoadSessionOptions {
    /** Propagate ENOENT instead of treating the path as a new empty session. */
    throwIfMissing?: boolean;
}
/** Parsed session entries plus corruption metadata needed by writable loaders. */
export interface SessionLoadResult {
    entries: FileEntry[];
    titleSlot: SessionTitleUpdate | undefined;
    malformedRecords: number;
    /** Byte length of the snapshot actually parsed, or `null` when the path did not exist. */
    sourceSize?: number | null;
    /** Whether non-empty session data was found without a valid leading session header. */
    invalidHeader: boolean;
}
/** Parse session JSONL while stripping and folding the optional fixed title slot. */
export declare function parseSessionContent(content: string): SessionLoadResult;
/**
 * The session id in `filePath`'s header, or `undefined` when there is no file
 * there or it does not start with a valid session header. Reads at most one
 * record and {@link SESSION_HEADER_READ_LIMIT} bytes.
 */
export declare function readSessionHeaderId(filePath: string): Promise<string | undefined>;
/** Parse session JSONL and visit each entry without retaining prior entries. */
export declare function visitEntriesFromFileStream(filePath: string, visit: (entry: FileEntry) => void | boolean, options?: VisitEntriesFromFileStreamOptions): Promise<SessionTitleUpdate | undefined>;
/** Exported for testing — the ≥8MiB streaming path (works on any file size). */
export declare function loadEntriesFromFileStream(filePath: string, options?: Pick<VisitEntriesFromFileStreamOptions, "throwIfMissing">): Promise<SessionLoadResult>;
/** Exported for compaction.test.ts */
export declare function parseSessionEntries(content: string): FileEntry[];
/** Load and validate a session while retaining malformed-record diagnostics. */
export declare function loadSessionFile(filePath: string, storage?: SessionStorage, options?: LoadSessionOptions): Promise<SessionLoadResult>;
/**
 * Load the valid entries from a session file, skipping malformed records.
 * Each call returns freshly parsed entries owned by the caller.
 */
export declare function loadEntriesFromFile(filePath: string, storage?: SessionStorage, options?: {
    throwIfMissing?: boolean;
}): Promise<FileEntry[]>;
/**
 * Visit session entries, using bounded streaming for large file-backed journals.
 * Small files and non-file backends keep the existing full-load path.
 */
export declare function visitEntriesFromFile(filePath: string, visit: (entry: FileEntry) => void | boolean, storage?: SessionStorage): Promise<void>;
/** Restore the image data that persistence externalized to the blob store, in place. */
export declare function resolveBlobRefsInEntries(entries: FileEntry[], blobStore: BlobStore): Promise<void>;
/** Synchronous {@link resolveBlobRefsInEntries}. */
export declare function resolveBlobRefsInEntriesSync(entries: FileEntry[], blobStore: BlobStore): void;
/**
 * Read-only transcript view of a session file: load entries, migrate to the
 * current version, resolve blob refs, and build the display transcript along
 * the persisted leaf path (last entry). Uses transcript mode (collapsed to the
 * latest compaction) so failed/aborted tail turns stay visible, unlike the
 * provider-context builder which drops them. Does NOT create a writer or take
 * the session lock — safe to call against a file another session is writing.
 */
export declare function loadSessionMessagesReadOnly(filePath: string): Promise<AgentMessage[]>;
