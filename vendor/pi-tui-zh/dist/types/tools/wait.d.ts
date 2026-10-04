import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import { type OutputMeta } from "./output-meta.js";
import { type ConfiguredThinkingLevel } from "../render/render-utils.js";
import type { StructuredSubagentOutput } from "./task.js";
import type { RenderResultOptions, ToolActivitySummary } from "./renderer.js";
import type { IrcDeliveryReceipt, IrcMessage } from "./irc.js";
import type { NativeToolView, ToolRenderResult } from "./renderer.js";
/** Whether a wait snapshot contains only running jobs and no cancellations. */
export declare function isWaitingPollDetails(details: unknown): boolean;
/** Coordination details retained by wait and background job operations. */
export type CoordinationOp = "send" | "wait" | "jobs" | "cancel";
/** Background-job row surfaced by `wait`/`cancel`/`jobs` results. */
export interface JobSnapshot {
    id: string;
    type: "bash" | "task" | "eval";
    status: "running" | "completed" | "failed" | "cancelled";
    label: string;
    durationMs: number;
    /** Process exit status when the job reports one. */
    exitCode?: number;
    /** Effective task model selector, including an explicit reasoning suffix when configured. */
    resolvedModel?: string;
    /** Provider/id including routing, with no added thinking suffix. */
    resolvedModelIdentity?: string;
    /** Explicit thinking metadata, independent of the model identity. */
    resolvedThinkingLevel?: ConfiguredThinkingLevel;
    /** True when the task progress reports an attached live advisor. */
    advisor?: boolean;
    /** The task agent's latest self-estimated completion (0–100); see `AgentProgress.completionPercent`. */
    completionPercent?: number;
    resultText?: string;
    errorText?: string;
    /** Source-output metadata retained for per-job warnings and persisted row rendering. */
    meta?: OutputMeta;
    /** Capture error in historical snapshots; new snapshots store source metadata in `meta`. */
    artifactError?: OutputMeta["artifactError"];
    structured?: StructuredSubagentOutput;
    /**
     * `agent://<id>` handle backing this job's artifacts — the job-row's
     * registry `agentId` when the manager disambiguated a requested job id
     * on collision, else the job id itself. See {@link AsyncJob.agentId}.
     */
    agentUrlId?: string;
}
/** Outcome of cancelling one background job. */
export type CancelStatus = "cancelled" | "not_found" | "already_completed";
/** Cancellation outcome and its model-facing explanation. */
export interface CancelOutcome {
    id: string;
    status: CancelStatus;
    message: string;
}
/**
 * A live subagent from the AgentRegistry that has no backing job in the
 * AsyncJobManager — e.g. an idle agent woken (or a parked agent revived) via
 * a peer message, or a spawn owned by another agent. Surfaced by background
 * snapshots so the displayed picture matches the UI's running-agent
 * count.
 */
export interface AgentActivitySnapshot {
    id: string;
    parentId?: string;
    /** Latest activity gist recorded by the registry (display-only). */
    activity?: string;
    /** Time since the agent was registered. */
    ageMs: number;
    /**
     * Whether an attached session corroborates the `running` claim. False marks
     * a ref that says `running` with no turn in flight — either a spawn still
     * wiring up or a stale registration that an explicit cancellation clears (#8634).
     */
    live: boolean;
    /**
     * Acceptance time of the agent's final result, when the registry recorded
     * one. With `live: false` this is an accepted run the parent may cancel
     * instead of waiting on (#11079).
     */
    acceptedAt?: number;
}
/** Details shared by messaging receipts and job/wait results. */
export interface CoordinationDetails {
    meta?: OutputMeta;
    op: CoordinationOp;
    from?: string;
    to?: string;
    receipts?: IrcDeliveryReceipt[];
    /** Message consumed by `wait`. */
    waited?: IrcMessage | null;
    jobs?: JobSnapshot[];
    cancelled?: {
        id: string;
        status: CancelStatus;
    }[];
    /** Running subagents not represented by a job row in this result. */
    agents?: AgentActivitySnapshot[];
    /** `wait` was cut short by steering, a peer message, or a completion notice that injects next. */
    interrupted?: boolean;
}
/** Pending wait frame. */
declare function waitRenderCall(_args: object, _options: RenderResultOptions, uiTheme: Theme): Component;
/**
 * Display-only transcript card for live IRC traffic: `irc:incoming` DMs
 * delivered to this session, `irc:autoreply` side-channel replies sent on
 * this session's behalf, and `irc:relay` observations of agent↔agent
 * traffic. Shares the tool renderer's glyph + quote-border conventions so
 * cards and peer-message output look identical in the transcript.
 */
export declare function createIrcMessageCard(card: {
    kind: "incoming" | "autoreply" | "relay" | "workpool";
    from?: string;
    to?: string;
    body?: string;
    replyTo?: string;
    timestamp?: number;
    pool?: string;
    mode?: string;
}, getExpanded: () => boolean, uiTheme: Theme): Component;
/** Render either a received message or a background-job snapshot. */
export declare const waitToolRenderer: {
    inline: true;
    mergeCallAndResult: true;
    activitySummary(): ToolActivitySummary;
    renderCall: typeof waitRenderCall;
    describeCall(): NativeToolView;
    describeResult(result: ToolRenderResult<CoordinationDetails>, options: RenderResultOptions): NativeToolView | undefined;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: CoordinationDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme): Component;
};
export {};
