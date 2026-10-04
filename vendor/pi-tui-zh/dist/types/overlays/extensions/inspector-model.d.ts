import { type Extension, type ExtensionState } from "./types.js";
export interface LiveToolRecord {
    name: string;
    label?: string;
    description?: string;
    parameters?: unknown;
    hidden?: boolean;
    loadMode?: "essential" | "discoverable";
    /** Origin class from session `ToolInfo.sourceInfo.source`. */
    source?: "builtin" | "mcp" | "sdk" | "extension";
    /** Originating module path when the session actually has one. */
    sourcePath?: string;
}
export interface ToolRuntimeSource {
    getLiveTool(name: string): LiveToolRecord | undefined;
    listLiveTools?(): LiveToolRecord[];
}
export interface ToolParamView {
    name: string;
    type: string;
    required: boolean;
    flag: string;
    description?: string;
}
export interface CommandPreview {
    description?: string;
    body: string;
    argumentHint?: string;
    usesArguments: boolean;
}
export declare function isPlaceholderToolDescription(name: string, description: string | undefined): boolean;
/** First JSDoc on a custom-tool file, minus symlink footnotes. */
export declare function parseToolFileHeader(source: string): string | undefined;
export interface ExtensionInspectorSource {
    readToolHeader?(filePath: string): string | undefined;
    /** Optional application parser for raw frontmatter; otherwise fields must already be normalized. */
    parseRule?(raw: Record<string, unknown>): {
        condition?: string[];
        astCondition?: string[];
        scope?: string[];
        agents?: string[];
    };
}
/** Display fields already parsed from command frontmatter. */
export declare function slashCommandFrontmatterDisplay(frontmatter: Record<string, unknown>): {
    description?: string;
    argumentHint?: string;
};
export declare function commandPreview(content: string | undefined): CommandPreview;
export declare function toolParamsFromSchema(schema: unknown): ToolParamView[];
export declare function liveToolsForExtension(ext: Extension, source: ToolRuntimeSource | undefined): LiveToolRecord[];
export declare function liveToolDetail(live: LiveToolRecord | undefined): string | undefined;
/** Project-local items only. Uses the directory that contains `.omp`, when present. */
export declare function projectListHint(ext: Extension): string | undefined;
export declare function joinListHints(...parts: Array<string | undefined>): string | undefined;
export declare function formatExtensionListHint(ext: Extension, lives?: LiveToolRecord[]): string | undefined;
export declare function toolInspectorData(ext: Extension, lives: LiveToolRecord[], source?: ExtensionInspectorSource): {
    label?: string;
    description?: string;
    params: ToolParamView[];
    runtimeDetail?: string;
    factory: LiveToolRecord[];
};
export declare function ruleInspectorData(ext: Extension, source?: ExtensionInspectorSource): {
    description?: string;
    alwaysApply: boolean;
    globs?: string[];
    condition?: string[];
    astCondition?: string[];
    scope?: string[];
    agents?: string[];
    interruptMode?: string;
    content: string;
    runtimeDetail?: string;
};
export declare function skillInspectorData(ext: Extension): {
    description?: string;
    content: string;
    globs?: string[];
    alwaysApply: boolean;
    hidden: boolean;
    runtimeDetail?: string;
};
export declare function commandInspectorData(ext: Extension): {
    description?: string;
    body: string;
    argumentHint?: string;
    usesArguments: boolean;
    runtimeDetail?: string;
};
export declare function hookInspectorData(ext: Extension): {
    hookType?: string;
    tool?: string;
    runtimeDetail?: string;
};
export declare function promptInspectorData(ext: Extension): {
    content: string;
    runtimeDetail?: string;
};
export declare function instructionInspectorData(ext: Extension): {
    content: string;
    applyTo?: string;
    runtimeDetail?: string;
};
export declare function contextInspectorData(ext: Extension): {
    content: string;
    runtimeDetail?: string;
};
export declare function enablementLabel(state: ExtensionState, reason?: string, shadowedBy?: string): string;
