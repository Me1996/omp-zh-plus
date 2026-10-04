import type { Component } from "../tui.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/** One async job as the session snapshots it. */
export interface JobsPanelJob {
    readonly id: string;
    readonly type: string;
    readonly status: "running" | "completed" | "failed" | "cancelled";
    readonly label: string;
    readonly startTime: number;
    readonly endTime?: number;
    /** Registry id of the subagent a task job runs. */
    readonly agentId?: string;
}
/** Running and recently settled jobs. */
export interface JobsPanelSnapshot {
    readonly running: readonly JobsPanelJob[];
    readonly recent: readonly JobsPanelJob[];
}
/** What the sheet shows about the selected job beyond its row. */
export interface JobsPanelDetail {
    /** Full command line of a job that runs a process (rows show the cut label). */
    readonly command?: string;
    readonly cwd?: string;
    /** Live pids the job's command spawned. */
    readonly pids: readonly number[];
    readonly exitCode?: number;
    /** Output tail while running; the final text once settled. */
    readonly output?: string;
    /** Artifact holding the full output when `output` is cut. */
    readonly artifactId?: string;
}
/** The session behind a {@link JobsSheet}. */
export interface JobsSheetSource {
    /** Current jobs; runs once per frame. */
    load(): JobsPanelSnapshot;
    /** The selected job's detail; runs once per frame, undefined once the job is gone. */
    inspect(id: string): JobsPanelDetail | undefined;
    /** Cancel a running job. */
    cancel(id: string): void;
    /** Dismiss the sheet. */
    close(): void;
}
/**
 * The jobs pill's sheet: a centred `lg` glass sheet titled Background jobs.
 * A selectable list of every job (running first) sits over the selected
 * job's detail: status and live elapsed (a task job's `agent` node), cwd,
 * live pids, exit code, the full command and a tail-following output pane.
 * It re-reads the session every frame, so the caller re-renders it on a
 * timer while it is open. ↑/↓ select, X cancels the selected running job,
 * Esc or Close dismisses; nothing enters the transcript.
 */
export declare class JobsSheet implements Component {
    #private;
    readonly nativeOverlay: {
        readonly role: "omp.overlay.jobs";
        readonly size: "lg";
        readonly anchor: "center";
        readonly head: "Background jobs";
    };
    constructor(source: JobsSheetSource);
    describe(cx: DescribeContext): NativeNode;
    /** Rows for a terminal without the native surface: one per job, then the selected job's facts and output tail. */
    render(width: number): readonly string[];
    invalidate(): void;
    handleInput(data: string): void;
    /** Clicks select a row; Close and Cancel job run what Esc and X run. */
    handleNativeEvent(event: NativeUiEvent): void;
}
