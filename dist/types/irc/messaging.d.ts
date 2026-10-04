import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { IrcMessage } from "@oh-my-pi/pi-tui-zh/tools/irc";
import type { CoordinationDetails } from "@oh-my-pi/pi-tui-zh/tools/wait";
import type { Settings } from "../config/settings.js";
import { type AgentRegistry } from "../registry/agent-registry.js";
/** Messaging is available to subagents and to top-level sessions able to spawn peers. */
export declare function isIrcEnabled(settings: Settings, taskDepth: number): boolean;
export declare function formatIncoming(msg: IrcMessage): string;
/** Session-buffered inbox drain used before parking a bus waiter. */
export declare function drainPendingInbox(registry: AgentRegistry, senderId: string, from?: string): IrcMessage | undefined;
/** `wait` result carrying a consumed message. */
export declare function messageResult(senderId: string, waited: IrcMessage): AgentToolResult<CoordinationDetails>;
/** Send a direct message or broadcast; delivery never waits for a reply. */
export declare function executeSend(deps: {
    registry: AgentRegistry;
    senderId: string;
    sessionFileHint?: string | null;
}, params: {
    to: string;
    message: string;
}): Promise<AgentToolResult<CoordinationDetails>>;
