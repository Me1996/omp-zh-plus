import type { AutocompleteItem } from "@oh-my-pi/pi-tui-zh";
import type { SubcommandDef, TuiSlashCommandRuntime } from "./types.js";
/**
 * Build getArgumentCompletions from declarative subcommand definitions.
 * Returns subcommand names filtered by prefix in the dropdown.
 */
export declare function buildArgumentCompletions(subcommands: SubcommandDef[]): (prefix: string) => AutocompleteItem[] | null;
/**
 * Build getArgumentCompletions for `/effort <level>`. The static `subcommands`
 * list documents the full vocabulary for ACP clients, but the dropdown must
 * offer only what the active model exposes: suggesting a tier the model lacks
 * (e.g. `xhigh` on a model capped at `high`) would make the handler answer the
 * accepted completion with `Unknown thinking level`. Returns null for a model
 * with no reasoning dial — there is nothing to pick.
 */
export declare function buildEffortArgumentCompletions(runtime: TuiSlashCommandRuntime): (argumentPrefix: string) => AutocompleteItem[] | null;
/**
 * Build getInlineHint for `/effort <level>` from the same live list as the
 * dropdown, so the ghost text never completes a tier the active model lacks.
 */
export declare function buildEffortInlineHint(runtime: TuiSlashCommandRuntime): (argumentText: string) => string | null;
/**
 * Build getArgumentCompletions for /mcp. Delegates to the generic
 * declarative subcommand completer while the subcommand name itself is
 * still being typed, then switches to MCP server-name completion (sourced
 * from {@link collectMcpServerNames}) once a recognized server-name
 * subcommand (enable/disable/test/remove/reconnect/reauth/unauth) is
 * followed by a space. `remove` gets its own scope-aware completions (see
 * {@link buildMcpRemoveCompletions}) since — unlike the others —
 * it only ever succeeds against a config-file entry. Subcommands with a
 * different argument shape (add, smithery-search, ...) get no argument
 * completion.
 */
export declare function buildMcpArgumentCompletions(subcommands: SubcommandDef[], runtime: TuiSlashCommandRuntime): (argumentPrefix: string) => Promise<AutocompleteItem[] | null>;
/**
 * Build getInlineHint from declarative subcommand definitions.
 * Shows remaining completion + usage as dim ghost text after cursor.
 */
export declare function buildSubcommandInlineHint(subcommands: SubcommandDef[]): (argumentText: string) => string | null;
/**
 * Build getInlineHint for commands with a simple static hint string.
 * Shows the hint only when no arguments have been typed yet.
 */
export declare function buildStaticInlineHint(hint: string): (argumentText: string) => string | null;
/**
 * Build getArgumentCompletions for `/switch <model>`: configured `@role`
 * aliases first, then the session's cycle scope (or every authenticated
 * model) as `provider/id`, substring-filtered on the typed prefix. Any
 * `:level` suffix already typed is kept out of the match and re-appended.
 * Returning matches also keeps `@smol` from falling through to `@`-file
 * mention completion.
 */
export declare function buildModelSelectorCompletions(runtime: TuiSlashCommandRuntime): (argumentPrefix: string) => AutocompleteItem[] | null;
/**
 * Build getArgumentCompletions that suggests directories relative to the
 * current project directory. Used by /move so users can Tab-complete the
 * destination directory.
 */
export declare function buildDirectoryArgumentCompletions(): (prefix: string) => Promise<AutocompleteItem[] | null>;
