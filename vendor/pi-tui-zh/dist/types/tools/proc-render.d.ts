import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import type { AgentActivitySnapshot, CoordinationDetails, JobSnapshot } from "./wait.js";
import type { DaemonSnapshot } from "./daemon.js";
import { type CardToolResult as ToolResult } from "./result-card.js";
export interface ProcReadDetails {
    jobs?: JobSnapshot[];
    agents?: AgentActivitySnapshot[];
    daemons?: DaemonSnapshot[];
    job?: JobSnapshot;
    daemon?: DaemonSnapshot;
    log?: string;
    terminalRows?: string[];
}
export type ProcWriteDetails = CoordinationDetails | {
    action: "stop" | "stdin" | "mode";
    daemon: DaemonSnapshot;
    input?: string;
    mode?: string;
};
/** Process operation selected by a write URL, independent of its content. */
export type ProcWriteAction = "stdin" | "mode" | "kill";
export declare function renderAgentWrite(to: string, body: string, result: ToolResult | undefined, details: CoordinationDetails | undefined, options: RenderResultOptions, theme: Theme): Component;
/** Render live and completed process writes with the URL-selected operation. */
export declare function renderProcWrite(id: string, action: ProcWriteAction, content: string | undefined, result: ToolResult | undefined, details: ProcWriteDetails | undefined, options: RenderResultOptions, theme: Theme): Component;
export declare function renderProcRead(id: string, result: ToolResult | undefined, details: ProcReadDetails | undefined, options: RenderResultOptions, theme: Theme): Component;
/** TSP view of an `agent://` write (IRC message). */
export declare function describeAgentWrite(to: string, body: string, result: ToolResult | undefined, details: CoordinationDetails | undefined): NativeToolView;
/** TSP view of a `proc://` write (stdin, mode change, kill). */
export declare function describeProcWrite(id: string, action: ProcWriteAction, content: string | undefined, result: ToolResult | undefined, details: ProcWriteDetails | undefined): NativeToolView;
/** TSP view of a `proc://` read: job/service detail, logs, or the process table. */
export declare function describeProcRead(id: string, result: ToolResult | undefined, details: ProcReadDetails | undefined): NativeToolView;
