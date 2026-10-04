/**
 * Utilities for formatting keybinding hints in the UI.
 */
import { type KeyId, type Keybinding } from "../keybindings.js";
import { type AppKeybinding, type KeyName, type KeybindingsManager } from "../app-keybindings.js";
/**
 * Primary (first) key bound to an editor action, formatted for footer hints;
 * empty when unbound. Full alternatives: `formatKeyHints(getKeybindings().getKeys(action))`.
 */
export declare function editorKey(action: Keybinding): string;
/** Primary keys of several actions, slash-joined: `editorKeys("tui.select.up", "tui.select.down")` → `↑/↓`. */
export declare function editorKeys(...actions: Keybinding[]): string;
/**
 * Keys bound to `action`, or `fallback` when the active registry has none — a
 * TUI-only registry carries no `app.*` bindings. Mirrors the fallbacks in
 * `keybinding-matchers.ts`, so hints name the keys the matcher accepts.
 */
export declare function boundKeys(action: Keybinding, fallback: readonly KeyId[]): readonly KeyId[];
/** Primary interrupt key (`app.interrupt`, raw Escape when unbound, as `matchesAppInterrupt`). */
export declare function interruptKey(): string;
/** Primary key bound to an app action (see {@link editorKey}); all keys: `getDisplayString`. */
export declare function appKey(keybindings: KeybindingsManager, action: AppKeybinding): string;
/**
 * Format a keybinding hint with consistent styling: dim key, muted description.
 * Looks up the key from editor keybindings automatically.
 *
 * @param action - Keybinding action name (e.g., "tui.select.confirm", "app.tools.expand")
 * @param description - Description text (e.g., "to expand", "cancel")
 * @returns Formatted string with dim key and muted description
 */
export declare function keyHint(action: Keybinding, description: string): string;
/**
 * Format a keybinding hint for app-level actions.
 * Requires the KeybindingsManager instance.
 *
 * @param keybindings - KeybindingsManager instance
 * @param action - App keybinding name (e.g., "app.interrupt", "app.editor.external")
 * @param description - Description text
 * @returns Formatted string with dim key and muted description
 */
export declare function appKeyHint(keybindings: KeybindingsManager, action: AppKeybinding, description: string): string;
/**
 * Format a hint for fixed (non-configurable) keys, e.g. `rawKeyHint(["up", "down"], "navigate")`.
 * Alternatives render slash-separated (see {@link formatKeyHints}).
 */
export declare function rawKeyHint(keys: KeyName | readonly KeyName[], description: string): string;
