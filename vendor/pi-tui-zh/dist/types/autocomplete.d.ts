/**
 * Locate the slash that opens a slash command on the line, allowing leading
 * whitespace. Returns the index of the `/` or `null` when the line is not a
 * slash command. Aligns with `trimStart` semantics so the editor and provider
 * agree on which prefixes count.
 */
export declare function findLeadingSlashCommandStart(text: string): number | null;
export declare function findTrailingSlashCommandStart(text: string): number | null;
/**
 * Whether an autocomplete value represents a directory: trailing slash or
 * backslash, optionally followed by a closing quote for quoted paths.
 * Shared by the provider suffix logic and the editor chain-on-accept
 * behavior so Tab and Enter acceptance stay in sync.
 */
export declare function isDirectoryCompletionValue(value: string): boolean;
/** Ranked-tier subsequence match ("wig" ~ "skill:wig"); distinct from fuzzy.ts's word-local engine. */
export declare function subsequenceMatch(query: string, target: string): boolean;
/**
 * Whether an `@` file completion `value` still fits the live `@` token.
 * The editor narrows a stale `@` list with this while a fresh search runs;
 * mirrors the subsequence filter `getSuggestions` applies to fuzzy results.
 */
export declare function atCompletionMatches(token: string, value: string): boolean;
/** Ranked-tier subsequence score (100/80/60/40−gaps·5); higher is better, 0 is no match. */
export declare function subsequenceScore(query: string, target: string): number;
export interface AutocompleteItem {
    value: string;
    label: string;
    description?: string;
    /** Optional type-indicator glyph rendered in an aligned column before the label */
    icon?: string;
    /** Named icon for TSP terminals (`folder`, `file`, a slash-command icon name). */
    iconName?: string;
    /** Native detail when it differs from {@link description} (static text, parent dir). */
    nativeDetail?: string;
    /** Live state drawn right-aligned natively ("demo/demo", "off"). */
    state?: string;
    /** Dim hint text shown inline after cursor when this item is selected */
    hint?: string;
}
type Awaitable<T> = T | Promise<T>;
export interface SlashCommand {
    name: string;
    aliases?: string[];
    description?: string;
    /** Optional type-indicator glyph shown before the command name in autocomplete */
    icon?: string;
    /** Named icon for TSP terminals, drawn instead of the {@link icon} glyph. */
    iconName?: string;
    argumentHint?: string;
    /** Whether the command consumes argument text after the command name. False means the full input stays normal prompt text once args are present. */
    allowArgs?: boolean;
    /** Dynamic display-only description for slash-command autocomplete. Must be synchronous and side-effect free. */
    getAutocompleteDescription?: () => string | undefined;
    getArgumentCompletions?(argumentPrefix: string): Awaitable<AutocompleteItem[] | null>;
    /** Return inline hint text for the current argument state (shown as dim ghost text after cursor) */
    getInlineHint?(argumentText: string): string | null;
}
export interface AutocompleteProvider {
    /**
     * Get autocomplete suggestions for current text/cursor position. Expensive providers SHOULD stop when `signal` aborts.
     * Slow providers MAY report interim suggestions through `onPartial` before resolving; the resolved value supersedes them.
     */
    getSuggestions(lines: string[], cursorLine: number, cursorCol: number, signal?: AbortSignal, onPartial?: (suggestions: {
        items: AutocompleteItem[];
        prefix: string;
    }) => void): Promise<{
        items: AutocompleteItem[];
        prefix: string;
    } | null>;
    /** Apply the selected item and return new text + cursor position */
    applyCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string): {
        lines: string[];
        cursorLine: number;
        cursorCol: number;
        onApplied?: () => void;
    };
    /** Get inline hint text to show as dim ghost text after the cursor */
    getInlineHint?(lines: string[], cursorLine: number, cursorCol: number): string | null;
    /** Synchronously try to complete a slash command at the start of a line (no async I/O). */
    /** Returns matched items and the full prefix, or null if not applicable. */
    trySyncSlashCompletion?(textBeforeCursor: string): {
        items: AutocompleteItem[];
        prefix: string;
    } | null;
    /**
     * Synchronously try to expand text immediately before the cursor (no async I/O).
     * Called after every single-character insert. Implementations MUST cheaply
     * early-return when the trailing context cannot trigger them.
     * Returns the number of characters to delete immediately before the cursor
     * and the literal string to insert in their place, or null to leave the
     * buffer untouched.
     */
    trySyncInlineReplace?(textBeforeCursor: string): {
        replaceLen: number;
        insert: string;
    } | null;
    /**
     * Force file-path completion (called on Tab). Returns matched items plus the
     * full prefix, or null when no path token sits before the cursor. Present on
     * file-aware providers; absent on slash-only ones.
     * Expensive providers SHOULD stop when `signal` aborts.
     */
    getForceFileSuggestions?(lines: string[], cursorLine: number, cursorCol: number, signal?: AbortSignal): Promise<{
        items: AutocompleteItem[];
        prefix: string;
    } | null>;
    /** Whether a Tab press should attempt file completion at the cursor. */
    shouldTriggerFileCompletion?(lines: string[], cursorLine: number, cursorCol: number): boolean;
}
type CommandEntry = SlashCommand | AutocompleteItem;
/** Optional behaviors for {@link CombinedAutocompleteProvider}. */
export interface CombinedAutocompleteOptions {
    /** Usage count per command name; higher counts rank earlier among equal text-match scores. */
    commandUsage?: (name: string) => number;
}
export declare function scoreCommandTextMatch(lowerPrefix: string, lowerTarget: string): number;
export declare const SKILL_NAMESPACE = "skill:";
/**
 * Whether a mid-prompt slash token (`prose … /tok`) is skill-shaped enough to
 * surface `name` in the skill popup. Deliberately stricter than submitted
 * slash-command matching: a stray `/word` in running prose must not keep the
 * popup alive through fuzzy name/description hits, so a token only matches as
 * - a prefix of the `skill:` namespace (incl. the bare `/` entry point),
 * - an explicit `skill:…` query (full fuzzy name/description search), or
 * - a prefix at the start of the skill bare name or one of its hyphen-delimited
 *   segments (`/hum` → `skill:humanizer`, `/last` → `skill:research-last30days`).
 * Anything else yields no items, letting the caller fall through to path
 * completion or close the popup. Shared with the editor's accept-time
 * staleness guard so Tab/Enter never accepts a skill the refreshed popup
 * would no longer show.
 */
export declare function midPromptSkillTokenMatches(lowerToken: string, name: string, description?: string): boolean;
export declare class CombinedAutocompleteProvider implements AutocompleteProvider {
    #private;
    constructor(commands?: CommandEntry[], basePath?: string, options?: CombinedAutocompleteOptions);
    getSuggestions(lines: string[], cursorLine: number, cursorCol: number, signal?: AbortSignal, onPartial?: (suggestions: {
        items: AutocompleteItem[];
        prefix: string;
    }) => void): Promise<{
        items: AutocompleteItem[];
        prefix: string;
    } | null>;
    applyCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string): {
        lines: string[];
        cursorLine: number;
        cursorCol: number;
    };
    invalidateDirCache(dir?: string): void;
    getForceFileSuggestions(lines: string[], cursorLine: number, cursorCol: number, signal?: AbortSignal): Promise<{
        items: AutocompleteItem[];
        prefix: string;
    } | null>;
    shouldTriggerFileCompletion(lines: string[], cursorLine: number, cursorCol: number): boolean;
    /** Get inline hint text for slash commands with subcommand hints */
    getInlineHint(lines: string[], cursorLine: number, cursorCol: number): string | null;
    trySyncSlashCompletion(textBeforeCursor: string): {
        items: AutocompleteItem[];
        prefix: string;
    } | null;
}
export {};
