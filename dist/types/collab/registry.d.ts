/** Discovery metadata / IPC protocol version. Mixed omp versions fail safely. */
export declare const COLLAB_REGISTRY_VERSION = 1;
/** Access a link grants: `view` (bare room key) or `control` (room key + write token). */
export type CollabAccess = "view" | "control";
/**
 * Non-capability host state, computed by the host process at query time.
 * Free-form strings (session id and name, cwd, model) are bounded to
 * {@link MAX_SNAPSHOT_FIELD_CHARS} characters on the wire.
 */
export interface CollabHostSnapshot {
    /** Random per-process identity; stable across the host's room generations. */
    instanceId: string;
    /** Increments every time this process starts a new room (session switch, restart). */
    generation: number;
    /** Host process ID. */
    pid: number;
    /** Session ID of the hosted conversation. */
    sessionId: string;
    /** Human-readable session name, when one is set. */
    sessionName: string | null;
    /** Host working directory. */
    cwd: string;
    /** Model the host session is currently using, when one is selected. */
    model: {
        provider: string;
        id: string;
    } | null;
    /** Epoch milliseconds when the host first connected to the relay. */
    startedAt: number;
    /** Current participant count, including the host. */
    participants: number;
    /** Whether the host currently holds an open relay connection. */
    relayConnected: boolean;
    /** Whether a host-side question is waiting for an answer a writable guest could give. */
    inputRequired: boolean;
    /**
     * Whether the session is running a turn: streaming a response or executing
     * tools. A poller watching this fall from `true` to `false` sees the host
     * stop working while it is still published, which no other field reports —
     * disappearing from discovery means the process died or became unreachable,
     * not that the agent finished.
     *
     * `null` when the host does not report it (an omp older than this field).
     * Unknown is not idle: a consumer must not read the absence as a session
     * that stopped.
     */
    busy: boolean | null;
    /** Highest access the registry will hand out for this host. */
    access: CollabAccess;
}
/** Live host state served over the IPC endpoint. */
export interface CollabHostRegistrySource {
    /** Current metadata; throws when the host can no longer vouch for its session. */
    snapshot(): CollabHostSnapshot;
    /** Browser URL for `access`, or `null` when that access is not published. */
    link(access: CollabAccess): string | null;
}
/** One resolved capability returned by {@link resolveCollabHostLink}. */
export interface CollabResolvedLink {
    instanceId: string;
    generation: number;
    access: CollabAccess;
    url: string;
}
/** Handle returned by {@link publishCollabHost}; closing withdraws the host. */
export interface CollabHostPublication {
    /** Endpoint the host listens on (test/diagnostic use; not secret). */
    readonly endpoint: string;
    /** Stop serving requests and remove the discovery metadata. Idempotent. */
    close(): Promise<void>;
}
export interface CollabRegistryOptions {
    /** Override the discovery metadata directory (tests). */
    dir?: string;
}
export interface CollabPublishOptions extends CollabRegistryOptions {
    /**
     * Identity recorded in the metadata and matched by `omp collab link <id>`.
     * Defaults to a fresh random ID; a host that rotates rooms passes its
     * process-lifetime instance ID so the replacement room keeps the same id.
     * The metadata file and endpoint are always named per publication, so a
     * stale entry and its successor never share artifacts.
     */
    instanceId?: string;
    /**
     * Base for the short socket directory used when the canonical socket path
     * would overflow `sun_path`. Defaults to `/tmp`; tests point it elsewhere.
     */
    socketFallbackBase?: string;
}
export interface CollabListOptions extends CollabRegistryOptions {
    /** Per-entry query deadline in milliseconds. */
    timeoutMs?: number;
}
/** Stable failure codes for {@link resolveCollabHostLink}; never carry URLs. */
export type CollabLinkErrorCode = "not_found" | "ambiguous" | "stale_generation" | "access_unavailable" | "unreachable";
export declare class CollabLinkError extends Error {
    readonly code: CollabLinkErrorCode;
    constructor(code: CollabLinkErrorCode, message: string);
}
/**
 * Discovery metadata directory. Deliberately under the profile-independent
 * config root (`~/.omp/run/collab-hosts`) — unlike the launch broker's
 * profile-scoped runtime dir — so hosts started under any profile are
 * discoverable from any other (issue #6099 user story 18).
 */
export declare function collabHostsRuntimeDir(): string;
/**
 * Publish a live Collab host to the local registry.
 *
 * Creates the owner-only runtime dir, starts a private IPC endpoint backed by
 * `source`, and writes discovery metadata (never URLs or room secrets).
 * Call {@link CollabHostPublication.close} on every teardown path; a process
 * exit hook removes the on-disk state for normal shutdown, and the OS closing
 * the endpoint covers crashes.
 */
export declare function publishCollabHost(source: CollabHostRegistrySource, options?: CollabPublishOptions): Promise<CollabHostPublication>;
/**
 * List live Collab hosts under this config root.
 *
 * Reads every discovery entry, queries the live hosts concurrently (bounded,
 * short independent deadlines), prunes stale or malformed entries
 * best-effort, and returns healthy hosts sorted by start time, PID, then
 * instance ID. Unreachable, unauthenticated, malformed, or version-mismatched
 * entries are omitted without failing the listing. The result carries no URLs.
 */
export declare function listCollabHosts(options?: CollabListOptions): Promise<CollabHostSnapshot[]>;
/**
 * Resolve one browser URL for the host selected by `selector` — an exact
 * instance ID, or a PID when no instance matches. The link request carries the
 * generation observed while listing, so a host that rotated rooms in between
 * answers `stale_generation` instead of leaking its successor's capability.
 */
export declare function resolveCollabHostLink(selector: string, access: CollabAccess, options?: CollabListOptions): Promise<CollabResolvedLink>;
