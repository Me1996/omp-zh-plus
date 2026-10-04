import type { SourceMeta } from "./types.js";
/**
 * A system prompt customization file.
 */
export interface SystemPrompt {
    /** Absolute path to the file */
    path: string;
    /** File content */
    content: string;
    /**
     * Literal text rendered through the bundled custom template, or raw
     * Handlebars source rendered with the default prompt's live context.
     * Defaults to `"text"` when unset.
     */
    kind?: "text" | "template";
    /** Which level this came from */
    level: "user" | "project";
    /** Source metadata */
    _source: SourceMeta;
}
export declare const systemPromptCapability: import("./types.js").Capability<SystemPrompt>;
