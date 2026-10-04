import type { Terminal } from "@oh-my-pi/pi-tui-zh";
import { Composer, type ComposerPreferences } from "@oh-my-pi/pi-tui-zh/prompt/composer";
import { type ComposerThemePreferences } from "@oh-my-pi/pi-tui-zh/prompt/composer-cache";
/** Inputs available at the CLI prepaint boundary before command modules load. */
export interface PrepaintComposerOptions {
    readonly terminal?: Terminal;
    readonly exit?: (code: number) => void;
    readonly now?: () => number;
    readonly version?: string;
    readonly cwd?: string;
    readonly preferences?: Partial<ComposerPreferences>;
    readonly theme?: ComposerThemePreferences;
    readonly cache?: boolean;
}
/** Final settings pushed into the live composer after Settings and the theme resolve. */
export interface PrepaintComposerPreferences extends ComposerPreferences {
    readonly theme: ComposerThemePreferences;
}
/** Ownership token that transfers one already-started Composer to InteractiveMode. */
export declare class ComposerLease {
    #private;
    readonly composer: Composer;
    constructor(composer: Composer);
    /** Transfer terminal ownership exactly once. */
    adopt(): void;
    /** Stop an unadopted composer when startup exits before InteractiveMode. */
    dispose(): void;
}
/** Start the canonical Composer with speculative cached state. */
export declare function beginStartupComposer(options?: PrepaintComposerOptions): void;
/** Take the live prepaint composer away from the module-level startup owner. */
export declare function takeStartupComposerLease(): ComposerLease | undefined;
/** Stop and forget any prepaint composer that never reached InteractiveMode. */
export declare function stopPendingStartupComposer(): void;
/** Apply final settings to the pending Composer and cache them for the next first frame. */
export declare function applyStartupComposerPreferences(update: PrepaintComposerPreferences): void;
