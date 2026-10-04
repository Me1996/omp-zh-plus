import type { TspSpan, TspTone } from "@oh-my-pi/pi-wire";
import type { ThemeColor } from "../theme/theme.js";
import { type AgentRecordLike, type AgentStatus } from "./agent-hub-types.js";
import type { ObservableSession } from "./session-observer-registry.js";
import type { AgentMetrics } from "./agent-hub-projection.js";
export interface RosterRender {
    lines: string[];
    hitRows: Array<number | undefined>;
}
/** Compute the max content width for the current terminal, accounting for chrome. */
export declare function contentWidth(): number;
/** Sanitize a line for TUI display and truncate it to the viewport width. */
export declare function sanitizeLine(text: string, maxWidth?: number): string;
export declare function clampHubLine(line: string, width: number): string;
/** Status glyph, colored per theme status conventions. The title-line counts spell out the words. */
export declare function statusGlyph(status: AgentRecordLike["status"]): string;
/** Native tone for a roster status. */
export declare function statusTone(status: AgentStatus): TspTone;
/** Picker row dot for a roster status. */
export declare function statusDot(status: AgentStatus): TspTone;
/** One-line task summary: the subagent prompt's fixed assignment preamble is not part of the task. */
export declare function taskSummary(task: string): string;
/** Native span of {@link statusGlyph}. */
export declare function statusGlyphSpan(status: AgentStatus): TspSpan;
export declare function statusText(status: AgentRecordLike["status"], text: string): string;
/** Host-resolved model-role label and color. */
export interface AgentRoleDisplay {
    color?: ThemeColor;
    tag?: string;
    name?: string;
}
/** Textual model-role tag; color reinforces (but never replaces) the label. */
export declare function formatRoleBadge(role: string, info: AgentRoleDisplay): string;
/** Native span of {@link formatRoleBadge}. */
export declare function roleBadgeSpan(role: string, info: AgentRoleDisplay): TspSpan;
export declare function modelBadge(ref: AgentRecordLike, observed: ObservableSession | undefined): string | undefined;
/** A picker chip for the model that produced a row's work: label plus thinking-level colour token. */
export interface ModelChip {
    text: string;
    /** Thinking level shown next to the model (`low`), when the model reasons. */
    level?: string;
    /** Theme token of {@link level}. */
    dot?: string;
    fallback: boolean;
}
/** Structured {@link modelBadge} for picker chips. */
export declare function modelChip(ref: AgentRecordLike, observed: ObservableSession | undefined): ModelChip | undefined;
/** Native spans of {@link modelBadge}. */
export declare function modelBadgeSpans(ref: AgentRecordLike, observed: ObservableSession | undefined): TspSpan[] | undefined;
export declare function formatMetricDuration(metrics: AgentMetrics): string | undefined;
export declare function formatCost(cost: number): string;
export declare function formatMetrics(metrics: AgentMetrics): string;
/** Plain-text {@link formatMetrics} for native spans. */
export declare function metricsText(metrics: AgentMetrics): string;
/** Row-grid variant of {@link formatMetrics}: fixed-width cells so every agent's metadata
 * line shares one column layout instead of flowing after wrapped text. Cost is left-aligned
 * so the line starts flush; the numeric cells are right-aligned so units line up. */
export declare function formatMetricColumns(metrics: AgentMetrics, age: string): string;
export declare function contextGauge(tokens: number, window: number): string;
/** Fit a child-id preview without joining an arbitrarily large child set. */
export declare function formatChildIds(children: readonly AgentRecordLike[], width: number): string;
/** Bash `tree`-style branch for an agent's identity row. */
export declare function treeBranch(ref: AgentRecordLike, maxWidth: number, depthById: ReadonlyMap<string, number>, parentById: ReadonlyMap<string, string>, lastSiblingById: ReadonlyMap<string, boolean>): string;
/** Ancestry rails for the task and metrics rows beneath an agent identity. */
export declare function treeContinuation(ref: AgentRecordLike, maxWidth: number, depthById: ReadonlyMap<string, number>, parentById: ReadonlyMap<string, string>, lastSiblingById: ReadonlyMap<string, boolean>): string;
/** One roster-wide origin for metric columns, independent of tree depth. */
export declare function treeMetadataIndent(maxWidth: number, maxDepth: number): number;
/** Right-align `text` inside a fixed-width cell, truncating overflow. */
export declare function alignRightCell(text: string, width: number): string;
