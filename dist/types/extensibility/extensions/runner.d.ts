import { type AgentMessage, type AgentTool, type AgentToolContext, type AgentToolResult, type AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage, CredentialDisabledEvent, ImageContent, Model, ProviderResponseMetadata } from "@oh-my-pi/pi-ai";
import type { KeyId } from "@oh-my-pi/pi-tui-zh";
import type { ModelRegistry } from "../../config/model-registry.js";
import { type Settings } from "../../config/settings.js";
import type { LocalProtocolOptions } from "../../internal-urls/local-protocol.js";
import type { MemoryRuntimeContext } from "../../memory-backend/index.js";
import type { AsyncJobSnapshot } from "../../session/agent-session.js";
import type { SessionManager } from "../../session/session-manager.js";
import type { BranchHandler, NavigateTreeHandler, NewSessionHandler } from "../session-handler-types.js";
import type { ComposerShapeDefinition } from "@oh-my-pi/pi-tui-zh/overlays/composer-shape-registry";
import type { AfterProviderResponseEvent, AssistantThinkingRenderer, BeforeAgentStartEvent, BeforeAgentStartEventResult, BeforeProviderRequestEvent, BeforeProviderRequestEventResult, BeforeSubagentSpawnEvent, BeforeSubagentSpawnEventResult, ContextEvent, Extension, ExtensionActions, ExtensionAgentIdentity, ExtensionCommandContext, ExtensionCommandContextActions, ExtensionContext, ExtensionContextActions, ExtensionError, ExtensionEvent, ExtensionFlag, ExtensionMode, ExtensionRuntime, ExtensionShortcut, ExtensionUIContext, InputEvent, InputEventResult, CacheWarmingAction, CacheWarmingDecisionEvent, McpNotificationEvent, MessageRenderer, RegisteredCommand, RegisteredTool, ResourcesDiscoverEvent, SessionBeforeBranchResult, SessionBeforeCompactResult, SessionBeforeSwitchResult, SessionBeforeTreeResult, SessionCompactingResult, SessionStopEvent, SessionStopEventResult, ToolCallEvent, ToolCallEventResult, ToolResultEvent, ToolResultEventResult, UserBashEvent, UserBashEventResult, UserPythonEvent, UserPythonEventResult } from "./types.js";
/** Combined result from all before_agent_start handlers */
interface BeforeAgentStartCombinedResult {
    messages?: NonNullable<BeforeAgentStartEventResult["message"]>[];
    systemPrompt?: string[];
}
export type ExtensionErrorListener = (error: ExtensionError) => void;
export interface ToolCallPreflight {
    before?: (toolCallId: string, tool: AgentTool, args: unknown, context?: AgentToolContext) => Promise<{
        block?: boolean;
        reason?: string;
    } | undefined> | {
        block?: boolean;
        reason?: string;
    } | undefined;
    after?: (toolCallId: string, result: AgentToolResult, context?: AgentToolContext) => Promise<AgentToolResult | undefined> | AgentToolResult | undefined;
    cancel?: (toolCallId: string) => void;
}
export declare const EXTENSION_HANDLER_TIMEOUT_MS = 30000;
export declare function testSetExtensionHandlerTimeoutMs(timeoutMs: number): void;
/**
 * Dedicated cap for `session_shutdown` handlers. The generic 30s budget is
 * appropriate for events extensions can observe (e.g. `session_start`,
 * `before_provider_request`), but `session_shutdown` is fire-and-forget
 * teardown — extensions receive no result and the user has already asked to
 * leave. A hung handler (e.g. an extension waiting on a stuck IPC pipe to a
 * companion app) MUST NOT hold Ctrl+C / `/exit` hostage for the full window.
 * See issue #2600.
 */
export declare const SESSION_SHUTDOWN_HANDLER_TIMEOUT_MS = 2000;
export declare function testSetSessionShutdownHandlerTimeoutMs(timeoutMs: number): void;
/**
 * Events handled by the generic emit() method.
 * Events with dedicated emitXxx() methods are excluded for stronger type safety.
 */
type RunnerEmitEvent = Exclude<ExtensionEvent, ToolCallEvent | ToolResultEvent | UserBashEvent | ContextEvent | CacheWarmingDecisionEvent | BeforeProviderRequestEvent | AfterProviderResponseEvent | BeforeAgentStartEvent | ResourcesDiscoverEvent | InputEvent>;
type RunnerEmitResult<TEvent extends RunnerEmitEvent> = TEvent extends {
    type: "session_before_switch";
} ? SessionBeforeSwitchResult | undefined : TEvent extends {
    type: "session_before_branch";
} ? SessionBeforeBranchResult | undefined : TEvent extends {
    type: "session_before_compact";
} ? SessionBeforeCompactResult | undefined : TEvent extends {
    type: "session_before_tree";
} ? SessionBeforeTreeResult | undefined : TEvent extends {
    type: "session.compacting";
} ? SessionCompactingResult | undefined : TEvent extends {
    type: "session_stop";
} ? SessionStopEventResult | undefined : undefined;
export type { BranchHandler, NavigateTreeHandler, NewSessionHandler };
export type SwitchSessionHandler = (sessionPath: string) => Promise<{
    cancelled: boolean;
}>;
export type ShutdownHandler = () => void;
/**
 * Emit `session_shutdown`, dispose file-write-fallback registrations, and clear
 * timers owned by an extension runner.
 *
 * Returns whether any shutdown handlers were present. Fallback disposal and timer
 * cleanup run even when a handler fails so extension background work — and a
 * fallback bound to this session's context — cannot outlive its host.
 */
export declare function emitSessionShutdownEvent(extensionRunner: ExtensionRunner | undefined): Promise<boolean>;
/** Identity reported by a session that is not a subagent and received no explicit identity. */
export declare const TOP_LEVEL_AGENT: ExtensionAgentIdentity;
export declare class ExtensionRunner {
    #private;
    private readonly extensions;
    private readonly runtime;
    private readonly sessionManager;
    private readonly modelRegistry;
    private readonly settings?;
    private readonly localProtocolOptions?;
    /** Identity of the agent this runner's session runs; defaults to the top-level agent. */
    private readonly agent;
    /** Records that the loop already emitted `tool_call` for this dispatch. */
    markToolCallEmitted(toolCallId: string, toolName: string): void;
    /** Consumes a {@link markToolCallEmitted} marker; true when the loop already emitted. */
    consumeToolCallEmitted(toolCallId: string, toolName: string): boolean;
    /** Marks every dispatch prepared by the agent loop, independent of extension handlers. */
    markLoopToolCall(toolCallId: string, toolName: string): void;
    /** Clears a loop marker when pre-dispatch blocked execution before the wrapper ran. */
    clearLoopToolCall(toolCallId: string, toolName: string): void;
    /** Consumes the marker for a loop dispatch; false means non-loop execution. */
    consumeLoopToolCall(toolCallId: string, toolName: string): boolean;
    /** Wires the native-tool resolver used by {@link invokeNativeTool}. */
    setNativeToolResolver(resolve: (name: string) => {
        tool: AgentTool;
        makeContext: () => AgentToolContext;
    } | undefined): void;
    setToolCallPreflight(preflight: ToolCallPreflight | undefined): void;
    runToolCallPreflightBefore(toolCallId: string, tool: AgentTool, args: unknown, context?: AgentToolContext): Promise<{
        block?: boolean;
        reason?: string;
    } | undefined>;
    runToolCallPreflightAfter(toolCallId: string, result: AgentToolResult, context?: AgentToolContext): Promise<AgentToolResult | undefined>;
    cancelToolCallPreflight(toolCallId: string): void;
    /** Whether a native built-in of `name` is available to delegate to. */
    hasNativeTool(name: string): boolean;
    /**
     * Run the native built-in of `name` with `params` and return its result — the delegation target
     * of a same-tool `ctx.invokeTool`. Calls the unwrapped native `execute` directly with the loop's
     * ordinary tool context, so it inherits the caller's already-granted approval (the caller is the
     * same tool) rather than re-running the gate. `depth` guards a wrapper that recurses into itself;
     * it is per call chain (threaded from the caller), not session-global, so concurrent independent
     * delegations do not interfere.
     */
    invokeNativeTool<TDetails = unknown>(name: string, params: Record<string, unknown>, options?: {
        signal?: AbortSignal;
        onUpdate?: AgentToolUpdateCallback<TDetails>;
        depth?: number;
        /**
         * The caller tool's own context. Reused for the native call so metadata the native tool
         * reads — `toolCall` (write/edit LSP batch flushing) and provider metadata /
         * `providerSafetyApproved` (computer) — is preserved. Falls back to a fresh session tool
         * context only when the caller had none.
         */
        callerContext?: AgentToolContext;
    }): Promise<AgentToolResult<TDetails>>;
    constructor(extensions: Extension[], runtime: ExtensionRuntime, 
    /** Ignored: `cwd` is always read live via the `cwd` getter below, not cached here. */
    _initialCwd: string, sessionManager: SessionManager, modelRegistry: ModelRegistry, getMemory?: () => MemoryRuntimeContext | undefined, settings?: Settings | undefined, localProtocolOptions?: LocalProtocolOptions | undefined, getAsyncJobSnapshot?: () => AsyncJobSnapshot | null, 
    /** Identity of the agent this runner's session runs; defaults to the top-level agent. */
    agent?: ExtensionAgentIdentity);
    /**
     * Live session directory, not a session-start snapshot: `/move`
     * (`SessionManager.moveTo()`) relocates the owning session by updating
     * `sessionManager`'s own `#cwd`, not a process-global. Reading it here
     * via the getter — instead of caching the constructor-time value in a
     * field — keeps every `ExtensionContext` built below in sync with this
     * session's actual, current directory. Deliberately `sessionManager.getCwd()`
     * rather than `getProjectDir()`: the latter is a single process-wide value
     * that only the interactive TUI's `/move` handler happens to also update
     * (`InteractiveModeContext#applyCwdChange`) — an SDK/ACP host running
     * several concurrent sessions each with their own `cwd` (see
     * `CreateAgentSessionOptions.cwd`) must never have one session's move
     * leak into another's `ctx.cwd` by reading a shared global.
     */
    get cwd(): string;
    /**
     * Stable id of the session this runner serves. Read through `sessionManager`
     * for the same reason as {@link cwd}: it is this session's own, never a
     * process-global, so a subagent runner reports itself and not its parent.
     *
     * Used to attribute a denied file write or delete to the session that issued
     * it, since the fallback registry those handlers live in is process-wide.
     */
    get sessionId(): string;
    /**
     * Session settings this runner was constructed with. Used when a direct
     * `tool.execute()` omits execute-time context so approval still sees the
     * user's configured mode (schema default `yolo`) instead of fail-closed.
     */
    get sessionSettings(): Settings | undefined;
    initialize(actions: ExtensionActions, contextActions: ExtensionContextActions, commandContextActions?: ExtensionCommandContextActions, uiContext?: ExtensionUIContext, mode?: ExtensionMode): void;
    /**
     * Forward a `credential_disabled` event from `AuthStorage` to extension handlers.
     *
     * If {@link initialize} has not yet run, the event is buffered and replayed once
     * initialize wires the runtime/UI context. This matters because mode controllers
     * (interactive, RPC, ACP, print, subagent) call `initialize()` AFTER `createAgentSession`
     * returns, but `AuthStorage` can fire `credential_disabled` during startup model probes
     * inside `createAgentSession()`. Without deferral, extension handlers would observe
     * `hasUI=false`, an unset model, and no-op runtime actions on exactly the headline
     * "OAuth invalid_grant during startup" path the event was designed to surface.
     *
     * Always returns; never throws. Errors from handlers are routed through
     * {@link onError} via {@link emit}'s normal isolation.
     */
    emitCredentialDisabled(event: CredentialDisabledEvent): Promise<void>;
    /**
     * Forward an MCP server notification to extension handlers.
     *
     * If {@link initialize} has not yet run, the notification is buffered and replayed
     * once initialize wires the runtime/UI context. Matches the credential-disabled
     * deferral above: the sdk.ts bridge registers `MCPManager.addNotificationListener`
     * inside `createAgentSession` — BEFORE the mode controller calls `initialize()` on
     * this runner — so notification frames drained by the manager (either fresh
     * arrivals or replay from its own startup buffer) can reach us pre-init. Without
     * this buffer they would evaporate for a second time here.
     *
     * Bounded at {@link MAX_PENDING_MCP_NOTIFICATIONS}; oldest entries drop under
     * pressure. Never throws; per-handler errors are routed through {@link onError}
     * via {@link emit}'s normal isolation.
     */
    emitMcpNotification(event: Omit<McpNotificationEvent, "type">): Promise<void>;
    /** Emits a session stop pass that can be cancelled with the active settle signal. */
    emitSessionStop(event: Omit<SessionStopEvent, "type">): Promise<SessionStopEventResult | undefined>;
    /**
     * Asks extensions to override a prompt-cache warming decision. The last
     * handler returning an action wins; handler failures are reported through
     * the extension error listeners and leave the warmer's decision standing.
     */
    emitCacheWarmingDecision(event: CacheWarmingDecisionEvent): Promise<CacheWarmingAction>;
    /** Registers the interactive transcript gate that must settle before a tool approval is presented. */
    setToolApprovalPreviewWaiter(waiter: (toolCallId: string) => Promise<void>): () => void;
    /** Waits until the interactive transcript can show the tool call being approved. */
    waitForToolApprovalPreview(toolCallId: string): Promise<void>;
    getUIContext(): ExtensionUIContext;
    hasUI(): boolean;
    getExtensionPaths(): string[];
    /** Every extension this runner loaded, in load order, including suspended ones. */
    getLoadedExtensions(): readonly Extension[];
    /** Whether the extension loaded from `extensionPath` is present and not suspended. */
    isExtensionActive(extensionPath: string): boolean;
    /**
     * Suspend or resume loaded extensions in place (e.g. after a live `disabledExtensions`
     * edit). A suspended extension keeps its module state but stops contributing event
     * handlers, commands, tools, message renderers, shortcuts, flags, and file fallbacks
     * until resumed. Returns the extensions whose state changed.
     */
    setSuspendedExtensions(shouldSuspend: (extension: Extension) => boolean): {
        suspended: Extension[];
        resumed: Extension[];
    };
    /** Get all registered tools from all extensions. */
    getAllRegisteredTools(): RegisteredTool[];
    /** Get the effective registered tool for a name using normal last-extension-wins precedence. */
    getRegisteredTool(name: string): RegisteredTool | undefined;
    /**
     * Observe tools registered after extension factories have loaded. Listener
     * promises are drained before the lifecycle handler that registered them
     * completes, keeping the model tool snapshot and system prompt coherent.
     */
    onToolRegistered(listener: (tool: RegisteredTool, signal?: AbortSignal) => void | Promise<void>): () => void;
    /** Composer shapes registered during extension load, with later extensions winning id collisions. */
    getComposerShapes(): ComposerShapeDefinition[];
    /**
     * Aggregate the registered CLI flags across a set of extensions (last write
     * wins on name collision). Static so callers that need the flag set before a
     * runner exists — e.g. the CLI resolving `@file`/flag args before session
     * creation — share this exact logic instead of duplicating it.
     */
    static aggregateFlags(extensions: readonly Extension[]): Map<string, ExtensionFlag>;
    getFlags(): Map<string, ExtensionFlag>;
    getFlagValues(): Map<string, boolean | string>;
    setFlagValue(name: string, value: boolean | string): void;
    getShortcuts(): Map<KeyId, ExtensionShortcut>;
    onError(listener: ExtensionErrorListener): () => void;
    emitError(error: ExtensionError): void;
    hasHandlers(eventType: string): boolean;
    getMessageRenderer(customType: string): MessageRenderer | undefined;
    getAssistantThinkingRenderers(): AssistantThinkingRenderer[];
    getRegisteredCommands(reserved?: ReadonlySet<string>): RegisteredCommand[];
    getCommandDiagnostics(): Array<{
        type: string;
        message: string;
        path: string;
    }>;
    getCommand(name: string): RegisteredCommand | undefined;
    /**
     * Run an extension-owned callback within this session's settings scope, so a
     * synchronous `SettingsManager.create(ctx.cwd)` inside it resolves THIS
     * session's manager rather than a same-cwd sibling's. Event handlers get this
     * scope via {@link #runHandlerWithTimeout}; slash commands and shortcuts are
     * invoked directly by their controllers and route through here instead.
     */
    runScoped<T>(fn: () => T): T;
    /**
     * Creates an extension context, optionally scoped to a provider request model.
     *
     * `delegation` wires the same-tool `ctx.invokeTool` for a re-registered built-in: when `toolName`
     * names an existing native built-in, the context carries an `invokeTool` that runs it (see
     * {@link invokeNativeTool}). The rest inherits the wrapper's own call so a bare
     * `ctx.invokeTool(params)` behaves like the outer call — `context` preserves `toolCall`/provider
     * metadata, `signal`/`onUpdate` default to the wrapper's own channels so aborting the outer tool
     * call stops the native one and native progress still streams, and `depth` bounds recursion per
     * call chain. Explicit options passed to `invokeTool` override the inherited `signal`/`onUpdate`.
     *
     * `agent` replaces this runner's identity as `ctx.agent` for work done on behalf of another
     * agent that shares the runner (the advisor's toolset, see `ExtensionToolWrapper`).
     */
    createContext(model?: Model, delegation?: {
        toolName: string;
        depth?: number;
        context?: AgentToolContext;
        signal?: AbortSignal;
        onUpdate?: AgentToolUpdateCallback;
    }, agent?: ExtensionAgentIdentity): ExtensionContext;
    /**
     * Request a graceful shutdown. Called by extension tools and event handlers.
     */
    shutdown(): void;
    /**
     * Clear every timer scheduled through `ctx.setInterval` / `ctx.setTimeout`.
     * Called during session teardown so extension background work does not
     * outlive the session (a self-scheduling interval would otherwise keep
     * firing against a disposed session).
     */
    clearManagedTimers(): void;
    /**
     * Remove every file write and delete fallback this runner installed into the
     * process-wide registries. Called on session shutdown (and before reinstalling
     * on a re-{@link initialize}) so a handler bound to a torn-down session's
     * context can never fire for another session sharing this process.
     */
    disposeFileFallbacks(): void;
    createCommandContext(): ExtensionCommandContext;
    emit<TEvent extends RunnerEmitEvent>(event: TEvent): Promise<RunnerEmitResult<TEvent>>;
    /**
     * Run extension rewrites on a detached finalized assistant message. Text may
     * change only in its original block position; all other metadata and blocks
     * remain unchanged. Text replay signatures are tied to their original text.
     *
     * Handlers see a structured clone, but the result is rebuilt from the
     * original blocks: unchanged blocks keep their identity and symbol-keyed
     * provider markers (e.g. `kCursorExecResolved`, which `structuredClone`
     * drops and without which agent-loop re-runs Cursor-settled tool calls).
     */
    emitAssistantMessage(message: AssistantMessage, signal?: AbortSignal): Promise<AssistantMessage["content"] | undefined>;
    /**
     * Emit `tool_result` to every subscribed extension. Returns the full
     * `content`/`details`/`isError` triple only when a handler modified the
     * result; joined `additionalContext` rides along whenever any handler set it.
     */
    emitToolResult(event: ToolResultEvent, agent?: ExtensionAgentIdentity): Promise<ToolResultEventResult | undefined>;
    /**
     * Emit a `tool_call` event to every subscribed extension before the tool executes.
     *
     * Each handler is bounded by `extensionHandlers.toolCallTimeoutMs` (default
     * 30s). This matches the timeout policy already applied to `emitToolResult` and every
     * other handler routed through `#runHandlerWithTimeout`; without it a single
     * hung extension (unresolved `await`, network call with no timeout) would
     * park `ExtensionToolWrapper.execute` indefinitely and freeze tool
     * dispatch — see issue #3948.
     *
     * On-timeout policy: **fail-closed** (return `{ block: true }`). This is
     * symmetric with the existing error path below and safer for a
     * pre-execution gate — an unresponsive extension MUST NOT be treated as
     * silent consent to run the tool.
     *
     * `agent` overrides `ctx.agent` when the tool runs for another agent sharing this runner.
     */
    emitToolCall(event: ToolCallEvent, signal?: AbortSignal, agent?: ExtensionAgentIdentity): Promise<ToolCallEventResult | undefined>;
    emitUserBash(event: UserBashEvent): Promise<UserBashEventResult | undefined>;
    emitUserPython(event: UserPythonEvent): Promise<UserPythonEventResult | undefined>;
    private emitUserEvent;
    emitResourcesDiscover(cwd: string, reason: ResourcesDiscoverEvent["reason"]): Promise<{
        skillPaths: Array<{
            path: string;
            extensionPath: string;
        }>;
        promptPaths: Array<{
            path: string;
            extensionPath: string;
        }>;
        themePaths: Array<{
            path: string;
            extensionPath: string;
        }>;
    }>;
    /** Emit input event. Transforms chain, "handled" short-circuits. */
    emitInput(text: string, images: ImageContent[] | undefined, source: "interactive" | "rpc" | "extension"): Promise<InputEventResult>;
    emitContext(messages: AgentMessage[], signal?: AbortSignal): Promise<AgentMessage[]>;
    /** Runs request payload hooks with the model used for that provider request. */
    emitBeforeProviderRequest(payload: unknown, model?: Model, signal?: AbortSignal): Promise<BeforeProviderRequestEventResult>;
    /** Runs response hooks with the model that produced that provider response. */
    emitAfterProviderResponse(response: ProviderResponseMetadata, model?: Model, signal?: AbortSignal): Promise<void>;
    emitBeforeAgentStart(prompt: string, images: ImageContent[] | undefined, systemPrompt: string[]): Promise<BeforeAgentStartCombinedResult | undefined>;
    /**
     * Runs `before_subagent_spawn` handlers; a `block` short-circuits, the last defined `model` wins.
     * `signal` (the spawn's abort signal) cancels an awaiting handler instead of parking until the timeout.
     */
    emitBeforeSubagentSpawn(event: BeforeSubagentSpawnEvent, signal?: AbortSignal): Promise<BeforeSubagentSpawnEventResult | undefined>;
}
