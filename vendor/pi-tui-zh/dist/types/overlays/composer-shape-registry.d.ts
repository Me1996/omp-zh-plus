import { type ComposerStyle } from "../index.js";
import type { SubmenuOption } from "./settings-defs.js";
/** Composer shape id; extensions may register additional values at runtime. */
export type ComposerShape = string;
/** Built-in composer choices and their shared settings/setup copy. */
export declare const BUILTIN_COMPOSER_SHAPES: readonly [{
    readonly value: "band";
    readonly label: "Status Band (Default)";
    readonly description: "Flush soft-capped status band above a curved prompt, no frame";
}, {
    readonly value: "box";
    readonly label: "Rounded Box";
    readonly description: "Status line embedded in top border, compact 2-line prompt";
}, {
    readonly value: "claude";
    readonly label: "Claude Code";
    readonly description: "Full-width horizontal rules above and below, status line at bottom";
}, {
    readonly value: "pi";
    readonly label: "Pi";
    readonly description: "Framed horizontal rules with status line at bottom";
}, {
    readonly value: "borderless";
    readonly label: "Borderless";
    readonly description: "Clean prompt glyph with status line at bottom, no box borders";
}, {
    readonly value: "rule";
    readonly label: "Top Rule Dock";
    readonly description: "Single top rule with status docked onto it and below";
}, {
    readonly value: "field";
    readonly label: "Compact Field";
    readonly description: "Filled one-row field with accent end caps";
}, {
    readonly value: "rail";
    readonly label: "Accent Rail";
    readonly description: "Filled one-row field anchored by a single accent rail";
}];
/** Built-in composer ids used by tests and non-runtime consumers. */
export declare const COMPOSER_SHAPE_VALUES: ("band" | "borderless" | "box" | "claude" | "field" | "pi" | "rail" | "rule")[];
/** Visual composer style and selector copy registered by an extension. */
export interface ComposerShapeDefinition {
    label: string;
    description?: string;
    style: ComposerStyle;
}
/** Install one extension composer shape into rendering and selector registries. */
export declare function installExtensionComposerShape(definition: ComposerShapeDefinition): () => void;
/** Available built-in and extension composer choices in selector order. */
export declare function getComposerShapeOptions(): readonly SubmenuOption[];
