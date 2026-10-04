/**
 * Chrome-free composer: a bare `❯ ` prompt with no rules or borders. Also the
 * effective style whenever a host calls `setBorderVisible(false)` (hook
 * editors, agents hub). The status bar renders as a plain standalone bottom
 * bar with both segment groups.
 */
import type { ComposerStyle } from "./types.js";
export declare const borderlessComposerStyle: ComposerStyle;
