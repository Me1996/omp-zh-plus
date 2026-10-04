import { AgentLifecycleManager } from "../../registry/agent-lifecycle.js";
import { AgentRegistry, type AgentRef } from "../../registry/agent-registry.js";
import type { AgentSession } from "../../session/agent-session.js";
import type { InteractiveModeContext } from "../types.js";
/**
 * Pick the most recently active focusable subagent. Advisors are read-only
 * transcripts and aborted agents are terminal, so neither is focusable; the
 * main session is the view itself, not a focus target. A focused caller passes
 * its id to cycle to the next-most-recent agent (wrapping), so repeated
 * presses walk the roster instead of sticking on the newest row.
 */
export declare function pickRecentFocusableAgentId(refs: readonly AgentRef[], currentId?: string): string | undefined;
/**
 * SessionFocusController - Weak retargeting primitive between the rendering/
 * input layer and the AgentSession it displays.
 *
 * Focusing re-points the transcript, streaming event subscription, status
 * line, and editor prompt/interrupt at a subagent's live AgentSession (from
 * AgentRegistry) without touching the main session underneath; unfocusing
 * re-attaches the main session and rebuilds the transcript from its
 * authoritative state.
 */
export declare class SessionFocusController {
    #private;
    private ctx;
    private registry;
    private lifecycle;
    constructor(ctx: InteractiveModeContext, registry?: AgentRegistry, lifecycle?: () => AgentLifecycleManager);
    get focusedAgentId(): string | undefined;
    /** Focused live session, undefined when unfocused. */
    get target(): AgentSession | undefined;
    /** Focus the main view on an agent's live session. Throws an Error with a user-displayable message. */
    focusAgent(id: string): Promise<void>;
    /** Focus the focused agent's parent agent, falling back to the main session. No-op when unfocused. */
    focusParent(): Promise<void>;
    /** Return to the main session. No-op when unfocused. */
    unfocus(): Promise<void>;
    dispose(): void;
    /**
     * Drop pending focus requests without touching the current view. Clicking
     * the already-focused agent reaffirms it: that newer explicit act must win
     * over an older still-reviving request.
     */
    invalidatePendingFocus(): void;
}
