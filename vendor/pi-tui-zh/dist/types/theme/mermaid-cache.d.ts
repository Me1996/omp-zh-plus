import type { MermaidRenderOptions } from "@oh-my-pi/pi-natives";
/**
 * Options controlling how fenced Mermaid source is resolved to terminal ASCII.
 * Extends the raw render options (theme, color mode, spacing, `useAscii`) with a
 * viewport-fitting hint.
 */
export interface MermaidResolveOptions extends MermaidRenderOptions {
    /**
     * Maximum display width (terminal columns) the diagram should occupy.
     * Flowcharts are also rendered top-down and left-to-right. A resize picks
     * the shortest variant that fits; if none fit, the narrowest, which the
     * caller may still clip. Omit to keep the source's own layout.
     */
    maxWidth?: number;
}
/**
 * Resolve mermaid ASCII from fenced block source text.
 * Returns null when rendering fails, while memoizing failures to avoid repeated work.
 */
export declare function resolveMermaidAscii(source: string, options?: MermaidResolveOptions): string | null;
/**
 * Clear the mermaid cache.
 */
export declare function clearMermaidCache(): void;
