/**
 * Tool approval resolution.
 *
 * Approval policy is declared by each tool. This module only knows how to:
 * - normalize user `tools.approval.<tool>: allow | deny | prompt` overrides,
 * - compare a tool capability tier against the active approval mode,
 * - format the generic approval prompt body.
 */
import type { AgentTool, ToolApprovalDecision, ToolTier } from "@oh-my-pi/pi-agent-core";
import type { Settings } from "../config/settings.js";
export type { ToolApproval, ToolApprovalDecision, ToolTier } from "@oh-my-pi/pi-agent-core";
export type ApprovalPolicy = "allow" | "deny" | "prompt";
export type ApprovalMode = "always-ask" | "write" | "yolo";
/** The slice of `AgentToolContext` that approval resolution actually reads. */
export type ApprovalContextSource = {
    autoApprove?: boolean;
    settings?: Settings;
};
export interface ResolvedExecuteTimeApproval {
    approvalMode: ApprovalMode;
    userPolicies: Record<string, unknown>;
}
type ApprovalSubject = Pick<AgentTool, "name" | "approval" | "formatApprovalDetails"> & {
    /**
     * Previous public name of this tool, when a rename changed how it mints.
     * MCP tools minted before digits were kept carry their digit-stripped name
     * here so user `deny`/`prompt` policies written against it still apply
     * (`allow` is deliberately not inherited — see resolveApproval).
     */
    readonly legacyName?: string;
};
/**
 * Resolve approval mode and per-tool user policies from the execute-time
 * `AgentToolContext`.
 *
 * Missing context (or context with no settings and no `--auto-approve`) is
 * fail-closed: `always-ask` with an empty policy map — no user grant. When
 * settings are present, the configured `tools.approvalMode` is used (schema
 * default remains `yolo`). `--auto-approve` still forces `yolo`.
 *
 * Shared by `ExtensionToolWrapper.execute`, `refuseByWritePolicy`,
 * `mcpApprovalPreflight`, and eval prelude host calls so those sites cannot
 * drift. `ExtensionToolWrapper.execute` still inherits the runner's session
 * settings when the caller omits context, so a live session keeps its
 * configured (schema-default `yolo`) grant.
 */
export declare function resolveApprovalFromContext(context?: ApprovalContextSource | null): ResolvedExecuteTimeApproval;
export interface ResolvedApproval {
    policy: ApprovalPolicy;
    tier: ToolTier;
    reason?: string;
    override: boolean;
    source?: "tool" | "user" | "mode";
    /** User-policy key that produced `source: "user"` (defaults to the tool name). */
    policyKey?: string;
}
/** Ordering of capability tiers, least to most privileged. */
export declare const TIER_RANK: Readonly<Record<ToolTier, number>>;
/**
 * Fold the per-target decisions of a multi-target write tool (`edit`, `ast_edit`): the first
 * `policy: "deny"` decision wins with its reason (a read-only URL target); otherwise the highest
 * tier, starting from "read".
 */
export declare function strictestApproval(decisions: Iterable<ToolApprovalDecision>): ToolApprovalDecision;
/**
 * Evaluate a tool's own approval declaration against `args` and return the
 * resulting capability tier, defaulting to `exec` when the tool omits an
 * approval. Unlike reading `tool.approval` directly, this runs function-valued
 * approvals — the write tool's `xd://` gate uses it to take a mounted device's
 * argument-dependent tier instead of falling back to `exec`.
 */
export declare function resolveToolTier(tool: ApprovalSubject, args: unknown): ToolTier;
/**
 * Resolve approval policy for a tool call.
 *
 * Resolution order:
 *  1. Tool `approval(args)` decision, defaulting to tier "exec" when omitted.
 *     A decision may carry a `policyKey` — `tools.approval.<policyKey>` is then
 *     the user override consulted instead of `tools.approval.<tool.name>`, with
 *     the invoking tool's own policy as the fallback when the user set none for
 *     the keyed sub-tool (e.g. an `xd://` device dispatch without a device
 *     policy still honors `tools.approval.write`).
 *  2. User per-tool override, if set and valid.
 *  3. Active mode tier comparison.
 *
 * In yolo mode, override-based tool prompts are ignored; user `tools.approval`
 * settings remain authoritative.
 */
export declare function resolveApproval(tool: ApprovalSubject, args: unknown, mode: ApprovalMode, userConfig?: Record<string, unknown>): ResolvedApproval;
/**
 * Error for a resolved deny. Distinguishes tool-owned policy from user config.
 */
export declare function denyError(resolved: ResolvedApproval, toolName: string): Error;
/**
 * Check if a tool call requires user approval.
 *
 * @throws Error if policy is 'deny'
 * @returns Object with required flag and optional reason for the prompt
 */
export declare function requiresApproval(tool: ApprovalSubject, args: unknown, mode: ApprovalMode, userConfig?: Record<string, unknown>): {
    required: boolean;
    reason?: string;
};
export declare function truncateForPrompt(value: string, maxChars?: number): string;
/**
 * Format the approval prompt body shown to the user.
 */
export declare function formatApprovalPrompt(tool: ApprovalSubject, args: unknown, reason?: string): string;
