import type { ReadToolDetails } from "@oh-my-pi/pi-tui-zh/tools/read";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, SpeculativePhysicalOutcome, ToolSpeculationAssessment, ToolSpeculationCommitContext, ToolSpeculationDiscardContext, ToolSpeculationExecutionContext, ToolTier } from "@oh-my-pi/pi-agent-core";
import { completeSimple } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "../sdk.js";
/** Largest file buffered whole for the local read path and speculative snapshots. */
export declare const SNAPSHOT_MAX_BYTES: number;
/**
 * Peel `?q=<question>` (ask a vision model about an image) from a plain path or a URL whose
 * scheme declares {@link SchemeSpec.imageQuestion}; every other URL owns its query string.
 */
export declare function splitImageQuestionTarget(readPath: string): {
    path: string;
    question?: string;
};
declare const readSchema: import("@oh-my-pi/omptype").FluentType<{
    path: string;
}, {
    path: string;
}>;
export type ReadToolInput = typeof readSchema.infer;
type ReadParams = ReadToolInput;
export type SpeculativeReadTargetFailure = "local read path is unavailable" | "local read target is unsafe";
/**
 * Resolve a speculative local-read target and validate it against the workspace.
 *
 * Shared by host authorization and speculative execution so both bind the same
 * target: assessment is metadata-only and the authorize-to-execute window admits
 * a symlink swap, so execution must re-resolve and re-validate before reading.
 * Anything else fails into ordinary execution, never commit. Resolution failures
 * report unavailable; containment/file/size failures report unsafe (reason
 * strings pinned by speculative-host tests).
 */
export declare function resolveSpeculativeReadTarget(cwd: string, lexicalPath: string): Promise<{
    ok: true;
    resolved: string;
} | {
    ok: false;
    reason: SpeculativeReadTargetFailure;
}>;
export interface LocalReadSpeculationEvidence {
    kind: "local_read";
    resource: string;
    snapshotDigest: string;
}
/**
 * Read tool implementation.
 *
 * Reads files with support for images, converted documents (via markit), and text.
 * Directories return a formatted listing with modification times.
 */
export declare class ReadTool implements AgentTool<typeof readSchema, ReadToolDetails> {
    #private;
    private readonly session;
    private readonly completeImageRequest;
    readonly name = "read";
    readonly readsSkillUris = true;
    readonly approval: (args: unknown) => ToolTier;
    readonly label = "Read";
    readonly loadMode = "essential";
    /** Rendered per access so the hashline guidance follows a live `edit.mode` change. */
    get description(): string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        path: string;
    }, {
        path: string;
    }>;
    readonly strict = true;
    readonly speculation: {
        finalized: {
            assess: ({ args }: {
                args: Readonly<Record<string, unknown>>;
            }) => Promise<ToolSpeculationAssessment>;
            execute: (context: ToolSpeculationExecutionContext, signal: AbortSignal) => Promise<SpeculativePhysicalOutcome>;
            commit: (context: ToolSpeculationCommitContext, outcome: SpeculativePhysicalOutcome) => Promise<AgentToolResult<unknown, unknown>>;
            discard: (context: ToolSpeculationDiscardContext) => void;
        };
    };
    constructor(session: ToolSession, completeImageRequest?: typeof completeSimple);
    execute(toolCallId: string, params: ReadParams, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<ReadToolDetails>, toolContext?: AgentToolContext): Promise<AgentToolResult<ReadToolDetails>>;
}
export {};
