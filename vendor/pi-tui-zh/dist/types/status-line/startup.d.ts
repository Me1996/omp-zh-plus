/**
 * Status line for the speculative first frame, before any session exists.
 *
 * InteractiveMode persists {@link StatusLineStartupData} (settings plus the last
 * session's model and thinking state); the next launch renders it through the
 * real {@link StatusLineComponent} as a fresh, unnamed session at the live
 * terminal width. Path and git branch are read live; context usage is reported
 * unknown so the gauge shows the window without a percent.
 *
 * @example
 * ```ts ignore
 * const statusLine = createStartupStatusLine(cached.statusLine);
 * statusLine.attachToEditor(editor, getComposerStyle(shape));
 * ```
 */
import type { ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Model } from "@oh-my-pi/pi-catalog/types";
import { StatusLineComponent } from "./component.js";
import type { CompactionBoundaries } from "./context-usage.js";
import type { StatusLineSettings } from "./types.js";
/** Session-independent inputs that reproduce a fresh session's status bar on the next launch. */
export interface StatusLineStartupData {
    readonly settings: StatusLineSettings;
    readonly gitEnabled: boolean;
    /** Model of the last session; the next fresh session usually starts on it too. */
    readonly model?: Model;
    readonly thinkingLevel?: ThinkingLevel;
    readonly autoThinking: boolean;
    readonly fastMode: boolean;
    /** Whether `model` bills through a subscription (drives the cost segment's prefix). */
    readonly usingSubscription: boolean;
    readonly autoCompactEnabled: boolean;
    readonly compactionBoundaries: CompactionBoundaries | null;
}
/** Build the prepaint status line; the caller disposes it once the session-bound bar mounts. */
export declare function createStartupStatusLine(data: StatusLineStartupData): StatusLineComponent;
/** Validate persisted {@link StatusLineStartupData}; `undefined` for anything malformed. */
export declare function readStatusLineStartupData(value: unknown): StatusLineStartupData | undefined;
