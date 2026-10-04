import type { LspClient, ServerConfig, WorkspaceEdit } from "./types.js";
/** Enable or disable attaching to broker-shared language servers. */
export declare function setSharedLspEnabled(enabled: boolean): void;
/**
 * Configure the global fallback idle timeout for LSP clients (used in tests/overrides).
 * When unset, each client evaluates against its workspace config (`getConfig(client.cwd).idleTimeoutMs`).
 * @param ms - Timeout in milliseconds, or null/undefined to disable global override
 */
export declare function setIdleTimeout(ms: number | null | undefined): void;
/**
 * Whether a client may be reaped by the idle checker.
 *
 * A client with in-flight requests is *busy*, never idle. `lastActivity` is
 * stamped when a request is written, not while it is outstanding, so a single
 * request that runs longer than the idle timeout used to look like silence:
 * the checker tore the client down mid-flight and `shutdownClientInstance`
 * rejected the caller's still-pending promise with "LSP client shutdown"
 * (issue #8390). Requests that settle refresh `lastActivity`, so a client
 * becomes eligible again only after the final one lands and the full idle
 * window then elapses.
 *
 * Exported for tests; the idle checker is the only production caller.
 */
export declare function isIdleClient(client: LspClient, now: number, timeoutMs: number): boolean;
/**
 * Whether the background idle checker interval is currently active.
 * Exported for tests.
 */
export declare function isIdleCheckerRunning(): boolean;
/**
 * Reconcile the background idle checker interval against currently configured timeouts.
 * Starts the checker if any registered client or workspace has a positive timeout,
 * or stops it if none do.
 */
export declare function reconcileIdleChecker(): void;
/**
 * Sweeps all registered LSP clients against their workspace idle timeout.
 * Exported for tests.
 */
export declare function checkIdleClients(): Promise<void>;
/** LSP `FileChangeType` values for workspace/didChangeWatchedFiles notifications. */
export declare enum FileChangeType {
    Created = 1,
    Changed = 2,
    Deleted = 3
}
/** Filesystem change authored by the harness and announced to active LSP clients. */
export interface WatchedFileChange {
    filePath: string;
    type: FileChangeType;
}
/**
 * Apply a server-provided workspace edit and reconcile every affected open LSP document.
 * Runtime callers use this wrapper so later semantic requests observe the committed files.
 * Reconciliation is derived from the ops that actually ran — an op skipped via
 * `ignoreIfExists`/`ignoreIfNotExists` neither closes overlays nor notifies watchers, and
 * when the edit fails partway the already-executed prefix is still reconciled before the
 * error propagates so mutated files never keep stale overlays.
 */
export declare function applyWorkspaceEditWithLsp(edit: WorkspaceEdit, cwd: string, signal?: AbortSignal): Promise<string[]>;
/** Whether the server advertised LSP 3.17 document diagnostic pulls statically or through registration. */
export declare function supportsDocumentDiagnostics(client: LspClient): boolean;
/** Timeout for warmup initialize requests (5 seconds) */
export declare const WARMUP_TIMEOUT_MS = 5000;
/**
 * True when this client speaks the rust-analyzer protocol, detected by the
 * command basename (`rust-analyzer[.exe]`) of the configured or resolved
 * binary. Callers use it to gate rust-analyzer-only requests such as
 * `rust-analyzer/reloadWorkspace` (see {@link reloadServer}).
 */
export declare function isRustAnalyzerClient(client: LspClient): boolean;
/**
 * Shut down clients for `cwd` whose identity is absent from `configs`, and
 * return the server commands torn down.
 *
 * `reload *` re-reads config from disk. Identity-aware keys make a changed
 * server resolve to a fresh client, but the process spawned from the old
 * config would stay registered and running — the idle checker that would
 * eventually reap it is opt-in and off by default.
 */
export declare function shutdownStaleClients(cwd: string, configs: readonly ServerConfig[], signal?: AbortSignal): Promise<string[]>;
/** Allow an explicit user reload to retry a matching initialization failure immediately. */
export declare function clearInitializationFailure(config: ServerConfig, cwd: string): void;
/**
 * Get or create an LSP client for the given server configuration and working directory.
 * @param config - Server configuration
 * @param cwd - Working directory
 * @param initTimeoutMs - Optional hard deadline for the initialize handshake (warmup / other
 *   short-lived callers). When set it takes precedence over `signal` inside `sendRequest`.
 * @param signal - Optional caller abort signal. Threaded into the initialize `sendRequest`
 *   and the `initialized` notification so a wedged server surfaces the caller's
 *   timeout/cancel instead of falling back to the internal 30s default.
 */
export declare function getOrCreateClient(config: ServerConfig, cwd: string, initTimeoutMs?: number, signal?: AbortSignal): Promise<LspClient>;
/** Return an active or already-starting client without starting a language server. */
export declare function getActiveOrPendingClient(config: ServerConfig, cwd: string, signal?: AbortSignal): Promise<LspClient | undefined>;
/**
 * Mark a file whose server overlay OMP has advanced ahead of disk for an in-flight
 * write. While marked, {@link reconcileFileFromDisk} skips reading disk back into
 * the server, because the on-disk file is the *stale* side until the write commits.
 * Every call MUST be balanced by {@link endPendingDiskWrite}.
 */
export declare function beginPendingDiskWrite(filePath: string): void;
/** Release a mark set by {@link beginPendingDiskWrite}; the overlay is authoritative until then. */
export declare function endPendingDiskWrite(filePath: string): void;
/**
 * Ensure a file is opened in the LSP client.
 * Sends didOpen notification if the file is not already tracked.
 */
export declare function ensureFileOpen(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Reconcile an already-open document with current disk contents before a semantic query.
 *
 * {@link ensureFileOpen} opens an untracked file but no-ops when the URI is already
 * open, so an external edit — one not routed through OMP's write/edit tools, which
 * announce their changes via {@link notifyWorkspaceWatchedFiles}/{@link refreshFile} —
 * leaves the server holding the pre-edit document while callers compute query
 * positions from disk. This reads the file and, when its contents diverge from the
 * text last sent to the server, pushes a `didChange` so the server's copy matches
 * the disk text the position was derived from. Untracked files fall through to
 * {@link ensureFileOpen}; unchanged files send nothing.
 * Returns `true` only when a `didChange` was pushed for a reconciled overlay — the
 * caller can then wait for fresh diagnostics, since the stale ones were dropped.
 * A file with an in-flight OMP write ({@link beginPendingDiskWrite}) is skipped
 * entirely: its overlay leads disk, so reading disk back would revert the server
 * to pre-write content.
 */
export declare function reconcileFileFromDisk(client: LspClient, filePath: string, signal?: AbortSignal): Promise<boolean>;
/**
 * Wait for the server's initial project loading to complete.
 * Races the server's $/progress tracking against the abort signal.
 * Returns immediately if loading already completed or timed out.
 */
export declare function waitForProjectLoaded(client: LspClient, signal?: AbortSignal): Promise<void>;
/**
 * Sync in-memory content to the LSP client without reading from disk.
 * Use this to provide instant feedback during edits before the file is saved.
 */
export declare function syncContent(client: LspClient, filePath: string, content: string, signal?: AbortSignal): Promise<void>;
/**
 * Notify LSP that a file was saved.
 * Assumes content was already synced via syncContent - just sends didSave.
 */
export declare function notifySaved(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Announce harness-authored filesystem changes to active LSP clients for `cwd`.
 *
 * Created or deleted files can change module resolution for otherwise untouched
 * open documents, so those overlays are refreshed after the watcher notification.
 * This also covers sibling files that are not open text documents, such as generated
 * CSS modules or type files that another edited document imports immediately.
 *
 * The underlying stdin write drain is self-bounded by
 * {@link WATCHED_FILES_NOTIFY_TIMEOUT_MS}; only an abort of the caller's
 * `signal` rejects.
 */
export declare function notifyWorkspaceWatchedFiles(cwd: string, changes: readonly WatchedFileChange[], signal?: AbortSignal): Promise<void>;
/**
 * Refresh a file in the LSP client.
 * Increments version, sends didChange and didSave notifications.
 */
export declare function refreshFile(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Tear down a specific client instance using the LSP shutdown/exit handshake.
 *
 * Removes the client from the registry by identity first (never evicting a
 * newer client already republished under the same key), then performs a bounded
 * graceful shutdown, force-killing and awaiting confirmed process exit.
 *
 * @returns `true` once the process is confirmed exited, `false` if it outlived
 * the shutdown budget — callers reporting a restart must treat `false` as a
 * failed teardown, not a completed restart.
 */
export declare function shutdownClientInstance(client: LspClient): Promise<boolean>;
/**
 * Shutdown a specific client by key.
 *
 * @returns `true` when the client is gone (already absent or confirmed exited),
 * `false` if a live process outlived the shutdown budget.
 */
export declare function shutdownClient(key: string): Promise<boolean>;
/**
 * Send an LSP request and wait for response.
 *
 * Timeout policy:
 * - If `timeoutMs` is explicitly provided, that value is used.
 * - Else, if `signal` is provided, no internal timer is installed (the caller
 *   owns the deadline via the signal — typically a wall-clock `AbortSignal.timeout`
 *   from the LSP tool). Installing a second hard-coded 30s timer here used to
 *   cause "timed out after 30000ms" errors even when the caller had requested
 *   `timeout: 60`.
 * - Else (no signal, no explicit timeout), fall back to `DEFAULT_REQUEST_TIMEOUT_MS`
 *   to avoid leaking pending requests forever.
 */
export declare function sendRequest(client: LspClient, method: string, params: unknown, signal?: AbortSignal, timeoutMs?: number): Promise<unknown>;
/**
 * Send an LSP notification (no response expected).
 * `signal` bounds the underlying `sink.flush()` — without it a server that
 * stops draining stdin blocks every future write on the client's write queue.
 */
export declare function sendNotification(client: LspClient, method: string, params: unknown, signal?: AbortSignal): Promise<void>;
/**
 * Shutdown all LSP clients.
 */
export declare function shutdownAll(): Promise<void>;
/** Status of an LSP server */
export interface LspServerStatus {
    name: string;
    status: "connecting" | "ready" | "error";
    fileTypes: string[];
    error?: string;
}
/**
 * Get status of all active LSP clients.
 */
export declare function getActiveClients(): LspServerStatus[];
