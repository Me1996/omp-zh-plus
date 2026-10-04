import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { Component } from "../tui.js";
/** A component slot; factory slots are constructed only when their branch is first rendered. */
export type DisclosureSlot = Component | (() => Component);
/** Options for a controlled, compositional disclosure. */
export interface DisclosureOptions {
    /** Content rendered in both collapsed and expanded states. */
    summary?: DisclosureSlot;
    /** Optional collapsed-only preview. */
    collapsedBody?: DisclosureSlot;
    /** Expanded-only content. A factory keeps expensive children lazy. */
    body: () => Component;
    /** Initial controlled state. Subsequent changes go through {@link Disclosure.setExpanded}. */
    expanded?: boolean;
    /** Horizontal padding applied outside every rendered slot. */
    paddingX?: number;
    /** Maximum physical rows retained from the collapsed-only preview, including its hint row. */
    maxCollapsedRows?: number;
    /** Build the final row when {@link DisclosureOptions.maxCollapsedRows} hides preview rows. */
    collapsedHint?: (hiddenRows: number, width: number) => string;
}
/**
 * Controlled summary/detail composition for transcript and overlay surfaces.
 *
 * The expanded body is constructed on its first expanded render, not when the
 * disclosure is created or toggled. Materialized children are retained across
 * collapse/re-expand cycles, invalidated and disposed with the disclosure, and
 * their immutable render arrays are copied rather than mutated.
 */
export declare class Disclosure implements Component {
    #private;
    constructor(options: DisclosureOptions);
    /** Current controlled expansion state. */
    get expanded(): boolean;
    /** Show or hide the lazily constructed detail body. */
    setExpanded(expanded: boolean): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    debugState(): Record<string, unknown>;
    get debugChildren(): readonly Component[];
    /**
     * A collapsible `section`. The summary (and, while collapsed, the preview)
     * form the always-visible header child; the lazily built body is the
     * section body and is only materialized once expanded.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** Mirror the terminal-local toggle into the controlled state. */
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
