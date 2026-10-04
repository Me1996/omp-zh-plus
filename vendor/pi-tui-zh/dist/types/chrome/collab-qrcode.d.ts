import type { Component } from "../tui.js";
import type { AnimationFrame, TranscriptPresentationTarget } from "./transcript-container.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
/** Scheme-less display form of a collab browser deep link, OSC-8 linked. */
export declare function collabBrowserLink(webLink: string, label?: string): string;
/**
 * One-shot transcript block that prints a collab browser-join URL as a
 * scannable QR code. The symbol is encoded once at construction (byte mode,
 * EC level M) and rendered as ANSI half-blocks; on terminals too narrow for
 * the symbol it degrades to a one-line hint that includes the URL.
 *
 * The transcript viewport can also clip a live block to a single row under
 * pressure (many short settled blocks — typical when thinking is a one-line
 * summary rather than a tall trace). The QR's first/last rows are a white
 * quiet zone, so a 1-row clip looks like an empty white line. When the
 * allocated height cannot fit the full symbol, degrade to the same hint.
 * The sibling `/collab` status heading can also collapse to its first row
 * under that pressure, so the hint must carry the URL itself — "use the
 * URL above" is not reachable.
 */
export declare class CollabQrCodeComponent implements Component, TranscriptPresentationTarget {
    #private;
    readonly url: string;
    constructor(url: string);
    setTranscriptAllocation(rows: number, _frame?: AnimationFrame): void;
    render(width: number): readonly string[];
    /**
     * The symbol as an unwrapped monospace block plus the join link. Glyphs are
     * drawn in the terminal's foreground, so on a dark appearance the light
     * modules are inked to keep the dark-on-light symbol scanners expect.
     */
    describe(cx: DescribeContext): NativeNode;
    /** Survives emergency 1-row transcript pressure when this block is otherwise hidden. */
    renderTranscriptBlockEmergencyRow(width: number): string;
}
