import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import { type ExperimentState } from "../tools/autoresearch.js";
/** Experiment runtime fields rendered by the dashboard. */
export interface AutoresearchDashboardRuntime {
    autoresearchMode: boolean;
    dashboardExpanded: boolean;
    state: ExperimentState;
    lastRunSummary: {
        runNumber: number;
        passed: boolean;
        parsedPrimary: number | null;
    } | null;
    runningExperiment: {
        startedAt: number;
        command: string;
    } | null;
}
/** Widget and overlay capabilities supplied by an extension context. */
export interface AutoresearchDashboardHost {
    hasUI: boolean;
    ui: {
        setWidget(key: string, content: ((tui: {
            requestRender(): void;
        }, theme: Theme) => Component) | undefined): void;
        custom<T>(factory: (tui: {
            requestRender(): void;
        }, theme: Theme, keybindings: unknown, done: (result: T) => void) => Component, options?: {
            overlay: boolean;
        }): Promise<T>;
    };
}
/** Dashboard lifecycle and rendering controls. */
export interface DashboardController {
    clear(ctx: AutoresearchDashboardHost): void;
    requestRender(): void;
    showOverlay(ctx: AutoresearchDashboardHost, runtime: AutoresearchDashboardRuntime): Promise<void>;
    updateWidget(ctx: AutoresearchDashboardHost, runtime: AutoresearchDashboardRuntime): void;
}
/** Create a dashboard backed by the host's widget and overlay surfaces. */
export declare function createDashboardController(): DashboardController;
/** Render experiment progress and result rows at the requested width. */
export declare function renderDashboardLines(runtime: AutoresearchDashboardRuntime, width: number, theme: Theme, maxRows: number): string[];
