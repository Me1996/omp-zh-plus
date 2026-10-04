import type { IfBenchFailure } from "@oh-my-pi/pi-tui-zh/apps/if-bench-board";
import type { Action } from "./actions.js";
/** Where the cat directive sits inside the turn's user message. */
export declare const CAT_PLACEMENTS: readonly ["beginning", "middle", "end"];
export type CatPlacement = (typeof CAT_PLACEMENTS)[number];
/** Longest accepted cat sound, i.e. the `N` in `nya{1,N}`. */
export declare const DEFAULT_NYA_MAX = 8;
/**
 * Matcher for one accepted cat sound.
 *
 * The trailing lookahead rejects both an over-long tail (`nyaaaaaaaaa` with more
 * than `nyaMax` a's) and the literal directive text `nya{1,N}` echoed back from
 * the prompt, so quoting the instruction never counts as following it.
 */
export declare function catSoundPattern(nyaMax: number): RegExp;
/** System prompt: machine semantics plus the response contract. */
export declare function buildSystemPrompt(nyaMax: number): string;
/** One turn's user message and where its cat directive landed. */
export interface TurnPrompt {
    content: string;
    placement: CatPlacement;
}
/**
 * Build the user message for `turn` (1-based).
 *
 * `start` is passed on the first turn only; later turns deliberately omit the
 * array so the model must carry state forward from its own previous reply.
 */
export declare function buildTurnPrompt(options: {
    turn: number;
    start?: string;
    actions: readonly Action[];
    nyaMax: number;
}): TurnPrompt;
/** Verdict for one reply, plus the array the model actually reported. */
export interface TurnAssessment {
    passed: boolean;
    failure?: IfBenchFailure;
    /** Array read out of `<...>` with whitespace and cat sounds stripped; undefined when the block is missing. */
    reported?: string;
}
/** Score one reply against the locally computed `expected` array. */
export declare function assessResponse(response: string, expected: string, nyaMax: number): TurnAssessment;
