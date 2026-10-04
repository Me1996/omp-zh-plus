export interface LiveToolInfo {
    name: string;
    sourceInfo: {
        source: string;
        path?: string;
    };
}
import type { LiveToolRecord, ToolRuntimeSource } from "./inspector-model.js";
/** Session methods the `/extensions` live-tool join actually uses. */
export interface LiveToolSessionLookup {
    getToolByName(name: string): {
        name: string;
        label?: string;
        description?: string;
        parameters?: unknown;
        hidden?: boolean;
        loadMode?: "essential" | "discoverable";
    } | undefined;
    getAllToolInfos(): LiveToolInfo[];
}
/** Convert an already-fetched ToolInfo plus the registered tool. */
export declare function liveToolRecordFromInfo(session: LiveToolSessionLookup, info: LiveToolInfo): LiveToolRecord | undefined;
/** One-name lookup. Obtains a fresh ToolInfo snapshot for that name. */
export declare function liveToolRecordFromSession(session: LiveToolSessionLookup, name: string): LiveToolRecord | undefined;
/** List every live tool. Calls `getAllToolInfos()` once. */
export declare function listLiveToolRecords(session: LiveToolSessionLookup): LiveToolRecord[];
/** One list snapshot for a dashboard/list/inspector render. Not a persistent cache. */
export declare function snapshotToolRuntimeSource(source: ToolRuntimeSource | undefined): ToolRuntimeSource | undefined;
