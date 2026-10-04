import type { NativeNode } from "./native/node.js";
/**
 * The native form of {@link latexToBlock}: the TeX source as a `math` node
 * the terminal typesets (display style by default, `display: false` for
 * inline `$…$` math).
 */
export declare function describeLatex(src: string, display?: boolean): NativeNode;
/**
 * Render a display LaTeX math fragment to lines with full 2-D layout: stacked
 * fractions, stretchy delimiters, matrix grids, operator limits, drawn
 * radicals. Top-level source newlines and `\\` become vertical rows (so a
 * `lhs =` line stays above its block). Inline math should use `latexToUnicode`
 * instead — fractions there stay single-line.
 */
export declare function latexToBlock(src: string): string[];
