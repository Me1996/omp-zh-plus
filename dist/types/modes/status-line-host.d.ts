import type { StatusLineHost, StatusLineSession } from "@oh-my-pi/pi-tui-zh/status-line/host";
import type { AgentSession } from "../session/agent-session.js";
/**
 * Session capabilities the host consults beyond the display subset. Every
 * field is optional so display-only sessions (collab guest replicas, test
 * fixtures) still render; a live `AgentSession` satisfies it structurally.
 */
export type StatusLineHostSession = StatusLineSession & Partial<Pick<AgentSession, "settings" | "modelRegistry" | "sessionId" | "fetchUsageReports">>;
/** Application policy and runtime services consumed by the portable status renderer. */
export declare const statusLineHost: StatusLineHost<StatusLineHostSession>;
