import type { TspText } from "@oh-my-pi/pi-wire";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
import type { Component } from "../tui.js";
/** Options of a {@link ReportPanel}. */
export interface ReportPanelOptions {
    /** Plain title: the text-mode border title, and the native sheet head unless {@link head} is given. */
    readonly title: string;
    /** Styled native sheet head. */
    readonly head?: TspText;
    /** The read-only report; it draws no frame or title of its own. */
    readonly body: Component;
    /**
     * Display form of the key that dismisses the report while it sits above the
     * editor (the editor's interrupt key, which routes to it). Once the panel
     * holds focus ({@link ReportPanel.holdFocus}) the hint shows the key its own
     * input closes on instead.
     */
    readonly closeKey: string;
    /** The focused panel (native sheet, text-mode full-screen page) closes on Esc / its Close button: this runs. */
    readonly onClose: () => void;
    /**
     * Most rows the text-mode panel may take, borders included (the screen rows
     * left above the editor); a taller report scrolls inside it. `undefined`
     * leaves it uncapped.
     */
    readonly maxRows?: () => number | undefined;
}
/**
 * A read-only command report (`/changelog`, `/context`, `/tools`, …).
 *
 * Text mode draws a titled box with the body and an Esc hint: above the editor
 * like the `/btw` panel while it fits there (the editor keeps focus and its
 * Esc takes it away), or as a full-screen page on the alternate screen when it
 * is taller, whose body scrolls on the arrow/page/Home/End keys and the wheel.
 * Natively it is a sheet like `/usage`: a centred `lg` glass sheet titled by
 * the report whose body the terminal scrolls (wheel, and the same keys
 * forwarded as scroll requests), then a Close button; Esc closes it.
 */
export declare class ReportPanel extends OverlayPanel {
    #private;
    readonly nativeOverlay: NonNullable<Component["nativeOverlay"]>;
    constructor(options: ReportPanelOptions);
    /**
     * The panel is shown with focus (native sheet, text-mode full-screen page):
     * its own {@link handleInput} closes it, so the hint names that key.
     */
    holdFocus(): void;
    /**
     * Text mode: cap the box to {@link ReportPanelOptions.maxRows}, scrolling a
     * taller body. The cap is a hard limit: when a resize leaves fewer rows than
     * the box's chrome needs, its bottom (the hint and closing border) is cut
     * rather than spilling over the editor.
     */
    render(width: number): readonly string[];
    /** Text mode: rows the whole box takes at `width` when nothing caps it. */
    heightAt(width: number): number;
    /** The sheet body (the overlay is the frame, and its body the scroller): the report, then Close (Esc). */
    describe(): NativeNode;
    invalidate(): void;
    /**
     * Focused (the native sheet, or the text-mode full-screen page): Esc closes;
     * the arrow, page, Home and End keys and the wheel scroll the body.
     */
    handleInput(data: string): void;
    /** Close runs what Esc runs. */
    handleNativeEvent(event: NativeUiEvent): void;
}
