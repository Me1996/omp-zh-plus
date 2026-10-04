/**
 * Host side of a collab live session.
 *
 * Taps the host session's event stream and SessionManager append chokepoint,
 * broadcasting entries/events/state to guests through the relay. Guests prompt
 * and abort through us; the host machine runs the agent and tools. The host's
 * subagent ecosystem is mirrored too: task EventBus traffic (observer HUD),
 * agent-registry snapshots (Agent Hub table), hub chat/kill/revive commands,
 * and incremental subagent-transcript reads.
 */
import type { CollabUiRequestDraft, CollabUiResponseValue } from "@oh-my-pi/pi-wire";
import type { InteractiveModeContext } from "../modes/types.js";
import { type CollabParticipant } from "./protocol.js";
import { type CollabAccess } from "./registry.js";
/** Max bytes served per fetch-transcript reply (guest re-requests from `newSize`). */
export declare const TRANSCRIPT_READ_CAP: number;
/**
 * Outcome of {@link CollabHost.requestGuestUi}. `answered` carries the guest's
 * response (an `undefined` value is a genuine guest cancel); `unavailable`
 * means the collab channel went away (teardown, relay drop) or the request was
 * aborted before any guest answered — callers MUST NOT treat it as a cancel.
 */
export type CollabGuestUiResult = {
    kind: "answered";
    value: CollabUiResponseValue;
} | {
    kind: "unavailable";
};
/**
 * Identity a host publishes to the local registry. The controller that owns
 * hosting supplies a process-lifetime `instanceId` and bumps `generation` for
 * every room it starts; `access` caps what the registry hands out for this
 * room (the room itself always carries a write token for its own links).
 */
export interface CollabHostOptions {
    instanceId?: string;
    generation?: number;
    access?: CollabAccess;
    /**
     * Whether guests may drive the session yet: prompts, interrupts, and agent
     * commands are refused with an error frame while this returns false. Joins,
     * transcript fetches, and dialog answers are always accepted, so a writer
     * can still answer a question raised while the session is starting up.
     * Defaults to always ready.
     */
    guestActionsReady?: () => boolean;
    /**
     * Called once when the relay ends the room for good after it opened —
     * a non-retryable close or fatal socket failure (e.g. send backlog), not
     * `stop()`. Teardown has already begun; the owner may start a successor.
     */
    onEnded?: () => void;
}
/**
 * `start()` rejects with this when `stop()` deliberately ends the room while it
 * is still connecting (session switch, access upgrade, `/collab stop`,
 * shutdown), as opposed to a relay failure.
 */
export declare class CollabHostStoppedError extends Error {
    constructor(message: string);
}
/**
 * `start()` rejects with this when the relay never opened the room: the first
 * connection closed or timed out. The room was never joinable or published, so
 * an owner may retry it without guests or the registry having seen it.
 */
export declare class CollabRelayUnavailableError extends Error {
    constructor(message: string);
}
export declare class CollabHost {
    #private;
    constructor(ctx: InteractiveModeContext, options?: CollabHostOptions);
    /** Registry identity shared by every room this process hosts. */
    get instanceId(): string;
    /** Registry generation of this room; a later room in the same process has a higher one. */
    get generation(): number;
    /** Highest access the registry hands out for this room. */
    get access(): CollabAccess;
    /** Session this room mirrors; fixed at `start()`. */
    get sessionId(): string;
    get stopped(): boolean;
    /**
     * The room is ending or gone. Checked before any guest action or mirrored
     * frame: `stop()` drains the goodbye and awaits registry withdrawal before
     * the socket closes, and no guest prompt, abort, answer, or join may reach
     * the session — nor may any frame reach guests — once it has begun. The
     * controller treats an ending room as absent, so `/collab` starts a new
     * room instead of re-printing one that is about to close.
     */
    get ending(): boolean;
    /** True while a host-side question is retained for (or shown to) a writable guest. */
    get inputRequired(): boolean;
    get relayConnected(): boolean;
    get link(): string;
    /** Browser deep link for the configured collab web UI. */
    get webLink(): string;
    /** Read-only variant of {@link link}: bare room key, no write token. */
    get viewLink(): string;
    /** Read-only variant of {@link webLink}. */
    get webViewLink(): string;
    get participants(): CollabParticipant[];
    /**
     * Mirror a host-side question to writable guests. Accepted from
     * construction until teardown — including while the relay connection is
     * still being established — so a dialog raised by an extension's
     * `session_start` hook is retained for the first writer that joins.
     *
     * Refused, and the room ended, once the active session is no longer the
     * one this room mirrors: `/resume` runs the new session's `session_switch`
     * hooks before the session-change callbacks fire, so a dialog raised there
     * must stay local rather than reach the previous session's guests.
     */
    requestGuestUi(request: CollabUiRequestDraft, signal?: AbortSignal): Promise<CollabGuestUiResult> | null;
    start(relayUrl: string, webUrl?: string): Promise<void>;
    /**
     * Broadcast a goodbye, detach all taps, withdraw the registry entry, and
     * close the socket. Resolves once the room is fully gone — including a
     * teardown the room started on its own after a fatal relay close — so a
     * successor can safely reuse this instance's registry endpoint.
     */
    stop(reason: string): Promise<void>;
}
