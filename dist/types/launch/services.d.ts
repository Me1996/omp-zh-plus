import type { DaemonSnapshot } from "@oh-my-pi/pi-tui-zh/tools/daemon";
import type { DaemonRpcResult } from "./protocol.js";
import type { ToolSession } from "../tools/index.js";
export interface ServiceReady {
    log?: string;
    port?: number;
    host?: string;
    timeout?: number;
}
export interface ServiceStart {
    name: string;
    command: string;
    cwd?: string;
    pty?: boolean;
    ready?: ServiceReady;
}
export declare function hasLiveOwnedService(session: ToolSession): boolean;
export declare function waitForOwnedServiceCompletion(session: ToolSession, signal?: AbortSignal): Promise<void>;
export declare function listServices(session: ToolSession, signal?: AbortSignal): Promise<DaemonSnapshot[]>;
/**
 * {@link listServices} for callers whose jobs and agents live in-process (`wait`,
 * `proc://`): a broker failure (timeout, crash) must not hide that state. Returns
 * the failure message alongside an empty list; owned-service tracking keeps its
 * last known state. A caller abort still throws.
 */
export declare function listServicesTolerant(session: ToolSession, signal?: AbortSignal): Promise<{
    services: DaemonSnapshot[];
    error?: string;
}>;
export declare function findService(session: ToolSession, name: string, signal?: AbortSignal): Promise<DaemonSnapshot | undefined>;
export declare function serviceLogPath(session: ToolSession, name: string): Promise<string>;
/** Render legacy broker PTY bytes outside the client process. */
export declare function renderServiceLogTerminalRows(result: Extract<DaemonRpcResult, {
    op: "logs";
}>, lines?: number): Promise<string[] | undefined>;
export declare function serviceLogsWithRows(session: ToolSession, name: string, signal?: AbortSignal): Promise<{
    text: string;
    terminalRows?: string[];
}>;
export declare function serviceLogs(session: ToolSession, name: string, signal?: AbortSignal): Promise<string>;
export declare function startService(session: ToolSession, params: ServiceStart, signal?: AbortSignal): Promise<{
    daemon: DaemonSnapshot;
    readyTimedOut: boolean;
    log: string;
}>;
export declare function sendService(session: ToolSession, name: string, content: string, signal?: AbortSignal): Promise<DaemonSnapshot>;
export declare function stopService(session: ToolSession, name: string, signal?: AbortSignal): Promise<DaemonSnapshot>;
export declare function modeService(session: ToolSession, name: string, mode: "persist" | "session" | "detached", signal?: AbortSignal): Promise<DaemonSnapshot>;
export declare function serviceStatus(daemon: DaemonSnapshot): string;
