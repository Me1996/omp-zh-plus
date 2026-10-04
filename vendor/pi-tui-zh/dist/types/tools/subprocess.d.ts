import type { Component } from "../tui.js";
import type { Theme } from "../theme/theme.js";
import { type TaskToolDetails } from "./task.js";
/** Display callbacks for structured data extracted from a child agent tool. */
export interface SubprocessToolRenderer<TData = unknown> {
    /**
     * Render a single data item inline during streaming progress.
     * Called for each tool execution end event.
     */
    renderInline?: (data: TData, theme: Theme) => Component;
    /**
     * Render accumulated data in the final result view.
     * Called once with all accumulated data for this tool.
     */
    renderFinal?: (allData: TData[], theme: Theme, expanded: boolean) => Component;
}
/** Renders nested task results extracted from child agents. */
export declare const taskSubprocessRenderer: {
    renderFinal(allData: TaskToolDetails[], theme: Theme, expanded: boolean): Component;
};
/** Registers the display callbacks for a subprocess tool without its execution handler. */
export declare function registerSubprocessToolRenderer<T>(toolName: string, renderer: SubprocessToolRenderer<T>): void;
/** Looks up the display callbacks for a subprocess tool. */
export declare function getSubprocessToolRenderer(toolName: string): SubprocessToolRenderer | undefined;
