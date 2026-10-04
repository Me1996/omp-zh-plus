import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage, ToolCall } from "@oh-my-pi/pi-ai";
import type { TtsrMatchContext, TtsrOutput } from "../export/ttsr.js";
/** Tool surface TTSR reads: identity plus the optional matcher hooks. */
export type TtsrTool = Pick<AgentTool, "name" | "customWireName" | "matcherPaths" | "matcherDigest" | "matcherEntries">;
/** Resolves tool calls against live tool definitions and the session cwd. */
export declare class TtsrToolInspector {
    #private;
    constructor(tools: () => readonly TtsrTool[], cwd: () => string);
    /** Match context for a (possibly still streaming) tool call. */
    matchContext(toolCall: ToolCall | undefined, contentIndex: number): TtsrMatchContext;
    /** Combined reconstructed source snapshot, for tools exposing `matcherDigest`. */
    digest(toolCall: ToolCall | undefined): string | undefined;
    /** Per-file source snapshots, for tools exposing `matcherEntries`. */
    entries(toolCall: ToolCall | undefined): readonly {
        path: string;
        digest: string;
    }[] | undefined;
    /** Narrows a tool-call context to one touched file with its own stream key. */
    perFileContext(base: TtsrMatchContext, filePath: string): TtsrMatchContext;
    /**
     * Completed outputs of one assistant message: all text as one reply, all
     * thinking as one reasoning output, and each tool call — split per file when
     * the tool reports entries, else its digest or serialized arguments.
     */
    outputs(message: AssistantMessage): TtsrOutput[];
}
