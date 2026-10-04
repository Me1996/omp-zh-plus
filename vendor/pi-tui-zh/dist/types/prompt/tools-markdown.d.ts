export interface ToolsMarkdownBindings {
    tools: ReadonlyArray<{
        description: string;
        name: string;
    }>;
    /** Tools mounted under `xd://` URLs, listed after the active set. */
    xdevTools?: ReadonlyArray<{
        name: string;
        summary: string;
    }>;
}
export declare function buildToolsMarkdown(bindings: ToolsMarkdownBindings): string;
