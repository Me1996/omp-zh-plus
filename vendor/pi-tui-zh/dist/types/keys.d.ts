/**
 * Keyboard input handling for terminal applications.
 *
 * Supports both legacy terminal sequences and Kitty keyboard protocol.
 * See: https://sw.kovidgoyal.net/kitty/keyboard-protocol/
 * Reference: https://github.com/sst/opentui/blob/7da92b4088aebfe27b9f691c04163a48821e49fd/packages/core/src/lib/parse.keypress.ts
 *
 * Symbol keys are also supported, however some ctrl+symbol combos
 * overlap with ASCII codes, e.g. ctrl+[ = ESC.
 * See: https://sw.kovidgoyal.net/kitty/keyboard-protocol/#legacy-ctrl-mapping-of-ascii-keys
 * Those can still be * used for ctrl+shift combos
 *
 * API:
 * - matchesKey(data, keyId) - Check if input matches a key identifier
 * - parseKey(data) - Parse input and return the key identifier
 * - Key - Helper object for creating typed key identifiers
 * - setKittyProtocolActive(active) - Set global Kitty protocol state
 * - isKittyProtocolActive() - Query global Kitty protocol state
 */
import type { KeyEventType } from "@oh-my-pi/pi-natives";
/** Whether the local process is running directly under Windows Terminal. */
export declare function isWindowsTerminalSession(): boolean;
/**
 * Match ambiguous legacy Backspace bytes against an expected modifier mask.
 *
 * Windows Terminal encodes Ctrl+Backspace as raw `0x08` (BS) and plain
 * Backspace as `0x7f` (DEL). Remote/container sessions lose terminal identity,
 * and multiplexers (tmux/screen/Zellij) inherit `WT_SESSION` while emitting
 * raw `0x08` for plain Backspace themselves, so the automatic heuristic is
 * limited to direct Windows Terminal sessions. `PI_TUI_RAW_BACKSPACE_IS_CTRL=1`
 * explicitly opts into the mapping everywhere.
 */
export declare function matchesRawBackspace(data: string, expectedModifier: number): boolean;
/**
 * Set the global Kitty keyboard protocol state.
 * Called by ProcessTerminal after detecting protocol support.
 */
export declare function setKittyProtocolActive(active: boolean): void;
/**
 * Query whether Kitty keyboard protocol is currently active.
 */
export declare function isKittyProtocolActive(): boolean;
type Letter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type KeySymbol = "`" | "-" | "=" | "[" | "]" | "\\" | ";" | "'" | "," | "." | "/" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")" | "_" | "+" | "|" | "~" | "{" | "}" | ":" | "<" | ">" | "?";
type SpecialKey = "escape" | "esc" | "enter" | "return" | "tab" | "space" | "backspace" | "delete" | "insert" | "clear" | "home" | "end" | "pageUp" | "pageDown" | "up" | "down" | "left" | "right" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12";
type BaseKey = Letter | Digit | KeySymbol | SpecialKey;
/** Modifier key names as they appear in {@link KeyId} chords. */
export type ModifierName = "ctrl" | "shift" | "alt" | "super";
type ModifiedKeyId<Key extends string, RemainingModifiers extends ModifierName = ModifierName> = {
    [M in RemainingModifiers]: `${M}+${Key}` | `${M}+${ModifiedKeyId<Key, Exclude<RemainingModifiers, M>>}`;
}[RemainingModifiers];
/**
 * Union type of all valid key identifiers.
 * Provides autocomplete and catches typos at compile time.
 */
export type KeyId = BaseKey | ModifiedKeyId<BaseKey>;
/**
 * Typed helper for constructing key identifiers with autocomplete.
 *
 * The runtime values are just the canonical key-name strings (so `Key.enter`
 * is literally `"enter"`); the value of `Key` over a bag of magic strings is
 * that each property is typed to the exact `KeyId` literal it produces and the
 * modifier methods return precisely-typed concatenations (e.g. `Key.ctrl("c")`
 * is `"ctrl+c"`, not just `string`). This mirrors the upstream
 * `@mariozechner/pi-tui` `Key` export verbatim so plugins built against any
 * scope alias (`@mariozechner`, `@earendil-works`, `@oh-my-pi`) keep working
 * once the specifier shim remaps them to this package.
 */
export declare const Key: {
    readonly escape: "escape";
    readonly esc: "esc";
    readonly enter: "enter";
    readonly return: "return";
    readonly tab: "tab";
    readonly space: "space";
    readonly backspace: "backspace";
    readonly delete: "delete";
    readonly insert: "insert";
    readonly clear: "clear";
    readonly home: "home";
    readonly end: "end";
    readonly pageUp: "pageUp";
    readonly pageDown: "pageDown";
    readonly up: "up";
    readonly down: "down";
    readonly left: "left";
    readonly right: "right";
    readonly f1: "f1";
    readonly f2: "f2";
    readonly f3: "f3";
    readonly f4: "f4";
    readonly f5: "f5";
    readonly f6: "f6";
    readonly f7: "f7";
    readonly f8: "f8";
    readonly f9: "f9";
    readonly f10: "f10";
    readonly f11: "f11";
    readonly f12: "f12";
    readonly backtick: "`";
    readonly hyphen: "-";
    readonly equals: "=";
    readonly leftbracket: "[";
    readonly rightbracket: "]";
    readonly backslash: "\\";
    readonly semicolon: ";";
    readonly quote: "'";
    readonly comma: ",";
    readonly period: ".";
    readonly slash: "/";
    readonly exclamation: "!";
    readonly at: "@";
    readonly hash: "#";
    readonly dollar: "$";
    readonly percent: "%";
    readonly caret: "^";
    readonly ampersand: "&";
    readonly asterisk: "*";
    readonly leftparen: "(";
    readonly rightparen: ")";
    readonly underscore: "_";
    readonly plus: "+";
    readonly pipe: "|";
    readonly tilde: "~";
    readonly leftbrace: "{";
    readonly rightbrace: "}";
    readonly colon: ":";
    readonly lessthan: "<";
    readonly greaterthan: ">";
    readonly question: "?";
    readonly ctrl: <K extends BaseKey>(key: K) => `ctrl+${K}`;
    readonly shift: <K extends BaseKey>(key: K) => `shift+${K}`;
    readonly alt: <K extends BaseKey>(key: K) => `alt+${K}`;
    readonly super: <K extends BaseKey>(key: K) => `super+${K}`;
    readonly ctrlShift: <K extends BaseKey>(key: K) => `ctrl+shift+${K}`;
    readonly shiftCtrl: <K extends BaseKey>(key: K) => `shift+ctrl+${K}`;
    readonly ctrlAlt: <K extends BaseKey>(key: K) => `ctrl+alt+${K}`;
    readonly altCtrl: <K extends BaseKey>(key: K) => `alt+ctrl+${K}`;
    readonly shiftAlt: <K extends BaseKey>(key: K) => `shift+alt+${K}`;
    readonly altShift: <K extends BaseKey>(key: K) => `alt+shift+${K}`;
    readonly ctrlSuper: <K extends BaseKey>(key: K) => `ctrl+super+${K}`;
    readonly superCtrl: <K extends BaseKey>(key: K) => `super+ctrl+${K}`;
    readonly shiftSuper: <K extends BaseKey>(key: K) => `shift+super+${K}`;
    readonly superShift: <K extends BaseKey>(key: K) => `super+shift+${K}`;
    readonly altSuper: <K extends BaseKey>(key: K) => `alt+super+${K}`;
    readonly superAlt: <K extends BaseKey>(key: K) => `super+alt+${K}`;
    readonly ctrlShiftAlt: <K extends BaseKey>(key: K) => `ctrl+shift+alt+${K}`;
    readonly ctrlShiftSuper: <K extends BaseKey>(key: K) => `ctrl+shift+super+${K}`;
};
interface ParsedKittySequence {
    codepoint: number;
    shiftedKey?: number;
    baseLayoutKey?: number;
    modifier: number;
    eventType?: KeyEventType;
}
/**
 * Check if the input is a key release event.
 * Only meaningful when Kitty keyboard protocol with flag 2 is active.
 * Returns false if Kitty protocol is not active.
 */
export declare function isKeyRelease(data: string): boolean;
/**
 * Check if the input is a key repeat event.
 * Only meaningful when Kitty keyboard protocol with flag 2 is active.
 * Returns false if Kitty protocol is not active.
 */
export declare function isKeyRepeat(data: string): boolean;
export declare function parseKittySequence(data: string): ParsedKittySequence | null;
/**
 * Extract printable text from raw terminal input.
 *
 * Handles Kitty CSI-u text-producing keys so text-entry components can treat
 * keypad digits, keypad operators, and shifted symbols the same as direct character input.
 */
export declare function extractPrintableText(data: string): string | undefined;
/**
 * Decode terminal input into the printable character it represents.
 *
 * Tries Kitty CSI-u first, then falls back to xterm modifyOtherKeys. Returns
 * undefined for control sequences and modifier-only events.
 */
export declare function decodePrintableKey(data: string): string | undefined;
/**
 * Match input data against a key identifier string.
 *
 * Supported key identifiers:
 * - Single keys: "escape", "tab", "enter", "backspace", "delete", "home", "end", "space"
 * - Arrow keys: "up", "down", "left", "right"
 * - Ctrl combinations: "ctrl+c", "ctrl+z", etc.
 * - Shift combinations: "shift+tab", "shift+enter"
 * - Alt combinations: "alt+enter", "alt+backspace"
 * - Combined modifiers: "shift+ctrl+p", "ctrl+alt+x"
 *
 * Use the Key helper for autocomplete: Key.ctrl("c"), Key.escape, Key.ctrlShift("p")
 *
 * @param data - Raw input data from terminal
 * @param keyId - Key identifier (e.g., "ctrl+c", "escape", Key.ctrl("c"))
 */
export declare function matchesKey(data: string, keyId: KeyId): boolean;
/**
 * Parse terminal input and return a normalized key identifier.
 *
 * Returns key names like "escape", "ctrl+c", "shift+tab", "alt+enter".
 * Returns undefined if the input is not a recognized key sequence.
 *
 * @param data - Raw input data from terminal
 */
export declare function parseKey(data: string): string | undefined;
export {};
