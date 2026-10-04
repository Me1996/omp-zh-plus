import type { GrepToolDetails } from "@oh-my-pi/pi-tui-zh/tools/grep";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolTier } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
declare const searchSchema: import("@oh-my-pi/omptype").FluentType<{
    case?: boolean | undefined;
    gitignore?: boolean | undefined;
    path?: string | undefined;
    pattern: string;
    skip?: number | null | undefined;
}, {
    case?: boolean | undefined;
    gitignore?: boolean | undefined;
    path?: string | undefined;
    pattern: string;
    skip?: number | null | undefined;
}>;
export type GrepToolInput = typeof searchSchema.infer;
/** Maximum number of distinct files surfaced in a single response. The
 * agent paginates further pages via `skip`. */
export declare const DEFAULT_FILE_LIMIT = 20;
/** Per-file match cap for multi-file searches — keeps a single hot file
 * from crowding out diverse hits. Applied in JS after grep returns. */
export declare const MULTI_FILE_PER_FILE_MATCHES = 20;
/** Per-file match cap for single-file searches — there's no diversity
 * concern when the scope is one file. */
export declare const SINGLE_FILE_MATCHES = 200;
type SearchParams = typeof searchSchema.infer;
/**
 * Construction-time overrides for callers that are not the model.
 *
 * The model-facing schema deliberately does not grow these: Cursor's native
 * grep frames carry context widths and match caps that the shared tool cannot
 * accept per call. Unset means "use session settings / built-in caps" for
 * ordinary model-issued calls.
 */
export interface GrepToolOptions {
    /** Overrides both context widths unless the corresponding direction is also supplied. */
    context?: number;
    /** Overrides the number of lines before each match. */
    contextBefore?: number;
    /** Overrides the number of lines after each match. */
    contextAfter?: number;
    /** Caps total surfaced matches. Applied on top of the built-in per-file and file-window caps, never above them. */
    totalMatchLimit?: number;
}
export declare class GrepTool implements AgentTool<typeof searchSchema, GrepToolDetails> {
    #private;
    private readonly session;
    readonly name = "grep";
    readonly approval: (args: unknown) => ToolTier;
    readonly label = "Grep";
    readonly loadMode = "discoverable";
    readonly summary = "Search file contents by regex";
    get description(): string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        case?: boolean | undefined;
        gitignore?: boolean | undefined;
        path?: string | undefined;
        pattern: string;
        skip?: number | null | undefined;
    }, {
        case?: boolean | undefined;
        gitignore?: boolean | undefined;
        path?: string | undefined;
        pattern: string;
        skip?: number | null | undefined;
    }>;
    readonly strict = true;
    constructor(session: ToolSession, options?: GrepToolOptions);
    execute(_toolCallId: string, params: SearchParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<GrepToolDetails>, _toolContext?: AgentToolContext): Promise<AgentToolResult<GrepToolDetails>>;
}
export {};
