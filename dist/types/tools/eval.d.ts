import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolSpeculationPolicy } from "@oh-my-pi/pi-agent-core";
import type { ToolExample } from "@oh-my-pi/pi-ai";
import { type EvalPreludeDefinition } from "../eval/preludes.js";
import type { EvalToolDetails } from "@oh-my-pi/pi-tui-zh/tools/eval";
import type { ToolSession } from "./index.js";
/** Language tokens the eval tool accepts, in stable display order. */
export type EvalLanguageToken = "py" | "js";
/**
 * Per-call input: a single cell. State persists within a language across
 * separate eval calls and across tool calls, so each call is one logical step
 * and later calls reuse what earlier ones defined. This static schema carries
 * the full language union for typing; {@link buildEvalSchema} narrows the wire
 * copy per session so disabled backends are never advertised to the model.
 */
export declare const evalSchema: import("@oh-my-pi/omptype").FluentType<{
    code: string;
    language: "js" | "py";
    reset?: boolean | undefined;
    timeout?: number | undefined;
    title?: string | undefined;
}, {
    code: string;
    language: "js" | "py";
    reset?: boolean | undefined;
    timeout?: number | undefined;
    title?: string | undefined;
}>;
export type EvalToolParams = typeof evalSchema.infer;
export type EvalCellInput = EvalToolParams;
export type EvalToolResult = {
    content: Array<{
        type: "text";
        text: string;
    }>;
    details: EvalToolDetails | undefined;
};
export type EvalProxyExecutor = (params: EvalToolParams, signal?: AbortSignal) => Promise<EvalToolResult>;
export interface EvalToolDescriptionOptions {
    py?: boolean;
    js?: boolean;
    /**
     * Parent spawn policy (`getSessionSpawns`). `true`/omitted means unrestricted,
     * `false`/`""` hides `agent()`, and a comma list drives the advertised default.
     */
    spawns?: boolean | string | null;
    /** Advertise auto-backgrounding of long-running cells in the tool prompt. */
    autoBackgroundEnabled?: boolean;
    /** Advertise `@tool` / `tool(fn)` and the `tools` spawn option (`eval.tools.enabled`). */
    evalTools?: boolean;
    /** Push `workpool()` as the default for independent items (model delegation bias `eager`). Default: true. */
    eagerDelegation?: boolean;
    /** Point blocked callers at the `wait` tool; false when the session lacks it (subagents). Default: true. */
    waitTool?: boolean;
    /** Enabled preludes; each becomes an `xd://eval/<name>` doc topic. */
    preludes?: readonly Pick<EvalPreludeDefinition, "name" | "documentation">[];
    /**
     * Inline every doc topic instead of linking `xd://eval/<topic>`. Required
     * when the session cannot `read` (the only transport for topic docs).
     */
    inlineTopics?: boolean;
    /** Whether missing runtimes and environments may be provisioned automatically. */
    autoProvision?: boolean;
}
/**
 * On-demand eval docs (`topic → markdown`) served at `xd://eval/<topic>`:
 * `judge` (including completion), `helpers`, `agents` (when spawning is allowed),
 * and one per enabled prelude.
 */
export declare function getEvalDocTopics(options?: EvalToolDescriptionOptions): Record<string, string>;
/** Model-facing eval description: core kernel surface plus one pointer per doc topic. */
export declare function getEvalToolDescription(options?: EvalToolDescriptionOptions): string;
export interface EvalToolOptions {
    proxyExecutor?: EvalProxyExecutor;
}
export declare class EvalTool implements AgentTool<typeof evalSchema> {
    #private;
    private readonly session;
    readonly name = "eval";
    readonly approval: "exec";
    readonly formatApprovalDetails: (args: unknown) => string[];
    get summary(): string;
    supportsCodeModeTransport(): boolean;
    readonly loadMode = "essential";
    readonly label = "Eval";
    get description(): string;
    /**
     * `xd://eval/<topic>` docs follow the live prelude set so a prelude announced
     * by the mid-session notice is readable before the description catches up.
     */
    docTopics(): Record<string, string>;
    get examples(): readonly ToolExample<typeof evalSchema.infer>[];
    get parameters(): typeof evalSchema;
    readonly concurrency = "exclusive";
    readonly strict = true;
    readonly intent: (args: Partial<typeof evalSchema.infer>) => string | undefined;
    readonly speculation: ToolSpeculationPolicy;
    constructor(session: ToolSession | null, options?: EvalToolOptions);
    execute(_toolCallId: string, params: typeof evalSchema.infer, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback, ctx?: AgentToolContext): Promise<AgentToolResult<EvalToolDetails | undefined>>;
}
