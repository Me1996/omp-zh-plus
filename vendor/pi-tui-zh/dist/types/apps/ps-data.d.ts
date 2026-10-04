import type { DaemonSnapshot, DaemonSpec, DaemonState } from "../tools/daemon.js";
/** One broker scope: a project runtime dir or a machine-global service dir. */
export interface PsScope {
    kind: "project" | "global";
    runtimeDir: string;
    /** Canonical project dir when known; used to connect and displayed as the scope label. */
    projectDir?: string;
    /** Global service name (`kind === "global"`). */
    service?: string;
    /** Live broker PID; undefined when no broker owns the scope. */
    brokerPid?: number;
}
/** One process snapshot and its table display metadata. */
export interface PsDaemonRow {
    snapshot: DaemonSnapshot;
    /** Launch command from the persisted spec, when readable. */
    command?: string;
    cwd?: string;
    /** False when the snapshot came from disk with no live broker supervising it. */
    supervised: boolean;
}
/** Process rows grouped under their owning broker scope. */
export interface PsScopeReport {
    scope: PsScope;
    daemons: PsDaemonRow[];
}
/** Scope selector shared by every ps action: current project, `--dir`, or `--global`. */
export interface PsTarget {
    dir?: string;
    global?: string;
}
/** Process states without a running process or live uptime. */
export declare const TERMINAL_STATES: Partial<Record<DaemonState, true>>;
/** Combine an executable and its arguments for display. */
export declare function formatCommand(spec: DaemonSpec | undefined): string | undefined;
/** Collapse a launch command to one display line (inline scripts embed newlines/tabs). */
export declare function collapseCommand(command: string | undefined): string;
/** One-line daemon summary used by action results and detail views. */
export declare function daemonLabel(daemon: DaemonSnapshot): string;
/** Colored STATE cell, e.g. `ready`, `exited(143)`. */
export declare function stateCell(row: PsDaemonRow): string;
/** Display persistence and supervision flags for a process row. */
export declare function flagsCell(row: PsDaemonRow): string;
/** Display elapsed runtime, or a dash for a terminal process. */
export declare function uptimeCell(snapshot: DaemonSnapshot): string;
/** Labels aligned with the process table's display cells. */
export declare const TABLE_HEADER: string[];
/** Raw (possibly colored) cells for one daemon row, aligned with {@link TABLE_HEADER}. */
export declare function tableCells(row: PsDaemonRow): string[];
/** Scope heading, e.g. `project /work/pi — broker pid 1234`. */
export declare function scopeHeader(scope: PsScope): string;
