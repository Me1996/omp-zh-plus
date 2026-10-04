import type { ComposerChromeContext, ComposerStyle } from "./types.js";
/** Draw a full-width rule with status content docked at its right edge.
 * Over-wide content is truncated (keeping one rule cell on each side) rather
 * than dropped, so the chip survives narrow terminals and previews. */
export declare function renderTopRule(ctx: ComposerChromeContext): string;
/** Composer style with one status-bearing top rule and no bottom chrome. */
export declare const ruleComposerStyle: ComposerStyle;
