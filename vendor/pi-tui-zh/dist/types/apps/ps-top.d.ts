import { type Component, TUI } from "../tui.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
import type { DaemonSnapshot, DaemonSpec } from "../tools/daemon.js";
import { type PsScope, type PsScopeReport, type PsTarget } from "./ps-data.js";
/** Options accepted by the interactive monitor: scope selection from the list flags. */
export interface PsTopOptions extends PsTarget {
    all: boolean;
}
/** Broker capabilities supplied by the process command. */
export interface PsTopHost {
    collectReports(all: boolean, target: PsTarget): Promise<PsScopeReport[]>;
    act(scope: PsScope, name: string, verb: "stop" | "kill" | "restart"): Promise<DaemonSnapshot>;
    describe(scope: PsScope, name: string): Promise<{
        daemon: DaemonSnapshot;
        spec: DaemonSpec;
    }>;
    logs(scope: PsScope, name: string, lines: number): Promise<{
        terminalRows?: string[];
        text: string;
        state: string;
    }>;
    close(): void;
}
/** Interactive process table and detail views. */
export declare class PsTopComponent implements Component {
    #private;
    constructor(ui: TUI, options: PsTopOptions, host: PsTopHost);
    run(): Promise<void>;
    dispose(): void;
    handleInput(data: string): void;
    /**
     * Pointer actions: a click selects a process, a double click opens its info
     * (Enter); the scope control switches between the current and all scopes;
     * the action bar runs the same code as the keys, except that a pointer
     * `Kill` asks first (the `x` key stays immediate).
     */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * The process monitor as a native page: a head (title, counts, the scope
     * control, freshness, close), one section per broker scope with a
     * selectable process list, the transient status, and an action bar that
     * mirrors the keys. Info and logs replace the list.
     */
    describe(): NativeNode;
    render(width: number): readonly string[];
}
/** Run the fullscreen interactive process monitor until the user quits. */
export declare function runPsTop(options: PsTopOptions, host: PsTopHost): Promise<void>;
