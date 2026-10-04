import type { AgentToolResult, SpeculativeAuthorization, SpeculativeCommitContext, SpeculativeCommitDecision, SpeculativeDiscardContext, SpeculativeExecutionHost, SpeculativeLaunchContext, SpeculativeOperationContext, SpeculativeToolExecutionConfig } from "@oh-my-pi/pi-agent-core";
import type { Settings } from "../config/settings.js";
import type { ToolSession } from "../tools/index.js";
export interface SpeculationLifecycle {
    hasHandlers(eventType: string): boolean;
}
export type CodingAgentSpeculativeOperation = "direct.read" | "eval.read";
/**
 * Session-scoped policy boundary for validated local reads.
 *
 * Ordinary approval and extension lifecycle hooks remain authoritative. Every
 * other effect, including writes, completions, and remote GETs, fails closed.
 */
export declare class CodingAgentSpeculativeExecutionHost implements SpeculativeExecutionHost {
    #private;
    private readonly settings;
    private readonly toolSession;
    private readonly extensionRunner;
    constructor(settings: Settings, toolSession: ToolSession, extensionRunner: SpeculationLifecycle);
    authorize(context: SpeculativeOperationContext): Promise<SpeculativeAuthorization>;
    /**
     * Stream-session launches (e.g. `task` subagents started from streamed
     * items) pass the same lifecycle and approval gate as reads: work that a
     * handler could block or a user must approve never starts early.
     */
    authorizeLaunch(context: SpeculativeLaunchContext): SpeculativeAuthorization;
    /**
     * Capture content evidence immediately before speculative execution.
     *
     * The coordinator invokes this after admission gates pass and — for deferred
     * candidates — after `beforeToolCall` runs, so content inspection never
     * precedes a hook that may block the call. Returns false (veto, discard
     * without executing) when the target fails the content gates. Reuses stored
     * evidence when the same candidate captures twice.
     */
    captureEvidence(context: SpeculativeOperationContext): Promise<boolean>;
    validate(context: SpeculativeCommitContext): Promise<boolean>;
    commit(context: SpeculativeCommitContext, commitDefault: () => Promise<AgentToolResult<unknown>>): Promise<SpeculativeCommitDecision>;
    discard(context: SpeculativeDiscardContext): void;
    close(): void;
}
/**
 * Session-scoped speculative execution config with live settings reads.
 *
 * The Agent captures its config once at construction, so a one-shot
 * `{ enabled: true, maxInFlight: <snapshot> }` object strands mid-session
 * toggles: enabling via the live settings UI would only persist the setting
 * until session recreate, and `maxInFlight` changes would never propagate.
 * Getter-backed fields re-read the current settings on every access (the
 * agent loop checks `enabled` per turn and `maxInFlight` on every drain),
 * while the single shared host preserves accumulated evidence across toggles.
 * The host's own `authorize` re-checks the enabled flag per operation, so a
 * lingering coordinator from before a disable still vetoes new candidates.
 * `task.speculativeLaunch` also keeps the coordinator alive: reads and eval
 * stay gated by `tools.speculativeExecution.enabled`, while the task tool's
 * stream session gates itself on its own flag.
 */
export declare function createSpeculativeToolExecutionConfig(settings: Settings, toolSession: ToolSession, extensionRunner: SpeculationLifecycle): SpeculativeToolExecutionConfig;
