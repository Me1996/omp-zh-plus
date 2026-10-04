/**
 * Line-based status cards shared by the internal-URL renderers (`proc://`,
 * `agent://`, `cfg://`): a header plus sanitized, width-truncated body lines.
 */
import type { Component } from "../tui.js";
import type { RenderResultOptions } from "./renderer.js";
/** Tool result fields the card renderers read. */
export interface CardToolResult {
    content: Array<{
        type: string;
        text?: string;
    }>;
    isError?: boolean;
}
/** First text block of a tool result, or `""`. */
export declare function firstText(result: CardToolResult): string;
/** Sanitize one display line: tabs become spaces, carriage returns are dropped. */
export declare function safe(value: string): string;
/** Padded card whose lines are sanitized and truncated, re-rendered when the expanded state flips. */
export declare function card(lines: (width: number, expanded: boolean) => string[], options: RenderResultOptions): Component;
