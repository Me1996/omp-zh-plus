/**
 * Agent reactions. A reply whose text opens with an emoji is reacting to the
 * transcript block before it: the emoji is lifted out of the prose and shown as
 * a badge on that block instead. While the reply streams, an incomplete opening
 * run is withheld until it either completes an emoji or proves to be ordinary
 * text, so the emoji never flashes inside the reply.
 *
 * Reactions are derived from the persisted assistant text, never stored, so a
 * rebuilt transcript reproduces them exactly.
 */
import { type Component } from "../tui.js";
/** A transcript block that can display an agent reaction badge. */
export interface ReactionTarget {
    setReaction(emoji: string): void;
}
/** Whether `component` accepts a reaction badge. */
export declare function isReactionTarget(component: Component | undefined): component is Component & ReactionTarget;
export interface ReactionSplit {
    /** The reaction emoji when the text opens with an emoji. */
    emoji?: string;
    /** Text with the opening emoji and any following whitespace removed; the input when there is none. */
    body: string;
    /** True while the text could still grow into an emoji. */
    pending: boolean;
}
/**
 * Split an opening reaction emoji off the front of assistant text, consuming
 * the next whitespace if any. Leading whitespace is tolerated.
 */
export declare function splitReaction(text: string): ReactionSplit;
