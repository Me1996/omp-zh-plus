/**
 * System prompt construction and project context loading
 */
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import type { ToolExample, TSchema } from "@oh-my-pi/pi-ai";
import type { DelegationBias } from "@oh-my-pi/pi-catalog/compat/delegation";
import type { SkillsSettings } from "./extensibility/settings.js";
import type { Personality } from "./session/settings.js";
import type { EvalPreludeDefinition } from "./eval/preludes.js";
import { SkillDescriptionCatalog } from "./extensibility/skill-descriptions.js";
import { type Skill } from "./extensibility/skills.js";
import type { ActiveRepoContext } from "@oh-my-pi/pi-tui-zh/status-line/host";
import { type WorkspaceTree } from "./workspace-tree.js";
/**
 * Settings the system prompt renders from (`secrets.enabled` via the obfuscator state it
 * reports). A session rebuilds its prompt once per coalesced change of this value, so a bulk
 * settings change rebuilds once. Settings that change the tool set, skills, memory, or workspace
 * roots rebuild through their own reconcile instead.
 */
export declare const cfgSystemPromptInputs: import("./config/registry.js").Derived<import("./config/registry.js").DerivedValues<{
    personality: import("./config/registry.js").Setting<"default" | "friendly" | "none" | "pragmatic", "personality">;
    includeModelInPrompt: import("./config/registry.js").Setting<boolean, "includeModelInPrompt">;
    includeWorkspaceTree: import("./config/registry.js").Setting<boolean, "includeWorkspaceTree">;
    inlineToolDescriptors: import("./config/registry.js").Setting<"auto" | "off" | "on", "inlineToolDescriptors">;
    toolsFormat: import("./config/registry.js").Setting<"anthropic" | "auto" | "deepseek" | "gemini" | "gemma" | "glm" | "harmony" | "hermes" | "kimi" | "minimax" | "native" | "qwen3" | "xml", "tools.format">;
    intentTracing: import("./config/registry.js").Setting<boolean, "tools.intentTracing">;
    xdevDocs: import("./config/registry.js").Setting<"builtins" | "catalog" | "inline", "tools.xdevDocs">;
    xdevInlineDevices: import("./config/registry.js").Setting<string[], "tools.xdevInlineDevices">;
    vaultEnabled: import("./config/registry.js").Setting<boolean, "vault.enabled">;
    renderMermaid: import("./config/registry.js").Setting<boolean, "tui.renderMermaid">;
    reactions: import("./config/registry.js").Setting<boolean, "tui.reactions">;
    asyncEnabled: import("./config/registry.js").Setting<boolean, "async.enabled">;
    bashAutoBackground: import("./config/registry.js").Setting<boolean, "bash.autoBackground.enabled">;
    evalAutoBackground: import("./config/registry.js").Setting<boolean, "eval.autoBackground.enabled">;
    taskEager: import("./config/registry.js").Setting<"always" | "default" | "preferred", "task.eager">;
    taskBatch: import("./config/registry.js").Setting<boolean, "task.batch">;
    ttsrEnabled: import("./config/registry.js").Setting<boolean, "ttsr.enabled">;
    ttsrBuiltinRules: import("./config/registry.js").Setting<boolean, "ttsr.builtinRules">;
    ttsrDisabledRules: import("./config/registry.js").Setting<string[], "ttsr.disabledRules">;
    secretsEnabled: import("./config/registry.js").Setting<boolean, "secrets.enabled">;
}>>;
interface AlwaysApplyRule {
    name: string;
    content: string;
    path: string;
}
/** Discover TITLE_SYSTEM.md file for automatic session-title prompt overrides */
export declare function discoverTitleSystemPromptFile(cwd?: string): string | undefined;
export interface SystemPromptOverride {
    kind: "template" | "text";
    path: string;
    /** Already-loaded capability content; it must not be resolved as a path again. */
    content?: string;
}
/**
 * Unified discovery for literal and template overrides. Project scope beats
 * user scope; within each scope a literal beats a template: SYSTEM.md is the
 * long-established override, so an existing literal keeps working until its
 * author deliberately removes it in favor of a template. Ancestor walk-up
 * and `.agent/.agents` coverage come from the capability providers, so a
 * repo-root file wins from a nested cwd.
 */
export declare function discoverSystemPromptOverride(cwd?: string): Promise<SystemPromptOverride | undefined>;
/** Unlike literal prompt inputs, explicit template paths never fall back to inline text. */
export declare function loadSystemPromptTemplateFile(filePath: string): Promise<string>;
/** Resolve input as file path or literal string */
export declare function resolvePromptInput(input: string | undefined, description: string): Promise<string | undefined>;
export interface LoadContextFilesOptions {
    /** Working directory to start walking up from. Default: getProjectDir() */
    cwd?: string;
    /** Disabled extension IDs to honor instead of the process-global settings. */
    disabledExtensions?: string[];
}
/**
 * Deduplicate context files by paragraph containment.
 *
 * Files are sorted by depth descending (farther from cwd first) so that a
 * file is omitted only when a more-authoritative (closer-to-cwd) file
 * contains its entire normalized paragraph sequence as a contiguous run.
 * This makes the function self-contained — it does not rely on callers
 * pre-sorting the array, which matters because some callers concatenate
 * independently sorted workspace roots where array position does not reflect
 * authority. Files whose paragraphs are merely paraphrased or interleaved are
 * kept — containment is exact after normalization, not fuzzy.
 *
 * @internal Exported for testing.
 */
export declare function dedupeContainedContextFiles(contextFiles: Array<{
    path: string;
    content: string;
    depth?: number;
}>): Array<{
    path: string;
    content: string;
    depth?: number;
}>;
/**
 * Load all project context files using the capability API.
 * Returns {path, content, depth} entries for all discovered context files.
 * Files are sorted by depth (descending) so files closer to cwd appear last/more prominent.
 */
export declare function loadProjectContextFiles(options?: LoadContextFilesOptions): Promise<Array<{
    path: string;
    content: string;
    depth?: number;
}>>;
/**
 * Load the effective system prompt customization from SYSTEM.md.
 * Project-level SYSTEM.md overrides user-level SYSTEM.md.
 */
export declare function loadSystemPromptFiles(options?: LoadContextFilesOptions): Promise<string | null>;
export declare const DEFAULT_SYSTEM_PROMPT_TOOL_NAMES: readonly ["read", "bash", "edit", "write"];
export interface SystemPromptToolMetadata {
    label: string;
    description: string;
    /** Tool name the model sees on the provider wire. Defaults to the internal tool name. */
    wireName?: string;
    /** Tool parameters schema (Zod or JSON Schema), fed to the verbose inventory renderer. */
    parameters?: TSchema;
    /** Illustrative examples rendered into the verbose inventory. */
    examples?: readonly ToolExample[];
    /** Whether this concrete tool can read `skill://` instruction content. */
    readsSkillUris?: boolean;
}
export type SystemPromptToolMetadataProjection = {
    mode: "compact";
    toolNames: readonly string[];
    overrides?: Partial<Record<string, Partial<SystemPromptToolMetadata>>>;
} | {
    mode: "full";
    overrides?: Partial<Record<string, Partial<SystemPromptToolMetadata>>>;
};
export declare function buildSystemPromptToolMetadata(tools: Map<string, AgentTool>, overrides?: Partial<Record<string, Partial<SystemPromptToolMetadata>>>): Map<string, SystemPromptToolMetadata>;
/** Whether a tool can read `skill://` instruction content.
 *
 * Shared by initial prompt construction and mid-session skill notices so both
 * consult declared capability instead of the tool name. Accepts live tools
 * (`AgentTool` declares the `readsSkillUris` capability) and projected
 * metadata (`SystemPromptToolMetadata`). Accepts `undefined`/`null` (missing
 * registry/metadata entries) and returns `false` for them. */
export declare function toolReadsSkillUris(tool: Pick<AgentTool, "readsSkillUris"> | SystemPromptToolMetadata | undefined | null): boolean;
/** Builds a mode-specific metadata snapshot for internal prompt assembly. */
export declare function projectSystemPromptToolMetadata(tools: Map<string, AgentTool>, projection: SystemPromptToolMetadataProjection): Map<string, SystemPromptToolMetadata>;
export interface BuildSystemPromptOptions {
    /** Custom system prompt (replaces default). */
    customPrompt?: string;
    /** Already-loaded custom system prompt text; bypasses path resolution. */
    resolvedCustomPrompt?: string;
    /** Raw Handlebars template rendered with the default prompt's live context. */
    systemPromptTemplate?: string;
    /** Tools to include in prompt. */
    tools?: Map<string, SystemPromptToolMetadata>;
    /** Tool names to include in prompt. */
    toolNames?: string[];
    /**
     * Names actually exposed as provider-callable tools. Defaults to `toolNames`.
     * Code Mode passes its direct keep-set so the rendered tool inventory matches
     * the wire surface while capability and safety gates still see every
     * bridge-reachable tool in `toolNames`.
     */
    directToolNames?: readonly string[];
    /** Text to append to system prompt. */
    appendSystemPrompt?: string;
    /** Already-loaded append prompt text; bypasses path resolution. */
    resolvedAppendSystemPrompt?: string;
    /** Inline full tool descriptors in the system prompt. Default: false */
    inlineToolDescriptors?: boolean;
    /**
     * Whether provider-native tool calling is active (no owned/in-band syntax).
     * When true and `inlineToolDescriptors` is false, the inventory renders as a
     * compact tool-name list; otherwise it renders the full Harmony-style
     * `namespace functions { … }` catalog. Default: true
     */
    nativeTools?: boolean;
    /** Skills settings for discovery. */
    skillsSettings?: SkillsSettings;
    /** Working directory. Default: getProjectDir() */
    cwd?: string;
    /** Additional workspace directories beyond cwd (multi-root), absolute. Injected into the project prompt. */
    additionalWorkspaceRoots?: string[];
    /** Pre-loaded context files (skips discovery if provided). */
    contextFiles?: Array<{
        path: string;
        content: string;
        depth?: number;
    }>;
    /** Skills provided directly to system prompt construction. */
    skills?: readonly Skill[];
    /** Session-scoped description snapshot; background cache writes apply only to the next session. */
    skillDescriptions?: SkillDescriptionCatalog;
    /** Pre-loaded rulebook rules (descriptions, excluding TTSR and always-apply). */
    rules?: Array<{
        name: string;
        description?: string;
        path: string;
        globs?: string[];
    }>;
    /** Intent field name injected into every tool schema. If set, explains the field in the prompt. */
    intentField?: string;
    /** Encourage the agent to delegate via tasks unless changes are trivial. */
    eagerTasks?: boolean;
    /** When true, the Eager Tasks section uses the hard MUST/ONLY wording (`task.eager: always`) rather than the softer `preferred` nudge. */
    eagerTasksAlways?: boolean;
    /** Whether `task.batch` is enabled; selects the centralized delegation guidance's call shape. */
    taskBatch?: boolean;
    /** Effective task concurrency limit displayed in centralized delegation guidance. Zero means unlimited. */
    taskMaxConcurrency?: number;
    /** Whether IRC-backed parallel coordination can be included in delegation policy. */
    taskIrcEnabled?: boolean;
    /** Whether the read-only `scout` subagent is spawnable (not disabled, allowed by spawn policy). Defaults to true. */
    scoutAvailable?: boolean;
    /** Active model's delegation appetite (catalog `delegation-bias` axis); selects the Delegation section's wording. Default: `eager`. */
    delegationBias?: DelegationBias;
    /** Rules with alwaysApply=true — their full content is injected into the prompt. */
    alwaysApplyRules?: AlwaysApplyRule[];
    /** Whether secret obfuscation is active. When true, explains the redaction format in the prompt. */
    secretsEnabled?: boolean;
    /** Pre-loaded workspace tree (skips discovery if provided). May be a Promise to allow early kick-off. */
    workspaceTree?: WorkspaceTree | Promise<WorkspaceTree>;
    /** Active `memory.backend` id; undefined when memory is off. */
    memoryBackend?: string;
    /** Whether the read-only security:// resource namespace is active. */
    securityEnabled?: boolean;
    /** Whether the user approves `cfg://` writes for this session; gates advertising `cfg://`. */
    settingsApproval?: boolean;
    /**
     * Eval preludes advertised by this prompt. Each prelude's `guidance` is
     * appended as its own block after the rendered template, so custom templates
     * keep it; names also set the `browserEnabled`/`computerEnabled` template flags.
     */
    evalPreludes?: readonly Pick<EvalPreludeDefinition, "name" | "guidance">[];
    /** Active model identifier (e.g. "anthropic/claude-opus-4") surfaced in the workstation block. */
    model?: string;
    /** Whether to surface `model` in the workstation block. Default: true. */
    includeModelInPrompt?: boolean;
    /** Personality preset rendered into the default system prompt. "none" omits the block. Default: "default" */
    personality?: Personality;
    /** Whether to include the workspace directory tree in the system prompt. Default: false */
    includeWorkspaceTree?: boolean;
    /** Whether Mermaid fenced blocks render as terminal ASCII diagrams. Default: true */
    renderMermaid?: boolean;
    /** Whether the TUI lifts an opening emoji into a reaction badge on the user's message. Default: false */
    reactions?: boolean;
    /** Pre-resolved nested active repo context. Undefined resolves from cwd. */
    activeRepoContext?: ActiveRepoContext | null;
    /** Tools mounted under `xd://`; renders the protocol section when non-empty. `dynamic` marks external devices whose summary is third-party metadata. */
    xdevTools?: Array<{
        name: string;
        summary: string;
        dynamic?: boolean;
    }>;
    /** Full docs + JSON schema for every `xd://`-mounted tool, inlined into the protocol section so no discovery `read` is needed. */
    xdevDocs?: string;
    /** Whether Auto-QA grievance reporting is enabled; renders the `xd://report_issue` note. */
    autoQaEnabled?: boolean;
    /** Whether active `write` is restricted to xd:// dispatch and the plan artifact sandbox. */
    writeTransportOnly?: boolean;
    /**
     * Whether this prompt is for a subagent session. Replaces the Verify workflow with a hand-off:
     * the main agent verifies once after all subagents land, so parallel children don't storm the CPU.
     */
    subagent?: boolean;
}
/** Result of building provider-facing system prompt messages. */
export interface BuildSystemPromptResult {
    /** Ordered system prompt blocks. Providers should preserve entries as distinct messages/blocks. */
    systemPrompt: string[];
    /**
     * Names of `xd://` devices whose catalog/protocol section this prompt renders.
     * Empty/undefined when no catalog was emitted (no mounted devices, or a custom
     * prompt template that omits the section). Lets the session fold these devices
     * into its announced-mount baseline so a same-turn mount notice does not re-list
     * a catalog the prompt already carries (issue #7139).
     */
    xdevCatalogNames?: readonly string[];
}
/**
 * Join generated append blocks (memory, auto-learn, `xd://` routes, MCP server
 * instructions) with the user's append prompt. Keep the user text in its own
 * section so it is not misclassified as MCP server-controlled instructions.
 */
export declare function composeAppendPrompt(appendParts: readonly string[], appendSystemPrompt?: string): string | undefined;
/** Build the system prompt with tools, guidelines, and context */
export declare function buildSystemPrompt(options?: BuildSystemPromptOptions): Promise<BuildSystemPromptResult>;
export {};
