import type { ToolRenderer } from "./renderer.js";
export * from "./renderer.js";
/** Renderers keyed by tool name (plus `apply_patch`/`reject` aliases that share a renderer). */
export declare const toolRenderers: Record<string, ToolRenderer>;
