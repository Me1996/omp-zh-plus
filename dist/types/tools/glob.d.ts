import type { GlobToolDetails } from "@oh-my-pi/pi-tui-zh/tools/glob";
import * as fs from "node:fs";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import * as natives from "@oh-my-pi/pi-natives";
import type { ToolSession } from "./index.js";
declare const findSchema: import("@oh-my-pi/omptype").FluentType<{
    gitignore?: boolean | undefined;
    hidden?: boolean | undefined;
    limit?: number | undefined;
    path?: string | undefined;
}, {
    gitignore?: boolean | undefined;
    hidden?: boolean | undefined;
    limit?: number | undefined;
    path?: string | undefined;
}>;
export type GlobToolInput = typeof findSchema.infer;
/**
 * Pluggable operations for the find tool.
 * Override these to delegate file search to remote systems (e.g., SSH).
 */
export interface GlobOperations {
    /** Check if path exists */
    exists: (absolutePath: string) => Promise<boolean> | boolean;
    /** Optional stat for distinguishing files vs directories. */
    stat?: (absolutePath: string) => Promise<{
        isFile(): boolean;
        isDirectory(): boolean;
    }> | {
        isFile(): boolean;
        isDirectory(): boolean;
    };
    /** Find files matching glob pattern. Returns relative paths. */
    glob: (pattern: string, cwd: string, options: {
        ignore: string[];
        limit: number;
    }) => Promise<string[]> | string[];
}
export interface GlobToolOptions {
    /** Custom operations for find. Default: local filesystem + rg */
    operations?: GlobOperations;
    /** Remap slash-only paths to the session cwd before root-search validation. */
    rootPathAlias?: boolean;
    /** Native glob binding. Override only in tests. */
    nativeGlob?: typeof natives.glob;
    /** Filesystem stat used before native scans. Override only in tests. */
    stat?: typeof fs.promises.stat;
    /** Native and user-facing scan timeout. Override only in tests. */
    timeoutMs?: number;
}
export declare class GlobTool implements AgentTool<typeof findSchema, GlobToolDetails> {
    #private;
    private readonly session;
    readonly name = "glob";
    readonly approval: "read";
    readonly loadMode = "essential";
    readonly label = "Glob";
    get description(): string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        gitignore?: boolean | undefined;
        hidden?: boolean | undefined;
        limit?: number | undefined;
        path?: string | undefined;
    }, {
        gitignore?: boolean | undefined;
        hidden?: boolean | undefined;
        limit?: number | undefined;
        path?: string | undefined;
    }>;
    readonly strict = true;
    constructor(session: ToolSession, options?: GlobToolOptions);
    execute(_toolCallId: string, params: typeof findSchema.infer, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<GlobToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<GlobToolDetails>>;
}
export {};
