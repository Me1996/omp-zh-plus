import { type VibeCli } from "@oh-my-pi/pi-tui-zh/tools/vibe";
/**
 * Vibe session lifecycle vocabulary: the persisted `vibe-session-lifecycle`
 * custom-entry schema and its parser.
 *
 * Deliberately a leaf module — it is consumed by persisted-roster scanning
 * ([`persistedVibeChildIds`] via `registry/persisted-agents`), which sits on
 * the internal-URL resolution path. Importing `vibe/runtime` from there would
 * drag the task executor and SDK into the render-utils module cycle.
 */
/** Custom-entry type tag for persisted Vibe lifecycle events. */
export declare const VIBE_LIFECYCLE_CUSTOM_TYPE = "vibe-session-lifecycle";
/** Schema version for persisted Vibe lifecycle events. */
export declare const VIBE_LIFECYCLE_VERSION = 1;
export type VibeTombstoneReason = "explicit-kill" | "mode-exit" | "spawn-failed" | "unrecoverable";
export interface VibeLifecycleBase {
    version: typeof VIBE_LIFECYCLE_VERSION;
    id: string;
    ownerId: string;
    parentSessionId: string;
}
export interface VibeSpawnLifecycleEvent extends VibeLifecycleBase {
    action: "spawn";
    cli: VibeCli;
    agent: string;
    childSessionFile: string;
    createdAt: number;
}
export interface VibeTurnLifecycleEvent extends VibeLifecycleBase {
    action: "turn-started" | "turn-settled";
    turn: number;
}
export interface VibeTombstoneLifecycleEvent extends VibeLifecycleBase {
    action: "tombstone";
    reason: VibeTombstoneReason;
}
export interface VibeTombstoneRevocationEvent extends VibeLifecycleBase {
    action: "tombstone-revoked";
    reason: "mode-exit";
}
export type VibeLifecycleEvent = VibeSpawnLifecycleEvent | VibeTurnLifecycleEvent | VibeTombstoneLifecycleEvent | VibeTombstoneRevocationEvent;
/** Parse one persisted lifecycle payload; `undefined` for foreign/malformed data. */
export declare function parseLifecycleEvent(value: unknown): VibeLifecycleEvent | undefined;
/** Child ids claimed by valid Vibe spawn records from untrusted persisted JSON. */
export declare function persistedVibeChildIds(entries: Iterable<unknown>): Set<string>;
