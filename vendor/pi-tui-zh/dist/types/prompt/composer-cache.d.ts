import type { ComposerPreferences, ComposerStatusCache } from "./composer.js";
import type { SymbolPreset } from "../theme/theme.js";
/** Theme inputs cached from the last resolved settings load for stable prepaint colors. */
export interface ComposerThemePreferences {
    readonly symbolPreset?: SymbolPreset;
    readonly colorBlindMode?: boolean;
    readonly darkTheme?: string;
    readonly lightTheme?: string;
}
/** Speculative composer state read before the settings/session graph is available. */
export interface ComposerStartupCache {
    readonly preferences?: ComposerPreferences;
    readonly theme?: ComposerThemePreferences;
    readonly status?: ComposerStatusCache;
}
/**
 * Process-wide store at {@link getComposerCacheDbPath}, opened on first use and
 * closed at exit. `undefined` when it cannot be opened (logged once; startup
 * paints without speculation) and under the test runner, so tests never read
 * or clobber the user's cache; tests open {@link ComposerCache.open} explicitly.
 */
export declare function sharedComposerCache(): ComposerCache | undefined;
/** SQLite store of the composer state the next launch paints before its session exists. */
export declare class ComposerCache {
    #private;
    private constructor();
    /**
     * Open (creating if needed) the store at `dbPath`, quarantining a corrupt one once.
     * @throws when the directory or database cannot be created.
     */
    static open(dbPath?: string): ComposerCache;
    /** Everything cached for `cwd`, with any-project rows as fallback for shared kinds. Never throws. */
    read(cwd: string): ComposerStartupCache;
    /** Resolved theme and composer settings for the next prepaint. */
    writeUi(cwd: string, preferences: ComposerPreferences, theme: ComposerThemePreferences): void;
    /** Status-bar inputs for the next prepaint's startup status line. */
    writeStatus(cwd: string, status: ComposerStatusCache): void;
    close(): void;
}
