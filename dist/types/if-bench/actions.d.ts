/**
 * The character-array machine `omp if-bench` drives.
 *
 * Every action is generated from its absolute index, so a run is fully
 * reproducible: turn N of a run with array length L always issues the same
 * tokens, and the expected result is computed locally by {@link applyActions}
 * rather than trusted from the model. Actions are encoded as single glyphs
 * ({@link encodeAction}) whose meaning lives only in the system prompt,
 * so the model cannot lean on natural-language paraphrase.
 */
/** Inclusive array-length bounds: `weave` needs an even split, `blocks` needs room for size 7. */
export declare const MIN_ARRAY_LENGTH = 8;
export declare const MAX_ARRAY_LENGTH: number;
/** One machine instruction; positions are 1-based and inclusive. */
export type Action = {
    kind: "swap";
    first: number;
    second: number;
} | {
    kind: "rotate-left";
    amount: number;
} | {
    kind: "rotate-right";
    amount: number;
} | {
    kind: "reverse";
    first: number;
    last: number;
} | {
    kind: "move";
    from: number;
    to: number;
} | {
    kind: "swap-pairs";
} | {
    kind: "odd-even";
} | {
    kind: "reverse-blocks";
    size: number;
} | {
    kind: "rotate-span";
    first: number;
    last: number;
    amount: number;
} | {
    kind: "weave";
};
/**
 * Opening state: `A..Z` truncated to `length` and shuffled by a fixed LCG.
 *
 * Scrambled on purpose — an alphabetical start lets a model reconstruct state
 * from memory instead of reading its own previous answer.
 *
 * @throws when `length` is odd or outside [{@link MIN_ARRAY_LENGTH}, {@link MAX_ARRAY_LENGTH}].
 */
export declare function initialArray(length: number): string;
/**
 * The `count` actions starting at absolute index `start`.
 *
 * The kind cycles every 10 indices so each turn mixes local edits (swap, move)
 * with whole-array permutations (weave, odd-even) that invalidate every
 * remembered position.
 */
export declare function makeActions(length: number, start: number, count: number): Action[];
/** Run `actions` over `input` in order and return the resulting string. */
export declare function applyActions(input: string, actions: readonly Action[]): string;
/** Wire form of one action; the system prompt is the only place its glyph is defined. */
export declare function encodeAction(action: Action): string;
