import type { EffectiveExtensionRoots } from "../capability/types.js";
export type SlashCommandSource = "extension" | "prompt" | "skill";
export type SlashCommandLocation = "user" | "project" | "path";
export interface SlashCommandInfo {
    name: string;
    description?: string;
    source: SlashCommandSource;
    location?: SlashCommandLocation;
    path?: string;
}
export type { BuiltinSlashCommand, SubcommandDef } from "../slash-commands/types.js";
/**
 * Represents a custom slash command loaded from a file
 */
export interface FileSlashCommand {
    name: string;
    description: string;
    /** Argument hint from `argument-hint`/`argumentHint` frontmatter, shown as inline ghost text. */
    argumentHint?: string;
    content: string;
    source: string;
    /** Source metadata for display */
    _source?: {
        providerName: string;
        level: "user" | "project" | "native";
    };
}
export interface LoadSlashCommandsOptions {
    /** Working directory for project-local commands. Default: getProjectDir() */
    cwd?: string;
    /** Session-local extension roots for post-startup reloads (explicit + mode + configured). */
    extensionRoots?: EffectiveExtensionRoots;
}
/**
 * Load all custom slash commands using the capability API.
 * Loads from all registered providers (builtin, user, project).
 */
export declare function loadSlashCommands(options?: LoadSlashCommandsOptions): Promise<FileSlashCommand[]>;
/**
 * Expand a slash command if it matches a file-based command.
 * Returns the expanded content or the original text if not a slash command.
 */
export declare function expandSlashCommand(text: string, fileCommands: FileSlashCommand[]): string;
