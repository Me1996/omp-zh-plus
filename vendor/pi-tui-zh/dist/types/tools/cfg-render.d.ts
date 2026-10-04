/**
 * Transcript renderers for `cfg://` settings reads and writes.
 *
 * Reads show the YAML-ish settings listing the model received, highlighted as
 * YAML. Writes show the `previous → value` change, its scope (session or
 * saved), and whether the user approved it.
 */
import type { Component } from "../tui.js";
import { type Theme } from "../theme/theme.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import { type CardToolResult } from "./result-card.js";
/** Summary of a `cfg://` read, attached to read tool details. */
export interface CfgReadDetails {
    /** Dotted setting path or namespace that was read; empty for the whole tree. */
    path: string;
    /** Settings in the listing. */
    count: number;
    /** Listed settings whose effective value differs from the schema default. */
    modified: number;
}
/** How a `cfg://` write ended. */
export type CfgWriteOutcome = "applied" | "declined" | "unchanged";
/** A `cfg://` write, attached to write tool details. Values are display-formatted (credentials redacted). */
export interface CfgWriteDetails {
    path: string;
    /** Persisted to config.yml rather than scoped to the session. */
    save: boolean;
    previous: string;
    value: string;
    outcome: CfgWriteOutcome;
    /** Effective value after saving when a higher-precedence layer still shadows the saved one. */
    effective?: string;
}
/** Render `read cfg://…`: pending header, or the highlighted listing with counts. */
export declare function renderCfgRead(url: string, result: CardToolResult | undefined, details: CfgReadDetails | undefined, options: RenderResultOptions, theme: Theme): Component;
/** TSP view of `read cfg://…`: path and counts in the head, the listing as YAML. */
export declare function describeCfgRead(url: string, result: CardToolResult | undefined, details: CfgReadDetails | undefined): NativeToolView;
/** TSP view of `write cfg://…[/save]`: scope/outcome in the head, then `previous → value`. */
export declare function describeCfgWrite(url: string, content: string | undefined, result: CardToolResult | undefined, details: CfgWriteDetails | undefined): NativeToolView;
/** Render `write cfg://…[/save]`: the proposed value while pending, then the approved/declined change. */
export declare function renderCfgWrite(url: string, content: string | undefined, result: CardToolResult | undefined, details: CfgWriteDetails | undefined, options: RenderResultOptions, theme: Theme): Component;
