import type { ComposerStyle, EditorBorderStyle } from "./types.js";
/** Whether an id names a composer style shipped by pi-tui. */
export declare function isBuiltinComposerStyle(id: string): boolean;
/**
 * Whether a style paints its own row foreground.
 *
 * Extensions registered before `filledSurface` existed received undecorated
 * row text, so an omitted flag remains filled for extension-owned ids.
 */
export declare function isFilledComposerStyle(style: ComposerStyle): boolean;
/**
 * Register one extension-owned composer style for this process.
 *
 * Built-in ids and duplicate extension ids are rejected. The returned disposer
 * removes only this registration.
 */
export declare function registerComposerStyle(style: ComposerStyle): () => void;
/** Style object for a composer shape; unknown ids fall back to `box`. */
export declare function getComposerStyle(id: EditorBorderStyle): ComposerStyle;
