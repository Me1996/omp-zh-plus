/**
 * Plain-text / markdown session formatting for `/dump` and `/advisor dump raw`.
 *
 * Renders a prelude (system prompt, model/thinking config, tool inventory)
 * followed by the message history as per-message markdown headings: `## User`,
 * `## Assistant` (with `<thinking>` blocks and `### Tool Call: <name>` + YAML
 * args), `### Tool Result: <name>`, and the execution/summary sections.
 * `/dump all` renders each persisted subagent as its own `# Subagent: <path>` document.
 */
import type { AgentMessage, ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Model, ToolExample } from "@oh-my-pi/pi-ai";
/** Minimal tool shape for dump output (matches AgentTool fields used by formatSessionDumpText). */
export interface SessionDumpToolInfo {
    name: string;
    description: string;
    parameters: unknown;
    examples?: readonly ToolExample[];
}
/** A persisted subagent transcript rendered as its own `/dump all` document. */
export interface SessionDumpSubagent {
    /** Slash-joined agent path relative to the main session, e.g. "Explore/Helper". */
    key: string;
    messages: readonly AgentMessage[];
    /** Persisted default-role model string ("provider/id"). */
    model?: string;
    thinkingLevel?: string;
    /** The subagent was explicitly killed before finishing. */
    aborted?: boolean;
}
export interface FormatSessionDumpTextOptions {
    messages: readonly AgentMessage[];
    systemPrompt?: readonly string[] | null;
    model?: Model | null;
    thinkingLevel?: ThinkingLevel | string | null;
    tools?: readonly SessionDumpToolInfo[];
    inlineToolDescriptors?: boolean;
}
/**
 * Format messages and session metadata as markdown/plain text (same as
 * AgentSession.formatSessionAsText / /dump).
 */
export declare function formatSessionDumpText(options: FormatSessionDumpTextOptions): string;
/**
 * Format one persisted subagent transcript. Subagent system prompts and tool
 * inventories are not persisted, so the header carries only model, thinking
 * level, and whether the agent was killed.
 */
export declare function formatSubagentDumpText(subagent: SessionDumpSubagent): string;
/** Result of writing a `/dump all` zip (see `AgentSession.dumpSessionArchiveToTmpDir`). */
export interface SessionDumpArchive {
    path: string;
    /** Archive member names in write order. */
    files: string[];
    subagentCount: number;
    /** Why subagent discovery failed; the main dump is archived regardless. */
    subagentError?: string;
}
/** Lines describing a `/dump all` archive: path, members, and any subagent discovery failure. */
export declare function formatDumpArchiveReport(archive: SessionDumpArchive): string[];
