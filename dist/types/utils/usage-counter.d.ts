/**
 * In-memory usage counts mirrored into agent.db's `<kind>_usage` tables (see
 * {@link AgentStorage.recordUsage}), read synchronously on hot UI paths.
 *
 * - {@link commandUsage}: keyed by canonical slash-command name (builtin primary
 *   name, `skill:<name>`, custom/file/template name). {@link InputController}
 *   records every submitted known command; `CombinedAutocompleteProvider` uses
 *   the counts to break text-match-score ties.
 * - {@link hintUsage}: keyed by composer hint id; a hint retires once its
 *   gesture has been used often enough (see `COMPOSER_HINTS`).
 *
 * Until {@link UsageCounter.load} resolves, hits stay in memory only —
 * headless paths and tests that never load a counter never open agent.db.
 */
import type { ComposerHintId } from "@oh-my-pi/pi-tui-zh/prompt/composer-hints";
import { type UsageKind } from "../session/agent-storage.js";
/** Process-wide use counts for one {@link UsageKind}, keyed by `Name`. */
export declare class UsageCounter<Name extends string = string> {
    #private;
    readonly kind: UsageKind;
    constructor(kind: UsageKind);
    /** Load persisted counts once per process; concurrent calls share one read. */
    load(): Promise<void>;
    get(name: Name): number;
    /** Increment a count; persists when the counter is loaded. */
    record(name: Name): void;
}
/** Slash-command invocation counts. */
export declare const commandUsage: UsageCounter<string>;
/** Composer hint gesture counts. */
export declare const hintUsage: UsageCounter<ComposerHintId>;
