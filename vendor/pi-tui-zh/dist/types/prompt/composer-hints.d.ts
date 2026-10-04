/**
 * Composer hints: the right-aligned placeholder shown in the empty composer to
 * surface gestures that matter right now (e.g. background agents are running).
 *
 * Hints are checked in priority order; the first one that applies wins. A hint
 * retires for good once the user has performed its gesture
 * {@link ComposerHint.learnedAfter} times — the host records each use under the
 * hint's id and reports counts through {@link ComposerHintContext.uses}.
 *
 * Add a hint by appending to {@link COMPOSER_HINTS}, extending
 * {@link ComposerHintId}, and recording the gesture where it is handled.
 */
import { type KeybindingsManager } from "../app-keybindings.js";
/** Stable hint ids; persisted as usage-counter keys, so never rename one. */
export type ComposerHintId = "agents" | "effort";
/** Live state that hint conditions read. Built by the host on every render of the empty composer. */
export interface ComposerHintContext {
    /** Subagents currently running in the background. */
    runningAgents: number;
    /** The view is focused on a subagent session instead of the main one. */
    focusedOnAgent: boolean;
    /** The viewed session already has messages. */
    conversationStarted: boolean;
    keybindings: KeybindingsManager;
    /** Times the user has performed the gesture a hint teaches. */
    uses(id: ComposerHintId): number;
}
/** A gesture tip: `key` renders highlighted, `label` describes what it does. */
export interface ComposerHint {
    id: ComposerHintId;
    /** Uses of the gesture after which the hint stops showing. */
    learnedAfter: number;
    /** Key and label when the hint applies, otherwise `undefined`. */
    resolve(ctx: ComposerHintContext): {
        key: string;
        label: string;
    } | undefined;
}
/** Registered hints, highest priority first. */
export declare const COMPOSER_HINTS: readonly ComposerHint[];
/** Render the highest-priority applicable, not-yet-learned hint, if any. */
export declare function resolveComposerHint(ctx: ComposerHintContext): string | undefined;
