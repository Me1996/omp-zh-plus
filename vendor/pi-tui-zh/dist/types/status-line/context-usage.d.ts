import type { AgentMessage, Tokenizer } from "@oh-my-pi/pi-agent-core";
import type { CompactionSettings } from "@oh-my-pi/pi-agent-core/compaction";
import type { Tool as AiTool, Model } from "@oh-my-pi/pi-ai";
import type { Theme } from "../theme/index.js";
import { Container } from "../tui.js";
import type { TspText } from "@oh-my-pi/pi-wire";
import type { DescribeContext, NativeNode } from "../native/node.js";
interface ContextSkill {
    readonly name: string;
    readonly description?: string;
    readonly hide?: boolean;
}
type ContextTool = Pick<AiTool, "name" | "description" | "parameters" | "examples">;
/** Savings computed by the host's inline-image planner, not by the renderer. */
export interface ContextSavingsEstimate {
    visionCapable: boolean;
    systemPrompt?: {
        applied: boolean;
        reason?: "empty" | "margin" | "budget";
        textTokens: number;
        frames: number;
        imageTokens: number;
        savedTokens: number;
        scope: "agents-md" | "all";
    };
    toolResults?: {
        total: number;
        swapped: number;
        textTokens: number;
        frames: number;
        imageTokens: number;
        savedTokens: number;
    };
    savedTokens: number;
}
/** Real sessions satisfy this view without wrapping or copying their state. */
export interface ContextUsageSession extends NonMessageTokenSource {
    readonly model: Model | undefined;
    readonly agent: {
        readonly tokenizer: Tokenizer;
        readonly state?: {
            readonly tools?: readonly ContextTool[];
        };
    };
    readonly messages?: AgentMessage[];
    getContextBreakdown?(): {
        messagesTokens: number;
        skillsTokens: number;
        systemToolsTokens: number;
        systemContextTokens: number;
        systemPromptTokens: number;
        usedTokens: number;
    } | undefined;
}
export interface ContextUsageOptions {
    compaction: CompactionSettings;
    sourceRevision?: number;
    skillful?: boolean;
    snapcompact?: ContextSavingsEstimate;
}
type CategoryId = "systemPrompt" | "systemContext" | "systemTools" | "skills" | "messages";
interface CategoryInfo {
    id: CategoryId;
    label: string;
    tokens: number;
    color: "accent" | "warning" | "success" | "userMessageText" | "customMessageLabel";
    glyph: string;
}
export interface ContextBreakdown {
    model: Model | undefined;
    contextWindow: number;
    categories: CategoryInfo[];
    usedTokens: number;
    autoCompactBufferTokens: number;
    freeTokens: number;
    /** Where auto-compaction fires, in tokens; undefined when compaction is off. */
    thresholdTokens?: number;
    /** Estimated snapcompact wire savings; set when requested and a snapcompact.* setting is enabled. */
    snapcompact?: ContextSavingsEstimate;
}
/** Percent positions (0–100 of the context window) for the auto-compaction boundaries. */
export interface CompactionBoundaries {
    /** Where auto-compaction fires. */
    thresholdPercent: number;
    /**
     * Where the background speculative summarizer starts (threshold − lead), or
     * `null` when no speculation will run (async compaction disabled, or the
     * first available method is local — snapcompact/shake — and thus instant).
     */
    speculationPercent: number | null;
}
/**
 * Boundary positions for the status line's annotated context gauge. `null`
 * when compaction is disabled/off or the window is unknown — the gauge then
 * renders without markers. The host supplies a lead only when its configured
 * method and async policy allow speculative compaction.
 */
export declare function computeCompactionBoundaries(compactionSettings: CompactionSettings, contextWindow: number, speculationLeadTokens?: number): CompactionBoundaries | null;
/** Stable inputs used to cache non-message token estimates. */
export interface NonMessageTokenSource {
    readonly systemPrompt?: readonly string[];
    readonly agent?: {
        readonly state?: {
            readonly tools?: readonly ContextTool[];
        };
    };
    readonly skills?: readonly ContextSkill[];
    /** Provider-facing, session-frozen descriptions when available. */
    readonly renderedSkills?: readonly ContextSkill[];
}
/** Shared empty system-prompt part list, avoiding an allocation per render. */
export declare const EMPTY_STRING_PARTS: string[];
export declare function estimateSkillsTokens(skills: readonly ContextSkill[], tokenizer: Tokenizer): number;
type ToolSchemaSource = readonly ContextTool[];
/**
 * Current dynamic metadata revision for one tool roster.
 *
 * Consumers caching a larger context breakdown must key on both the tools
 * array identity and this revision. Array replacement covers roster changes;
 * {@link invalidateToolSchemaMetadata} covers live description/schema changes
 * while the roster object remains stable.
 */
export declare function getToolSchemaMetadataRevision(tools: ToolSchemaSource): number;
/**
 * Invalidate token estimates after a live tool description or parameter schema
 * can change without replacing the tools array (settings, model, policy, or
 * discovered-agent metadata changes).
 */
export declare function invalidateToolSchemaMetadata(tools: ToolSchemaSource): void;
/**
 * Estimate provider-visible tool-schema tokens.
 *
 * Results are cached by roster-array identity, tokenizer identity, the
 * caller-supplied settings/source revision, and the roster's explicit dynamic
 * metadata revision. Callers whose descriptions or schemas are live getters
 * must either advance `sourceRevision` or call
 * {@link invalidateToolSchemaMetadata} when those inputs change.
 */
export declare function estimateToolSchemaTokens(tools: ToolSchemaSource, tokenizer: Tokenizer, sourceRevision?: number): number;
export declare function computeNonMessageTokens(session: NonMessageTokenSource, tokenizer: Tokenizer, sourceRevision?: number): number;
/**
 * Shared helper for the four non-message token totals used by
 * `computeContextBreakdown` (/context panel). Keep this category split stable:
 * the status-line fast path intentionally uses the equivalent collapsed total
 * in `computeNonMessageTokens`.
 */
export declare function computeNonMessageBreakdown(session: NonMessageTokenSource, tokenizer: Tokenizer, sourceRevision?: number, skillful?: boolean): {
    skillsTokens: number;
    toolsTokens: number;
    systemContextTokens: number;
    systemPromptTokens: number;
};
/**
 * Compute a breakdown of estimated context usage by category for the active
 * session and model.
 */
export declare function computeContextBreakdown(session: ContextUsageSession, options: ContextUsageOptions): ContextBreakdown;
/** The `/context` title: the model and its window once a model is selected. */
export declare function contextUsageHead(breakdown: ContextBreakdown): TspText;
/**
 * Native context-usage panel for terminals without `meter`: the cell grid as
 * unwrapped styled rows beside the legend. The terminal places the legend
 * beside the grid, or below it when narrow.
 */
export declare function describeContextUsage(breakdown: ContextBreakdown): NativeNode;
/**
 * The `/context` report body, without a frame or title of its own (the panel
 * showing it is titled {@link contextUsageHead}): ANSI renders the cell grid
 * beside the legend; natively it is drawn with `meter`s where the terminal has
 * them and as the glyph grid otherwise.
 */
export declare class ContextUsageView extends Container {
    #private;
    constructor(breakdown: ContextBreakdown, theme: Theme);
    describe(cx: DescribeContext): NativeNode;
}
/**
 * Render a colorful context-usage panel as ANSI text. Output is a series of
 * lines pairing the grid (left) with the legend (right).
 */
export declare function renderContextUsage(breakdown: ContextBreakdown, theme: Theme): string;
export {};
