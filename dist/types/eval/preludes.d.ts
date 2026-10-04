import type { AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApproval } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../tools/index.js";
/** Host context supplied when an eval prelude calls back out of its language VM. */
export interface EvalPreludeContext {
    /** Live owning session; authorization is always resolved against its current preludes. */
    session: ToolSession;
    /** Tool-call-shaped identifier assigned to this individual host invocation. */
    toolCallId: string;
    /** Cancellation signal for the active eval cell. */
    signal?: AbortSignal;
    /** Ordinary agent tool context used for settings, UI, and provider metadata. */
    context?: AgentToolContext;
    /** Progress receiver shared with the active eval call. */
    onUpdate?: AgentToolUpdateCallback<unknown>;
}
/**
 * A language prelude whose snippets run in eval VMs while its privileged handler
 * remains in the host process. Prelude definitions are capabilities, not tools:
 * they have no parameter schema, renderer, label, or load mode and never enter a
 * model tool inventory.
 */
export interface EvalPreludeDefinition {
    /** Stable bridge name and registration key. */
    name: string;
    /** Static Markdown documentation shown only while this prelude is enabled. */
    documentation: string;
    /** JavaScript source installed into an ordinary JavaScript eval realm. */
    javascript: string;
    /** Python source installed into a Python eval kernel. */
    python: string;
    /** Globals owned by the snippets and removed when the prelude is replaced or disabled. */
    exports: readonly string[];
    /**
     * Model-facing policy appended as its own system-prompt block while this
     * prelude is advertised. Replayed by the hidden prelude notice when enabled
     * mid-session, since the cached system prompt is not rebuilt for the toggle.
     */
    guidance?: string;
    /** Optional declarations appended to code-mode TypeScript context while enabled. */
    codeModeDeclarations?: string;
    /** Approval tier or argument-dependent approval decision for host calls. */
    approval?: ToolApproval;
    /** Live availability predicate. Omission means enabled. */
    enabled?: () => boolean;
    /** Execute a host call outside the language VM. */
    invoke(parameters: unknown, context: EvalPreludeContext): Promise<AgentToolResult<unknown>>;
    /**
     * One-line description of a successful host call for the eval status tree
     * (`main.goto("https://…")`). `undefined` records nothing; omit the hook
     * when the call has nothing worth showing. Failures are recorded by the
     * bridge regardless.
     */
    status?(parameters: unknown, result: AgentToolResult<unknown>): string | undefined;
}
/**
 * Resolve enabled candidates without consulting a session getter (and therefore
 * without recursion). Later definitions replace earlier definitions of the same
 * name, matching extension tool registration precedence.
 */
export declare function getEnabledEvalPreludes(definitions: readonly EvalPreludeDefinition[]): EvalPreludeDefinition[];
/** First documentation line, advertised as the prelude's one-line summary; undefined when undocumented. */
export declare function evalPreludeSummary(definition: Pick<EvalPreludeDefinition, "documentation">): string | undefined;
/** Resolve a prelude from the session's live enabled set. Captured stale VM functions therefore fail closed. */
export declare function findEnabledEvalPrelude(session: ToolSession, name: string): EvalPreludeDefinition | undefined;
/**
 * Invoke a prelude through the live session registry. Authorization is resolved
 * before the handler runs and repeated when an awaited approval raced with a
 * replacement, so a disabled or replaced captured function cannot retain host
 * access under stale policy.
 */
export declare function invokeEvalPrelude(name: string, parameters: unknown, context: EvalPreludeContext): Promise<AgentToolResult<unknown>>;
