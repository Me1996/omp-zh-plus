import type { ImageContent, Message, MessageAttribution, ServiceTierByFamily, TextContent } from "@oh-my-pi/pi-ai";
import type { StructuredSubagentSchemaMode } from "@oh-my-pi/pi-tui-zh/tools/task";
import { ArtifactManager } from "./artifacts.js";
import { type BlobPutOptions, type BlobPutResult } from "./blob-store.js";
import type { CompactionMethod } from "./compaction-methods.js";
import { type BashExecutionMessage, type CustomMessage, type FileMentionMessage, type HookMessage, type PythonExecutionMessage } from "./messages.js";
import type { RetryFallbackRole } from "./retry-fallback-chains.js";
import { type BuildSessionContextOptions, type SessionContext } from "./session-context.js";
import { type FileEntry, type ModelUsageEntry, type NewSessionOptions, type SessionEntry, type SessionHeader, type SessionTitleSource, type SessionTreeNode, type UsageStatistics } from "./session-entries.js";
import { type SessionInfo } from "./session-listing.js";
import { type SessionStorage } from "./session-storage.js";
/** A fresh session id. */
export declare function mintSessionId(): string;
/**
 * `moveTo` refused before anything moved: another live omp process writes the
 * session, or the session file at the destination.
 */
export declare class SessionMoveRefusedError extends Error {
    constructor(message: string);
}
/**
 * Copy a session's artifact directory to another session, matching interactive
 * `/fork`. Never overwrites: a destination file written while the copy runs
 * (a session that already moved and kept working) wins over the source's copy.
 * Failures are logged, never thrown.
 */
export declare function copySessionArtifacts(sourceSessionFile: string, destinationSessionFile: string): Promise<void>;
export type ReadonlySessionManager = Pick<SessionManager, "getCwd" | "getRecordedCwd" | "getSessionDir" | "getSessionId" | "getSessionFile" | "getSessionName" | "getArtifactsDir" | "getArtifactManager" | "allocateArtifactPath" | "saveArtifact" | "getArtifactPath" | "getLeafId" | "getLeafEntry" | "getEntry" | "getLabel" | "getBranch" | "getHeader" | "getEntries" | "getTree" | "getUsageStatistics" | "putBlob" | "putBlobSync">;
interface SessionManagerStateSnapshot {
    cwd: string;
    sessionDir: string;
    sessionId: string;
    sessionName: string | undefined;
    titleSource: SessionTitleSource | undefined;
    sessionFile: string | undefined;
    expectedDiskSize: number | null;
    titleUpdatedAt: string;
    hasTitleSlot: boolean;
    onDisk: boolean;
    needsRewrite: boolean;
    draftOnlySessionCleanupArmed: boolean;
    fallbackRuntimeOnly: boolean;
    header: SessionHeader;
    entries: SessionEntry[];
}
/**
 * The storage may have published a write that rejected, and an authoritative
 * repair could not be proven durable. Callers must fail closed until recovery.
 */
export declare class SessionPersistenceIndeterminateError extends AggregateError {
    readonly operationError: Error;
    readonly recoveryErrors: readonly Error[];
    constructor(operationError: Error, recoveryErrors: readonly Error[]);
}
/**
 * This session moved to a new file and keeps saving there. Not a failure:
 * nothing is latched. Delivered through {@link SessionManager.onPersistenceNotice}.
 */
export interface SessionPersistenceNotice {
    /**
     * `"open-elsewhere"`: another live omp process wrote `from` first and still
     * has it open, so this process saves its entries elsewhere instead of mixing
     * them into that file. `"replaced"`: `from` changed on disk and no longer
     * reads as this session's journal, so it is left untouched. `"contested"`:
     * a writer without the ownership lease kept changing `from` through every
     * read-back-and-retry pass, so this session stops racing it.
     */
    reason: "open-elsewhere" | "replaced" | "contested";
    /** The session file this session was saving to. */
    from: string;
    /** The fresh sibling it saves to from now on: same directory, a new session id whose `parentSession` is the old one. */
    to: string;
}
/**
 * Thrown by {@link SessionManager.forkFrom} when the fork source is missing.
 * The CLI maps this to a clean session-resolution failure at its own boundary
 * (this module must not import `main.ts`, where `SessionResolutionError` lives).
 */
export declare class ForkSourceNotFoundError extends Error {
    constructor(sourcePath: string);
}
/**
 * Stores and navigates an append-only conversation journal.
 *
 * A session is a JSONL file: one header line followed by entries. Entries form a
 * tree by `(id, parentId)`, and the mutable leaf pointer selects which path is
 * active for future appends and for LLM context construction.
 *
 * Durability is software-crash safe but not power-loss safe: completed entries
 * (user/assistant/toolResult messages, tool_execution_start markers, custom
 * entries) are handed to the OS synchronously in-body on append and never
 * `fsync`'d. In-flight streaming text is intentionally not durable until
 * `message_end` persists the finished message.
 *
 * While an in-place atomic rewrite is publishing, a concurrent completed append
 * supersedes that publish with a synchronous full-body rewrite so the entry is
 * software-crash durable before the append returns; the abandoned atomic's
 * `commitGuard` then refuses to clobber the fresher body.
 *
 * During {@link moveTo}, appends write a full body to the live relocation path
 * (source until rename, destination once the rename has landed) so a crash mid-
 * move still preserves completed entries without recreating a vacated source.
 * A trailing atomic rewrite still rewrites the header cwd after the path is
 * repointed.
 */
export declare class SessionManager {
    #private;
    /**
     * Collab replication tap: invoked for every appended entry with the
     * in-memory (pre-blob-externalization) entry, so inline images survive.
     */
    onEntryAppended?: (entry: SessionEntry) => void;
    private constructor();
    /** Puts a binary blob into the blob store and returns the blob reference. */
    putBlob(data: Buffer, options?: BlobPutOptions): Promise<BlobPutResult>;
    /** Synchronous variant of {@link putBlob} for rebuild-only render paths. */
    putBlobSync(data: Buffer, options?: BlobPutOptions): BlobPutResult;
    captureState(): SessionManagerStateSnapshot;
    /**
     * Create an independent manager for the current logical session and branch.
     * The clone shares the storage backend but owns its entry index and writer, so
     * callers can finish session-owned work after this manager switches elsewhere.
     * Set `persist` false when the original session is intentionally being dropped.
     */
    cloneCurrentSession(options?: {
        persist?: boolean;
    }): SessionManager;
    restoreState(snapshot: SessionManagerStateSnapshot): void;
    /**
     * Undo a {@link moveTo} using a {@link captureState} snapshot: rename the
     * session and artifacts back into the captured bucket, then restore the
     * captured metadata (cwd, header, additionalDirectories). The captured
     * header is persisted after relocation so a fresh open of the source
     * session sees the pre-move metadata, including workspace roots the move
     * filtered out. Rollbacks must not re-enter forward-move hooks, so this
     * bypasses AgentSession entirely. If the rename-back itself fails, the
     * manager stays pointed at the actual moved file (restoring the snapshot
     * would split the transcript across a recreated source and the stranded
     * target) and the error names where the session file actually lives.
     */
    rollbackMove(snapshot: SessionManagerStateSnapshot): Promise<void>;
    /** Switch to a different session file (resume / branch). */
    setSessionFile(sessionFile: string): Promise<void>;
    /**
     * Start a new session and persist its header before returning.
     *
     * The durable empty boundary prevents a later process on another terminal
     * from selecting the previous conversation as the most recent session.
     */
    newSession(options?: NewSessionOptions): Promise<string | undefined>;
    /** Delete a session file and its artifact directory. ENOENT is treated as success. */
    dropSession(sessionPath: string): Promise<void>;
    /**
     * Fork the current session into a new file with the same entries.
     * @returns the old and new session file paths, or undefined when not persisting.
     */
    fork(): Promise<{
        oldSessionFile: string;
        newSessionFile: string;
    } | undefined>;
    /** Move the session to a new working directory. */
    moveTo(newCwd: string, targetSessionDir?: string): Promise<void>;
    /**
     * Force the session onto disk even with no assistant message yet (ACP
     * session/new must create a discoverable file immediately).
     */
    ensureOnDisk(): Promise<void>;
    /** Persist this session's transcript as a newly identified OMP session. */
    persistCopy(options?: {
        sessionDir?: string;
        suppressBreadcrumb?: boolean;
    }, storage?: SessionStorage): Promise<SessionManager>;
    /**
     * Stage a synchronous group of entry appends and publish the resulting full
     * journal with one atomic replace. A failed publish removes only the staged
     * entries, preserves/reparents entries appended concurrently, restores the
     * prior durable file view, and clears the failed writer latch for retry.
     *
     * The callback MUST be synchronous.
     */
    appendEntriesAtomically<T>(append: () => T): Promise<T>;
    /**
     * Replace an uncertain append tail with the authoritative in-memory journal.
     * Callers must only use this for monotonic recovery where every retained
     * entry remains intended (for example, an explicit terminal tombstone).
     */
    recoverPersistenceFromCurrentState(): Promise<void>;
    /** Flush pending writes. Call before switching sessions or on shutdown. */
    flush(): Promise<void>;
    /**
     * Synchronously makes the current append-only session durable. Avoid rewriting
     * an already-current file: large restored sessions can contain GiB of compacted
     * history, and Ctrl+C must not rebuild the whole JSONL string just to flush.
     */
    flushSync(): void;
    /** Flush, then close the append writer. */
    close(): Promise<void>;
    /**
     * Raise the terminal write barrier ahead of the final {@link close}. Once
     * sealed:
     * - every later append, title change, and rewrite is a dropped no-op —
     *   including work an event handler tries to enqueue while dispose is
     *   awaiting `close()` on the disk tail;
     * - the disk epoch is bumped, so queued-but-unexecuted tail work is
     *   superseded and an ALREADY-RUNNING fenced/repair rewrite (awaiting the
     *   tail, drain, writer close, or the atomic stage) fails its commit guard
     *   at the rename fence instead of publishing over a revived file.
     * The final `close()` itself is scheduled after the bump and still runs;
     * pre-seal hot-path appends are already in the page cache. Idempotent;
     * terminal.
     */
    seal(): void;
    /**
     * Terminal release: drop the in-memory transcript and complete the
     * {@link seal}. The entry journal and its index mirror the agent's message
     * array (tool results, file contents, base64 frame images); on a disposed
     * session — e.g. a parked subagent still referenced by the lifecycle
     * adoption record — they would otherwise stay pinned for the process
     * lifetime.
     *
     * Closes the append writer; with the seal up, nothing can reopen it. A
     * revival may reopen the same JSONL through a NEW manager the moment
     * dispose returns; a late event handler resuming on THIS manager must
     * never race that writer — and a post-release rewrite would persist the
     * now-empty entry list, truncating the transcript. Reads after this point
     * reopen from disk (revival, `history://`). Only call from session
     * dispose, after the final `close()`; idempotent.
     */
    releaseRetainedEntries(): void;
    getCwd(): string;
    /** Recorded cwd from the session header (original project), may differ from runtime {@link getCwd} when fallback retained launch cwd. */
    getRecordedCwd(): string | undefined;
    setCwdWithoutRelocation(newCwd: string): void;
    adoptRecordedCwd(): void;
    /** Additional workspace directories beyond cwd (multi-root), absolute and normalized. */
    getAdditionalDirectories(): string[];
    /**
     * Add a workspace directory. Normalizes (relative to cwd), dedupes, rejects
     * the cwd itself, persists to the session header, and triggers an atomic
     * rewrite so the change survives a crash. Returns the resolved absolute
     * path or `null` when the directory was already present (no-op).
     */
    addWorkspaceDirectory(directory: string): Promise<string | null>;
    /**
     * Remove a workspace directory by absolute or cwd-relative path. Persists
     * the trimmed header. Returns the resolved path that was removed, or
     * `null` when the directory was not an additional root (no-op).
     */
    removeWorkspaceDirectory(directory: string): Promise<string | null>;
    /** Seed additional directories from settings or a passed list. Also called on resumed sessions with --add-dir; persists the updated header when the session file is already durable. No-op when the normalized list is unchanged (avoids rewriting large session files on every startup). */
    setAdditionalDirectories(directories: string[]): Promise<void>;
    getUsageStatistics(): UsageStatistics;
    /**
     * Open a new per-turn budget window: snapshot the cumulative output baseline,
     * reset the eval-subagent counter, and set the (optional) ceiling.
     */
    beginTurnBudget(total: number | null, hard: boolean): void;
    recordEvalSubagentOutput(output: number): void;
    getTurnBudget(): {
        total: number | null;
        spent: number;
        hard: boolean;
    };
    getSessionDir(): string;
    getSessionId(): string;
    getSessionFile(): string | undefined;
    /**
     * Whether the current session has actually been materialized to durable
     * storage (the JSONL exists on disk / in the active storage backend).
     *
     * Session persistence is lazy: the file is only written once the history
     * contains an assistant message (or an explicit {@link ensureOnDisk}
     * caller forces it). Until then {@link getSessionFile} returns an allocated
     * path that leads nowhere, so a `--resume <id>` hint built from it would
     * always fail. Consumers that advertise a resume command must gate on this
     * (issue #8860).
     */
    isSessionOnDisk(): boolean;
    getArtifactsDir(): string | null;
    adoptArtifactManager(manager: ArtifactManager): void;
    getArtifactManager(): ArtifactManager | null;
    allocateArtifactPath(toolType: string): Promise<{
        id?: string;
        path?: string;
    }>;
    saveArtifact(content: string, toolType: string): Promise<string | undefined>;
    getArtifactPath(id: string): Promise<string | null>;
    saveDraft(text: string): Promise<void>;
    consumeDraft(): Promise<string | null>;
    /** The source that set the session name: "user" (manual/RPC) or "auto" (generated title). */
    get titleSource(): SessionTitleSource | undefined;
    /** Tracks user rename requests; background title updates do not invalidate them. */
    get titleRevision(): number;
    /** Invalidate older generated renames before starting a new request. */
    reserveTitleRevision(): number;
    getSessionName(): string | undefined;
    onSessionNameChanged(cb: () => void): () => void;
    /**
     * Subscribe to persistence failures so hosts can surface lost-durability state.
     *
     * A failure latched before this call — a store that failed on its first write,
     * before the host wired its observer — is replayed to the new subscriber.
     * Without the replay the host sees only a dispose rejection it cannot
     * attribute to persistence (issue #11493).
     */
    onPersistenceError(cb: (error: Error) => void): () => void;
    /**
     * Subscribe to {@link SessionPersistenceNotice}s: this session moved to a new
     * file and keeps saving there, which the user should hear about but which is
     * not a failure. Every notice raised before this call is replayed to the new
     * subscriber, as {@link onPersistenceError} replays a latched failure, so each
     * subscriber sees each notice once however late it subscribed.
     */
    onPersistenceNotice(cb: (notice: SessionPersistenceNotice) => void): () => void;
    /**
     * Set the session display name.
     * @param source "user" for explicit renames; "auto" for generated titles.
     *   Auto titles are ignored once the user has set a name.
     */
    setSessionName(name: string, source?: SessionTitleSource, trigger?: string): Promise<boolean>;
    /**
     * Journal an idle recap for this session in history.db. Recaps never enter
     * the session file or LLM context; in-memory sessions are not journaled.
     */
    recordRecap(recap: string): void;
    /**
     * Append a foreign (host-authored) entry verbatim, preserving its
     * `id`/`parentId`. Used by collab guests to mirror the host session.
     */
    ingestReplicatedEntry(entry: SessionEntry): void;
    /**
     * Snapshot the session for collab replication: the live header plus a deep
     * copy of every entry (the host mutates entries in place on rewrite paths, so
     * guests must not share references).
     *
     * `copy` is injectable because the copier decides whether the snapshot
     * survives pathological input at all: `structuredClone` throws `RangeError`
     * on a payload nested past the engine's recursion limit, and the collab
     * snapshot path builds its chunk train from this return value — so that
     * throw lands before the shrinker that exists to bound such an entry, and
     * the guest never receives its `final` chunk (issue #11433). The collab host
     * passes a depth-bounded copier so one pathological entry degrades on its
     * own instead of aborting the whole snapshot.
     */
    snapshotForReplication(copy?: <T>(value: T) => T): {
        header: SessionHeader;
        entries: SessionEntry[];
    };
    /**
     * Append a message as a child of the current leaf, then advance the leaf.
     * CompactionSummaryMessage / BranchSummaryMessage are rejected here — they are
     * top-level entries via appendCompaction()/branchWithSummary().
     */
    appendMessage(message: Message | CustomMessage | HookMessage | BashExecutionMessage | PythonExecutionMessage | FileMentionMessage): string;
    /**
     * Append to a non-active branch without changing the current leaf.
     * Used by work that retains ownership of a branch across tree navigation.
     */
    appendMessageToBranch(message: Message | CustomMessage | HookMessage | BashExecutionMessage | PythonExecutionMessage | FileMentionMessage, parentId: string | null): string;
    /** Record usage on its initiating branch without moving a successor branch or session. */
    appendModelUsage(usage: Pick<ModelUsageEntry, "purpose" | "role" | "api" | "provider" | "model" | "usage" | "stopReason" | "errorMessage">, owner: {
        sessionId: string;
        parentId: string | null;
    }): string | undefined;
    /** Append a thinking level change as child of current leaf, then advance leaf. Returns entry id. */
    appendThinkingLevelChange(thinkingLevel?: string, configured?: string): string;
    appendServiceTierChange(serviceTier: ServiceTierByFamily | null): string;
    appendModeChange(mode: string, data?: Record<string, unknown>): string;
    /**
     * Append a model change as a child of the current leaf, then advance the leaf.
     * @param model Model in "provider/modelId" format
     * @param role Optional role (default: "default")
     * @param resolvedModelIsFallback Whether this transition selected a retry-fallback model
     */
    appendModelChange(model: string, role?: string, resolvedModelIsFallback?: boolean): string;
    appendSessionInit(init: {
        systemPrompt: string;
        task: string;
        tools: string[];
        agent?: string;
        modelRole?: string;
        resolvedModel?: string;
        retryFallback?: RetryFallbackRole;
        readOnly?: boolean;
        outputSchema?: unknown;
        outputSchemaMode?: StructuredSubagentSchemaMode;
        restrictToolNames?: boolean;
        spawns?: string;
        readSummarize?: boolean;
        advisor?: string;
        compactionThreshold?: {
            thresholdPercent: number;
            thresholdTokens: number;
        };
        isolated?: boolean;
    }): string;
    appendCompaction<T = unknown>(summary: string, shortSummary: string | undefined, firstKeptEntryId: string, tokensBefore: number, options?: {
        details?: T;
        fromExtension?: boolean;
        preserveData?: Record<string, unknown>;
        method?: CompactionMethod;
        providerReplayThroughEntryId?: string;
        tokensAfter?: number;
    }): string;
    /**
     * Append the durable conversation boundary recorded by `/clear`. The
     * collapsed live transcript and the model-context rebuild start after the
     * latest one, while the full history stays on disk (the plain
     * `transcript:true` export walks it unchanged).
     */
    appendResetBoundary(): string;
    appendCustomEntry(customType: string, data?: unknown): string;
    /**
     * Rewrite the session file after in-place entry updates (e.g. pruning old tool
     * outputs). Use sparingly.
     */
    rewriteEntries(): Promise<void>;
    /**
     * Append a custom message entry (for extensions) that participates in LLM context.
     * @param customType Hook identifier for filtering on reload
     * @param content Message content (string or TextContent/ImageContent array)
     * @param display Whether to show in TUI (true = styled display, false = hidden)
     * @param details Optional extension-specific metadata (not sent to LLM)
     * @param attribution Who initiated this message for billing/attribution semantics
     */
    appendCustomMessageEntry<T = unknown>(customType: string | undefined, content: string | (TextContent | ImageContent)[] | undefined, display: boolean | undefined, details?: T, attribution?: MessageAttribution | undefined, timestamp?: number): string;
    /** Append a TTSR injection entry recording which rules were injected. */
    appendTtsrInjection(ruleNames: string[]): string;
    /** All unique TTSR rule names injected on the current branch (root → leaf). */
    getInjectedTtsrRules(): string[];
    /** Append a credential pin recording which OAuth account served `provider`. */
    appendCredentialPin(provider: string, hash: string): string;
    /**
     * Latest credential pin per provider on the current branch (root → leaf),
     * with the effective last-use time of the pinned account.
     *
     * Pins are appended only when the serving account *changes*, so a long
     * session on one account carries a single old pin entry. Any assistant turn
     * for the same provider after that pin was necessarily served by the pinned
     * account, so its timestamp advances `lastUsedAt` — a resume seconds after
     * the last turn seeds a warm sticky instead of a stale one.
     */
    getCredentialPins(): Map<string, {
        hash: string;
        lastUsedAt: number;
    }>;
    getLeafId(): string | null;
    getLeafEntry(): SessionEntry | undefined;
    /**
     * The most recent model role on the current branch, or undefined when no
     * model change has been recorded.
     */
    getLastModelChangeRole(): string | undefined;
    getEntry(id: string): SessionEntry | undefined;
    /** All direct children of an entry. */
    getChildren(parentId: string): SessionEntry[];
    getLabel(id: string): string | undefined;
    /**
     * Set or clear a label on an entry. Pass undefined/empty to clear.
     */
    appendLabelChange(targetId: string, label: string | undefined): string;
    /**
     * Walk from an entry to root, returning entries in path order. Includes all
     * entry types; use buildSessionContext() for the resolved LLM messages.
     */
    getBranch(fromId?: string): SessionEntry[];
    /**
     * Build the session context (LLM messages), or — with `{ transcript: true }` —
     * the full-history display transcript, from the current leaf path.
     */
    buildSessionContext(options?: BuildSessionContextOptions): SessionContext;
    /** Strip stale OpenAI Responses replay metadata from loaded assistant entries. */
    sanitizeLoadedOpenAIResponsesReplayMetadata(): boolean;
    getHeader(): SessionHeader | null;
    /** All session entries (excludes header). Returns a shallow copy. */
    getEntries(): SessionEntry[];
    /**
     * The session as a tree. A well-formed session has exactly one root; orphaned
     * entries (broken parent chain) are returned as roots too.
     */
    getTree(): SessionTreeNode[];
    /**
     * Move the leaf to an earlier entry so the next append forms a new branch.
     * Existing entries are never modified or deleted.
     */
    branch(branchFromId: string): void;
    /** Reset the leaf to null so the next append creates a new root entry. */
    resetLeaf(): void;
    /**
     * Durably move the active branch past a discarded entry.
     *
     * The loader reconstructs the active branch from the last physical journal
     * entry, so changing the in-memory leaf alone is lost on reload. Known
     * metadata children are chained onto the discarded entry's parent before the
     * entry is removed. If any child may carry content, the subtree is preserved
     * off-branch instead. Both paths append a metadata-only branch marker and
     * rewrite the journal, making the selected path durable.
     */
    discardEntryDurably(entryId: string): Promise<void>;
    /** Like branch(), but also records a branch_summary of the abandoned path. */
    branchWithSummary(branchFromId: string | null, summary: string, details?: unknown, fromExtension?: boolean): string;
    /**
     * Create a new session file containing only the path from root to `leafId`.
     * With `copyArtifacts`, the source artifact directory is copied in the background;
     * the new artifact manager waits for it before allocating ids or resolving
     * `artifact://`, so kept references stay valid and new ids cannot collide.
     * Returns the new file path, or undefined when not persisting.
     */
    createBranchedSession(leafId: string, options?: {
        copyArtifacts?: boolean;
    }): string | undefined;
    /** Resolve the canonical default session directory for a cwd. */
    static getDefaultSessionDir(cwd: string, agentDir?: string, storage?: SessionStorage): string;
    /**
     * Create a new session.
     * @param cwd Working directory (stored in the session header)
     * @param sessionDir Optional session directory; defaults to the cwd-derived dir.
     */
    static create(cwd: string, sessionDir?: string, storage?: SessionStorage): SessionManager;
    /**
     * Create a fresh empty session file in the default session directory for
     * `cwd`, writing only the session header. The returned path can be passed to
     * `setSessionFile` / `AgentSession.switchSession` when a caller explicitly
     * needs a brand-new persisted session at a cwd-derived path.
     */
    static createEmptySessionFile(cwd: string, storage?: SessionStorage): string;
    /**
     * Fork a session into the current project directory: copy history from another
     * session file while creating a fresh session file in this sessionDir.
     *
     * `options.sessionFile` pins the new session's file path (default: an
     * auto-named `<timestamp>_<id>.jsonl` in `sessionDir`). Artifacts are copied
     * recursively by default; nested agents that deliberately share their parent's
     * artifact root may disable this with `copyArtifacts: false`.
     */
    static forkFrom(sourcePath: string, cwd: string, sessionDir?: string, storage?: SessionStorage, options?: {
        copyArtifacts?: boolean;
        suppressBreadcrumb?: boolean;
        sessionFile?: string;
        resetInheritedCost?: boolean;
        repairInterruptedTail?: boolean;
    }): Promise<SessionManager>;
    /**
     * Open a specific session file.
     * @param sessionDir Optional dir for /new or /branch; defaults to the file's parent.
     * @param options.initialCwd Cwd to use when the file is empty or missing.
     * @param options.throwIfMissing Propagate ENOENT instead of creating a new session at a missing path.
     * @param options.parentSession Parent session file recorded when the file is empty or missing.
     */
    static open(filePath: string, sessionDir?: string, storage?: SessionStorage, options?: {
        initialCwd?: string;
        parentSession?: string;
        suppressBreadcrumb?: boolean;
        throwIfMissing?: boolean;
    }): Promise<SessionManager>;
    /**
     * Lock-free peek for cold subagent revival: returns the recorded working
     * directory (session header) and the latest `session_init` contract (system
     * prompt / tools / output schema) WITHOUT taking the single-writer lock that
     * {@link open} acquires — the caller re-opens for the actual revive. Returns
     * null when the file can't be read; `init` is null for files written before
     * `session_init` was recorded (no faithful contract to rebuild from).
     */
    static peekSessionInit(filePath: string, storage?: SessionStorage): Promise<{
        cwd: string;
        init: PersistedSessionInit | null;
    } | null>;
    /** Continue the most recent session, or create a new one if none exists. */
    static continueRecent(cwd: string, sessionDir?: string, storage?: SessionStorage): Promise<SessionManager>;
    /** Create an in-memory session (no file persistence). */
    static inMemory(cwd?: string, storage?: SessionStorage): SessionManager;
    /**
     * List sessions for a project directory.
     * @param sessionDir Optional dir; defaults to the cwd-derived dir.
     */
    static list(cwd: string, sessionDir?: string, storage?: SessionStorage): Promise<SessionInfo[]>;
    /** List all sessions across all project directories, pinned sessions first. */
    static listAll(storage?: SessionStorage): Promise<SessionInfo[]>;
    /**
     * Picker-facing project list: pinned sessions first, untitled empties
     * dropped. Titled empties stay — a title is user intent worth resuming.
     */
    static listForPicker(cwd: string, sessionDir?: string, storage?: SessionStorage): Promise<SessionInfo[]>;
    /** Picker-facing cross-project list, same empty-session rule as {@link listForPicker}. */
    static listAllForPicker(storage?: SessionStorage): Promise<SessionInfo[]>;
}
/** True when already-loaded entries carry at least one real user/assistant message. */
export declare function hasConversationalHistory(entries: readonly FileEntry[]): boolean;
/**
 * The persisted `session_init` contract a cold revive rebuilds a subagent from:
 * the {@link SessionInitEntry} payload without its tree bookkeeping fields.
 */
export interface PersistedSessionInit {
    systemPrompt: string;
    task: string;
    tools: string[];
    agent?: string;
    modelRole?: string;
    resolvedModel?: string;
    retryFallback?: RetryFallbackRole;
    readOnly?: boolean;
    outputSchema?: unknown;
    outputSchemaMode?: StructuredSubagentSchemaMode;
    restrictToolNames?: boolean;
    spawns?: string;
    readSummarize?: boolean;
    advisor?: string;
    compactionThreshold?: {
        thresholdPercent: number;
        thresholdTokens: number;
    };
    isolated?: boolean;
}
/**
 * Latest persisted `session_init` contract among already-loaded entries, or
 * null when the transcript carries none.
 */
export declare function extractSessionInit(entries: readonly FileEntry[]): PersistedSessionInit | null;
/**
 * If the current session was created by `/move` and contains no real
 * user/assistant messages, delete it so empty move sessions don't accumulate.
 */
export declare function cleanupEmptyMoveSession(sessionManager: SessionManager, movedFromEmptySessionFile: string | undefined): Promise<void>;
export {};
