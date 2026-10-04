/**
 * Key-hint formatting, kept free of the native addon: it imports only types
 * plus the theme symbol mirror, so addon-free CLI paths (`omp --version`,
 * help text in cli/command-help.ts) can format keys without loading
 * `@oh-my-pi/pi-natives` through the keybindings registry.
 */
import type { KeyId } from "./keybindings.js";
import type { ModifierName } from "./keys.js";
/** Pin the platform used to render modifier labels (test seam). */
export declare function setKeyHintPlatform(platform: NodeJS.Platform | undefined): void;
/** Platform currently used for key-hint rendering. */
export declare function keyHintPlatform(): NodeJS.Platform;
/** A displayable key: a chord, or a bare modifier for "hold ⇧" style hints. */
export type KeyName = KeyId | ModifierName;
/**
 * Format one key for display: `"ctrl+shift+c"` → `⌃⇧C` (macOS) / `Ctrl+⇧C`,
 * `"escape"` → `⎋`, `"alt+up"` → `⌥↑` / `Alt+↑`, `"shift"` → `⇧`.
 * A glyph modifier is followed by the preset's `key.joiner` (nothing in
 * unicode, a space in nerd, whose icons blur together when adjacent); a word
 * modifier takes a `+`. Modifiers
 * render in canonical order whatever the binding says (`shift+ctrl+p` → `⌃⇧P`).
 * A bare letter stays lowercase (`q`) since `Q` would read as ⇧Q; in a chord it
 * is capitalized. Other keys are capitalized (`f5` → `F5`).
 */
export declare function formatKeyHint(key: KeyName): string;
/** Format alternative keys as a slash-separated hint (`["f5", "alt+r"]` → `F5/⌥R`). */
export declare function formatKeyHints(keys: KeyName | readonly KeyName[]): string;
/** Format a double-tap gesture: `←←` with glyphs, `Left Left` with words. */
export declare function formatDoubleTap(key: KeyName): string;
