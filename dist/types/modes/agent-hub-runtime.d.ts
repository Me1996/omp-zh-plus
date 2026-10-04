import type { AgentHubDeps, AgentHubRemote } from "@oh-my-pi/pi-tui-zh/overlays/agent-hub";
import { type AgentMetrics } from "@oh-my-pi/pi-tui-zh/overlays/agent-hub-projection";
import type { AgentTranscriptSource } from "@oh-my-pi/pi-tui-zh/overlays/agent-transcript-viewer";
import type { SessionObserverRegistry } from "@oh-my-pi/pi-tui-zh/overlays/session-observer-registry";
import { AgentActivityIndex } from "../activity/index.js";
import type { Settings } from "../config/settings.js";
import { IrcBus } from "../irc/bus.js";
import { AgentLifecycleManager } from "../registry/agent-lifecycle.js";
import { type AgentRef, AgentRegistry } from "../registry/agent-registry.js";
/** Filesystem and parser used by local and host-backed transcript viewers. */
export declare const agentTranscriptSource: AgentTranscriptSource;
/** Host services used by the roster, without exposing runtime implementation to tui. */
export declare function createAgentHubRuntime(options?: {
    registry?: AgentRegistry;
    lifecycle?: AgentLifecycleManager;
    irc?: IrcBus;
    activity?: AgentActivityIndex;
    remote?: AgentHubRemote;
    settings?: Settings;
    sessionFile?: string | null;
}): Pick<AgentHubDeps<AgentRef>, "registry" | "lifecycle" | "irc" | "activity" | "manageActivityLive" | "transcript" | "loadPersisted" | "getRoleInfo">;
/**
 * Agent Hub cost total for the main session's subagent tree (descendants
 * included). Excludes the main session's own advisors, which the status line
 * bills separately. Refs with a transcript count only inside `rootSessionFile`'s
 * artifacts tree (the process-global registry keeps earlier sessions' agents);
 * file-less refs count only while this session's observer tracks them.
 */
export declare function sumSubagentTreeCost(args: {
    refs: readonly AgentRef[];
    observers: SessionObserverRegistry;
    rootSessionFile: string | undefined;
    sessionMetrics: WeakMap<object, {
        metrics: AgentMetrics | undefined;
    }>;
}): number;
