import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Explicit heading/rule/spacing policy for a data section. */
export interface SectionOptions {
    readonly title: string;
    readonly body: Component | readonly string[];
    readonly titleStyle?: (text: string) => string;
    readonly ruleStyle?: (text: string) => string;
    readonly ruleGlyph: string;
    readonly ruleWidth: number | "fill";
    readonly blankAfter?: boolean;
}
/** Compose a width-bounded heading, rule, child rows, and optional trailing blank line. */
export declare class Section implements Component {
    #private;
    constructor(options: SectionOptions);
    invalidate(): void;
    dispose(): void;
    /** A `section` headed by the styled title; the rule is the terminal's. */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
