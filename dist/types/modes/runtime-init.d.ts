import type { ExtensionError, ExtensionMode, ExtensionUIContext } from "../extensibility/extensions/types.js";
import type { AgentSession } from "../session/agent-session.js";
/** Action name for an extension-originated send failure. */
export type ExtensionSendAction = "extension_send" | "extension_send_user";
export interface InitializeExtensionsOptions {
    /** Reports an error thrown by an extension-initiated send. */
    reportSendError: (action: ExtensionSendAction, error: Error) => void;
    /** Reports a runtime error surfaced through {@link ExtensionRunner.onError}. */
    reportRuntimeError: (error: ExtensionError) => void;
    /** Optional shutdown hook (rpc mode signals its loop; print mode is a no-op). */
    onShutdown?: () => void;
    /** Pi-compatible mode exposed to extension contexts. Defaults to `"print"`. */
    mode?: ExtensionMode;
    /** Optional UI context (rpc supplies one; print runs headless). */
    uiContext?: ExtensionUIContext;
    /** Optional lifecycle hook for extension-originated messages that can start an agent turn. */
    markAgentInvokingMessage?: () => void;
    /** Optional lifecycle hook for extension-originated sends whose success/failure determines turn ownership. */
    trackAgentInvokingMessage?: (task: Promise<unknown>) => void;
    /** Optional observer of every extension-originated send, turn-triggering or not. */
    trackExtensionSend?: (task: Promise<unknown>) => void;
    /** Optional filter applied to tool names an extension activates. */
    filterActiveTools?: (toolNames: string[]) => string[];
    /**
     * Optional wrapper around extension-initiated session changes (new, branch,
     * navigate, switch, reload), so the host can quiesce and reattach its own per-session
     * state exactly as it does for its own session-change commands.
     * `detachesRun` is true for changes that stop the running agent (new, switch);
     * branch and navigation leave a live run streaming to its normal end.
     */
    wrapSessionChange?: <T extends {
        cancelled: boolean;
    }>(change: () => Promise<T>, options: {
        detachesRun: boolean;
    }) => Promise<T>;
}
/**
 * Initialize the session's extension runner with the standard action set
 * shared by non-interactive modes, then emit `session_start`.
 *
 * No-op when the session was constructed without an extension runner.
 */
export declare function initializeExtensions(session: AgentSession, options: InitializeExtensionsOptions): Promise<void>;
