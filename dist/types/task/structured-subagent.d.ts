import { type CompactionThresholdPair } from "../config/compaction-threshold.js";
import { type ServiceTierInheritSettingValue } from "../config/service-tier.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { TaskEffort } from "@oh-my-pi/pi-tui-zh/thinking";
import type { ToolSession } from "../tools/index.js";
import { type DiscoveryResult } from "./discovery.js";
import { type AgentDefinition } from "./types.js";
import type { AgentProgress, SingleResult, StructuredSubagentOutput, StructuredSubagentSchemaMode, StructuredSubagentSchemaSource } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { WorkPoolYieldItem } from "./workpool-yield.js";
/** Final structured completion metadata returned for a schema-bearing run. */
export type StructuredSubagentSchemaResult = StructuredSubagentOutput;
/** A schema validation or extraction error attached to structured completion metadata. */
export type StructuredSubagentSchemaError = NonNullable<StructuredSubagentOutput["error"]>;
/** A selected schema paired with its source and enforcement mode. */
export interface StructuredSubagentSchemaResolution {
    schema: unknown;
    source: StructuredSubagentSchemaSource;
    mode: StructuredSubagentSchemaMode;
    outputSchemaOverridesAgent: boolean;
}
/** Isolation controls shared by the task and eval surfaces. */
export interface StructuredSubagentIsolationControls {
    requested?: boolean;
    merge?: "patch" | "branch";
    apply?: boolean;
}
/** Identity and presentation metadata supplied by the calling surface. */
export interface StructuredSubagentIdentity {
    /** A previously reserved output/registry id. */
    id?: string;
    /** Stable user-facing label used when allocating a new id. */
    label?: string;
}
/** One normalized child invocation. */
export interface StructuredSubagentRequest {
    session: ToolSession;
    invocationKind: "task" | "eval";
    assignment: string;
    context?: string;
    agent?: string;
    model?: string | string[];
    /** Presence, rather than truthiness, makes this the highest-priority schema. */
    outputSchema?: unknown;
    schemaMode?: StructuredSubagentSchemaMode;
    /** Per-spawn thinking effort mapped onto the resolved model's supported range; overrides the agent's default selector. */
    effort?: TaskEffort;
    /** Caller's description of how open-ended the work is; steers the child's `auto` thinking classification. */
    solutionSpace?: string;
    identity?: StructuredSubagentIdentity;
    index?: number;
    parentToolCallId?: string;
    detached?: boolean;
    invokedAt?: number;
    acquiredAt?: number;
    isolation?: StructuredSubagentIsolationControls;
    /** The parent agent name forbidden from recursively spawning itself. */
    blockedAgent?: string;
    /** Preserve a completed temporary artifacts directory for an agent:// handle. */
    retainArtifacts?: boolean;
    /**
     * Invoked instead of immediate cleanup when a temporary artifacts
     * directory is retained (`retainArtifacts`). Callers that outlive this
     * call — e.g. an async job body — take ownership of the returned
     * disposal closure and MUST eventually run it once the retained handle
     * is no longer needed, or the directory leaks for the process lifetime.
     */
    onArtifactsRetained?: (cleanup: () => Promise<void>) => void;
    /** Task UI agents keep live registry references; eval one-shots normally do not. */
    keepAlive?: boolean;
    /** Task frontends may inherit LSP; eval frontends normally set this false. */
    enableLsp?: boolean;
    /** Explicitly pass false for plan mode or invocation kinds that must not use IRC. */
    enableIrc?: boolean;
    /** `0` disables executor wall-clock timeout. Undefined inherits settings. */
    maxRuntimeMs?: number;
    /** Kernel-defined tools explicitly exposed to this child. */
    customTools?: CustomTool[];
    /** Workpool items accepted by the child yield tool during this turn. */
    workPoolYieldItems?: WorkPoolYieldItem[];
    signal?: AbortSignal;
    onProgress?: (progress: AgentProgress) => void;
}
/** A normalized preflight result, reusable by tests and adapters. */
export interface EffectiveSubagentPolicy {
    discovery: DiscoveryResult;
    agentName: string;
    agent: AgentDefinition;
    effectiveAgent: AgentDefinition;
    modelOverride?: string[];
    /** Explicit pre-expansion model role alias selected for this run. */
    modelRole?: string;
    /** Extension routing note explaining a `before_subagent_spawn` model replacement. */
    modelRoute?: string;
    /** Exact-name `task.agentServiceTierOverrides` entry for this agent, applied after model resolution. */
    serviceTierOverride?: ServiceTierInheritSettingValue;
    /** Exact-name entry normalized to both child compaction threshold fields. */
    compactionThresholdOverride?: CompactionThresholdPair;
    /**
     * Parent model the child falls back to when its own candidates have no
     * working credentials. Absent for an explicit per-call `model` (other than
     * `@default`): a requested model that cannot run fails instead of being
     * replaced by the parent's.
     */
    parentActiveModelPattern?: string;
    /** The selected patterns carry the parent's live effort, which the agent's own `thinking-level` outranks. */
    modelInheritsLiveThinkingLevel?: boolean;
    schema: StructuredSubagentSchemaResolution;
    planMode: boolean;
    isIsolated: boolean;
    mergeMode: "patch" | "branch";
    applyChanges: boolean;
    enableLsp: boolean;
    enableIrc: boolean;
}
/** Settled child execution plus data needed by the frontends' own rendering. */
export interface StructuredSubagentResult {
    result: SingleResult;
    policy: EffectiveSubagentPolicy;
    mergeSummary: string;
    changesApplied: boolean | null;
    artifactsDir: string;
    temporaryArtifacts: boolean;
}
/** Machine-readable failure category so adapters can retain their native errors. */
export declare class StructuredSubagentError extends Error {
    readonly kind: "preflight" | "isolation" | "execution";
    /** The child's settled result, when the child finished before a later step failed. */
    readonly result?: SingleResult;
    constructor(kind: "preflight" | "isolation" | "execution", message: string, options?: ErrorOptions & {
        result?: SingleResult;
    });
}
/**
 * Reason a per-spawn `model` selector cannot mean anything useful, or
 * `undefined` when it is usable. The literal `"default"` (with or without a
 * `:level` suffix) is singled out because it reads as "leave the agent's
 * model alone" while resolving as the `default` role — the ambiguity that got
 * the previous per-call override removed (#6438). `@default` states the
 * inherit intent explicitly.
 * Shared so task, eval `agent()` and `workpool()` reject malformed input
 * identically before dispatch.
 */
export declare function invalidModelSelectorReason(model: unknown, label: string): string | undefined;
/**
 * Resolve every policy shared by task and eval before allocating artifacts or
 * dispatching work. Callers translate {@link StructuredSubagentError} into
 * their own wire-level error surface.
 */
export declare function resolveEffectiveSubagentPolicy(request: StructuredSubagentRequest): Promise<EffectiveSubagentPolicy>;
/** Reserve a session-global agent id only after preflight has succeeded. */
export declare function reserveStructuredSubagentId(session: ToolSession, identity: StructuredSubagentIdentity | undefined): Promise<string>;
/**
 * Execute a validated subagent. Preflight errors occur before any artifact
 * lease or child dispatch; callers keep responsibility for their result text.
 */
export declare function runStructuredSubagent(request: StructuredSubagentRequest): Promise<StructuredSubagentResult>;
/** Build the recovery suffix used by adapters after an isolated failure. */
export declare function buildStructuredSubagentRecoveryHint(result: SingleResult, artifactsDir: string): Promise<string>;
