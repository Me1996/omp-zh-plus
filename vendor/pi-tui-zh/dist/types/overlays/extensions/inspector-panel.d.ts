import type { Component } from "../../tui.js";
import type { NativeNode } from "../../native/node.js";
import { type ExtensionInspectorSource, type ToolRuntimeSource } from "./inspector-model.js";
import { type MCPRuntimeSource } from "./mcp-runtime.js";
import { type Extension } from "./types.js";
export type { ToolRuntimeSource };
export declare class InspectorPanel implements Component {
    #private;
    constructor(source?: ExtensionInspectorSource);
    setExtension(extension: Extension | null): void;
    setMcpSource(source: MCPRuntimeSource | undefined): void;
    setToolSource(source: ToolRuntimeSource | undefined): void;
    setHeight(height: number): void;
    isExpanded(): boolean;
    toggleExpanded(): boolean;
    invalidate(): void;
    render(width: number): readonly string[];
    /**
     * The selected extension as native preview nodes, in the same order as
     * {@link render}: identity, runtime/enablement and origin facts,
     * description, guidance, kind sections, content preview, config. The
     * collapsed budgets follow {@link toggleExpanded} like the ANSI view.
     */
    describePreview(): NativeNode[];
}
