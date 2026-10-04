/**
 * `xd://` virtual tool devices.
 *
 * Discoverable built-ins and custom tools are unmounted from the request's
 * tools array and exposed as internal URLs driven through the `read`/`write`
 * tools the model already has:
 *
 *   read  xd://          → mounted tool listing (discovery)
 *   read  xd://<tool>    → tool docs + JSON parameter schema
 *   write xd://<tool>    → execute: `content` is the JSON args object
 *
 * Direct and device dispatch share one canonical tool map. The mounted-name
 * set controls presentation only; dispatch accepts the enabled union of
 * top-level active and mounted names. Listing and prompt docs stay
 * mounted-only because top-level tools already ship their schemas.
 *
 * Args go through the same machinery as native tool calls: validated with
 * pi-ai's `validateToolArguments` (the schema is returned on mismatch, so a
 * malformed call self-corrects without a round trip) and streamed through
 * the write tool's existing incremental `content` decoding for live render
 * previews. Compared to a dispatcher def this still costs zero *schema
 * duplication* — one wire schema per tool instead of one per dispatcher
 * branch — but full docs + schema for every mounted device can be inlined
 * into the system prompt, so no discovery read is needed before first use;
 * `read xd://<tool>` remains for on-demand re-fetch.
 *
 * Rendering: the write renderer draws NOTHING until the streamed `path` is
 * known and provably does not target `xd://`. Device writes then show as
 * queued/planning until `tool_execution_start`, and only then delegate to the
 * wrapped tool's own renderer with the decoded inner args.
 */
import type { AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolLoadMode } from "@oh-my-pi/pi-agent-core";
import { type ToolTier } from "./approval.js";
import type { Tool } from "./index.js";
/**
 * Discoverable built-ins that must stay top-level even when xdev mounting is
 * active: `todo` feeds the todo prelude/prewalk machinery, `ask` is the
 * model's user-interaction affordance, `grep` is the redirect target of the
 * bash interceptor rules, and `web_search` is invoked directly by most models
 * (which have no notion of the `xd://` protocol) so hiding it behind dispatch
 * makes it unreachable in practice (issue #5973). `yield` terminates structured
 * subagent runs and must stay directly callable — each loses its harness
 * integration or usability if hidden behind dispatch.
 */
export declare const XDEV_KEEP_TOP_LEVEL: Record<string, true>;
/**
 * Tools that carry the `xd://` transport itself and therefore can never be
 * mounted as devices: `read xd://` lists/documents devices and
 * `write xd://<tool>` executes them. Demoting either leaves every mounted
 * device unreachable (issue #5764), so they stay top-level regardless of a
 * declared `loadMode`.
 */
export declare const XDEV_TRANSPORT_TOOLS: Record<string, true>;
/** Controls which mounted-device docs are inlined into the system prompt. */
export type XdevDocsMode = "inline" | "builtins" | "catalog";
/**
 * Whether an enabled tool is presented under `xd://` (rather than top-level)
 * while the `xd://` transport is active. Discoverable tools mount unless they
 * are pinned top-level by {@link XDEV_KEEP_TOP_LEVEL} or carry the transport
 * itself ({@link XDEV_TRANSPORT_TOOLS}); essential tools never do. The caller
 * gates this on the transport being active.
 */
export declare function isMountableUnderXdev(tool: {
    name: string;
    loadMode?: ToolLoadMode;
}): boolean;
/** Dispatch metadata carried on write-tool details for renderer delegation. */
export interface XdevDispatch {
    tool: string;
    mode: "help" | "execute";
    /** Validated inner args, kept for renderer delegation on result rebuilds. */
    args?: Record<string, unknown>;
    /**
     * Approval tier of the wrapped tool for {@link args} (`read` = no workspace
     * mutation). Absent for `help` dispatches and calls whose tier could not be
     * resolved. Consumed by the prewalk coordinator to skip read-only device
     * calls when deciding the model hand-off (issue #7312).
     */
    tier?: ToolTier;
    /** Details object returned by the wrapped tool, when executed. */
    inner?: unknown;
}
/** Shared tool state consumed by the `xd://` presentation layer. */
export interface XdevState {
    /** Canonical session tool map; direct and device dispatch read the same instances. */
    readonly tools: Map<string, Tool>;
    /** Ordered names currently presented as mounted devices. */
    readonly mountedNames: Set<string>;
    /** Names originating from built-in factories, used only for prompt presentation. */
    readonly builtInNames: Set<string>;
    /** Whether a name is active at the top level. */
    readonly isActive: (name: string) => boolean;
    /** Canonical renderer for a dispatched device name; mirrors {@link resolveXdevTool}. */
    readonly resolve?: (name: string) => Tool | undefined;
    /** Optional execution-only decorator, such as the ACP permission gate. */
    decorateExecution?(tool: Tool): Tool;
}
/** Full-doc character budget for system-prompt mounted-device sections. */
export declare const XDEV_DOCS_TOTAL_BUDGET = 48000;
/** Per-device cap preventing one pathological description from starving later devices. */
export declare const XDEV_DOCS_PER_DEVICE_CAP = 10000;
/** Description cap for external mounted tools; their full docs remain readable on demand. */
export declare const XDEV_EXTERNAL_DESCRIPTION_CAP = 200;
/** Resolve any enabled tool through the canonical session map. */
export declare function resolveXdevTool(state: XdevState, name: string): Tool | undefined;
/**
 * Resolve a mounted tool by name. Presentation-only: `xd://` docs and renderer
 * lookup ask for names they already hold in canonical form.
 */
export declare function resolveMountedXdevTool(state: XdevState, name: string): Tool | undefined;
/**
 * Resolve a mounted tool with its execution-only permission decorator.
 *
 * Mounted-only, matching {@link resolveMountedXdevTool}, and a published export
 * under `@oh-my-pi/pi-coding-agent/tools/xdev`, so its semantics must not
 * drift. `sdk.ts` composes this with the calling agent's advertised tools to
 * recover a Claude Code-spelled MCP name: the union has to be resolved in one
 * pass for the ambiguity rule to hold, so that composition lives with the
 * caller that knows both presentation sets rather than here.
 */
export declare function resolveMountedXdevExecutable(state: XdevState, name: string): Tool | undefined;
/** Mounted tools in presentation order, resolved from the canonical map. */
export declare function listXdevTools(state: XdevState): Tool[];
/** `{name, summary, dynamic}` triples for prompt templates and `/tools` display. */
export declare function xdevEntries(state: XdevState): Array<{
    name: string;
    summary: string;
    dynamic: boolean;
}>;
/** `read xd://` listing with one device per line. */
export declare function xdevListing(state: XdevState): string;
/** Docs + schema for any enabled tool. */
export declare function xdevDocs(state: XdevState, name: string): string;
/** Mounted-device placement in the system prompt: inlined docs sections, then one-line catalog entries. */
export interface XdevPromptDocs {
    readonly sections: readonly string[];
    /** Catalog summary for each device listed as a one-line entry, in presentation order. */
    readonly catalog: ReadonlyMap<string, string>;
}
/**
 * Place mounted devices under the configured prompt-doc policy and budgets.
 * A device the policy does not inline, or whose docs exceed a cap, becomes a
 * catalog entry.
 */
export declare function planXdevPromptDocs(state: XdevState, mode?: XdevDocsMode, inlinePatterns?: readonly string[]): XdevPromptDocs;
/**
 * Render planned `xd://` prompt docs. Devices in `listedElsewhere` get no
 * catalog line: the caller lists them itself, with their catalog summary.
 */
export declare function renderXdevPromptDocs(docs: XdevPromptDocs, listedElsewhere?: ReadonlySet<string>): string;
/** Docs + schema for mounted devices under the configured prompt-doc policy. */
export declare function xdevDocsAll(state: XdevState, mode?: XdevDocsMode, inlinePatterns?: readonly string[]): string;
/** Docs for selected mounted devices under the configured prompt-doc policy. */
export declare function xdevDocsFor(state: XdevState, names: Iterable<string>, mode: XdevDocsMode, inlinePatterns?: readonly string[]): string;
/** Execute an enabled canonical tool through `write xd://<tool>`. */
export declare function dispatchXdevTool(state: XdevState, name: string, content: string, toolCallId: string, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback, context?: AgentToolContext): Promise<{
    result: AgentToolResult<unknown>;
    xdev: XdevDispatch;
}>;
