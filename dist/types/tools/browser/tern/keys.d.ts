/** A modifier as Tern's input steps name it. */
export type TernModifier = "shift" | "ctrl" | "alt" | "meta";
/** One trusted input step of Tern's `input` op. */
export type TernInputStep = {
    type: "mouse";
    action: "move" | "down" | "up";
    x: number;
    y: number;
    button?: "left" | "right" | "middle";
    clicks?: number;
    mods?: TernModifier[];
} | {
    type: "wheel";
    x: number;
    y: number;
    dx: number;
    dy: number;
    mods?: TernModifier[];
} | {
    type: "key";
    action: "down" | "up";
    key: string;
    code?: string;
    text?: string;
    mods?: TernModifier[];
} | {
    type: "text";
    text: string;
};
/** A resolved key: its DOM `key`, DOM `code` when known, and the modifier it is. */
export interface TernKey {
    key: string;
    code?: string;
    modifier?: TernModifier;
}
/** Resolve one Puppeteer key name. Throws a ToolError for names Tern cannot type. */
export declare function ternKey(name: string): TernKey;
/**
 * Split `Control+Shift+a` into its keys; a lone `+` (or a name without `+`)
 * is one key.
 */
export declare function splitKeyCombo(combo: string): string[];
/** Key-down step for `key` with `mods` held. */
export declare function keyDownStep(key: TernKey, mods: readonly TernModifier[]): TernInputStep;
/** Key-up step for `key` with `mods` held. */
export declare function keyUpStep(key: TernKey, mods: readonly TernModifier[]): TernInputStep;
/**
 * Steps pressing `combo` (`Enter`, `a`, `Control+a`) with `held` modifiers
 * already down: modifiers of the combo go down first and up last.
 */
export declare function pressSteps(combo: string, held: readonly TernModifier[]): TernInputStep[];
/**
 * Steps typing `text` like a keyboard: printable ASCII and Enter/Tab as key
 * presses (so key handlers see them), anything else as inserted text.
 */
export declare function typeSteps(text: string, held: readonly TernModifier[]): TernInputStep[];
