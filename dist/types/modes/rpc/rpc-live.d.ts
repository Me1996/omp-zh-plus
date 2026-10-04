/**
 * GPT live voice sessions for RPC mode: binds a {@link LiveSessionController} to the
 * RPC AgentSession (so delegated work runs with the host's tools) and forwards its
 * callbacks as unsolicited `live_*` frames.
 */
import type { AssistantMessage } from "@oh-my-pi/pi-ai";
import { LiveSessionController, type LiveSessionControllerOptions } from "../../live/controller.js";
import type { AgentSession } from "../../session/agent-session.js";
import type { RpcLiveFrame } from "./rpc-types.js";
/** Minimum spacing between `live_levels` frames. */
export declare const RPC_LIVE_LEVELS_INTERVAL_MS = 100;
/** The controller surface the RPC bridge drives. */
export type RpcLiveSession = Pick<LiveSessionController, "start" | "stop" | "toggleMute" | "muted">;
/** Builds the controller for one live session; tests substitute a fake. */
export type RpcLiveSessionFactory = (options: LiveSessionControllerOptions) => RpcLiveSession;
/** `live_start` parameters. */
export interface RpcLiveStartOptions {
    voice?: string;
    instructions?: string;
}
/** Visible assistant text: text blocks only, no thinking or tool calls. Shared with interactive mode. */
export declare function extractVisibleAssistantText(message: AssistantMessage): string;
/** Owns at most one live session for an RPC server. */
export declare class RpcLiveBridge {
    #private;
    constructor(session: AgentSession, output: (frame: RpcLiveFrame) => void, createSession?: RpcLiveSessionFactory, levelsIntervalMs?: number);
    /** Whether a session is connecting, active, or closing. */
    get active(): boolean;
    /** Connects a live session and resolves once it is recording. */
    start(options?: RpcLiveStartOptions): Promise<{
        voice: string;
    }>;
    /** Stops the active session; resolves once it has stopped. No-op without one. */
    stop(): Promise<void>;
    /** Sets (or toggles when omitted) microphone mute. */
    setMuted(muted?: boolean): {
        muted: boolean;
    };
}
