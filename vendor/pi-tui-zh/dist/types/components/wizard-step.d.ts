import type { MouseRoutable, SgrMouseEvent } from "../mouse.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Semantic role of a wizard step's primary interactive content. */
export type WizardStepKind = "input" | "choice" | "confirm" | "async" | "custom";
/** A component slot rendered by {@link WizardStep}. */
export interface WizardStepSlot {
    readonly component: Component;
    /** Omit this slot when retaining it would squeeze content below `minContentLines`. */
    readonly optional?: boolean;
}
/** Composition and height policy for a single wizard step. */
export interface WizardStepOptions {
    readonly kind: WizardStepKind;
    readonly content: Component;
    readonly heading?: Component;
    readonly intro?: Component;
    readonly preview?: WizardStepSlot;
    readonly status?: Component;
    readonly footer?: Component;
    /** Blank rows inserted between non-empty slots. Defaults to one. */
    readonly gap?: number;
    /** Minimum useful content height used when deciding whether to show an optional preview. */
    readonly minContentLines?: number;
    /** Resize content-owned viewports before their next render. */
    readonly fitContent?: (maxLines: number | undefined) => void;
}
/**
 * Reusable presentation for input, choice, confirmation, and asynchronous
 * wizard steps. Controllers retain state transitions; this component owns the
 * ordered slots, bounded content budget, optional-preview collapse, and mouse
 * coordinate translation into the interactive content child.
 */
export declare class WizardStep implements Component, MouseRoutable {
    #private;
    readonly debugKind = "WizardStep";
    constructor(options: WizardStepOptions);
    get debugChildren(): readonly Component[];
    debugState(): Record<string, unknown>;
    /** Update the semantic role exposed through debug state. */
    setKind(kind: WizardStepKind): void;
    /** Replace or remove the heading slot without rebuilding the step. */
    setHeading(heading: Component | undefined): void;
    /** Replace or remove the introductory slot without rebuilding the step. */
    setIntro(intro: Component | undefined): void;
    /** Replace or remove the preview slot without rebuilding the step. */
    setPreview(preview: WizardStepSlot | undefined): void;
    /** Replace the interactive content while retaining layout and height state. */
    setContent(content: Component): void;
    /** Replace or remove the status slot without rebuilding the step. */
    setStatus(status: Component | undefined): void;
    /** Replace or remove the footer slot without rebuilding the step. */
    setFooter(footer: Component | undefined): void;
    /** Bound the complete step, including heading, preview, status, and footer. */
    setMaxHeight(maxHeight: number | undefined): void;
    invalidate(): void;
    dispose(): void;
    handleInput(data: string): void;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    /**
     * The slots in order as a spaced `col`; the height budget and optional
     * preview collapse are the terminal's (it scrolls instead of clipping).
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
