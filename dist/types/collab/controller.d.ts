import type { InteractiveModeContext } from "../modes/types.js";
import { CollabHost } from "./host.js";
import type { CollabAccess } from "./registry.js";
export type CollabAutoStart = "off" | CollabAccess;
export interface CollabStartOptions {
    /** Highest access the registry may hand out for the new room. */
    access: CollabAccess;
    /** Relay override (`host[:port]` or a full URL); defaults to `collab.relayUrl`. */
    relay?: string;
}
export declare class CollabController {
    #private;
    readonly instanceId: string;
    constructor(ctx: InteractiveModeContext);
    /** The live room for the current session; stale or ending rooms are absent. */
    get host(): CollabHost | undefined;
    /** Registry generation of the most recently started room; 0 before the first. */
    get generation(): number;
    get autoStartMode(): CollabAutoStart;
    /**
     * Apply `collab.autoStart` for the current session. The room object is
     * installed synchronously so dialogs raised before the relay connects are
     * retained for the first writer; the connection itself proceeds in the
     * background and a failure is reported without disturbing the session. A
     * relay that is unavailable is retried on the relaunch backoff, so hosting
     * starts once it answers.
     * Until {@link startupComplete} is called, guests can join and answer
     * dialogs but cannot prompt, interrupt, or command agents.
     */
    autoStart(): void;
    /** Admit hosting only for a restored local identity, preserving later stop/shutdown intent. */
    resumeAfterGuest(restoration: Promise<boolean>): void;
    /**
     * Interactive startup (extension hooks, mode reconciliation) has finished:
     * from now on guests in any room of this process may drive the session.
     */
    startupComplete(): void;
    /**
     * Start (or reuse) a room for `/collab`. A live room already granting at
     * least the requested access is reused; a view-only room is replaced when
     * control is requested.
     */
    start(options: CollabStartOptions): Promise<CollabHost>;
    /** Cancel pending launches and stop the current room, including a stop already in flight. */
    stop(reason: string): Promise<void>;
    /** Resolves once no stop/start sequence is in flight. */
    idle(): Promise<void>;
    /** Stop hosting for good; no further rooms are started for this process. */
    shutdown(reason: string): Promise<void>;
}
