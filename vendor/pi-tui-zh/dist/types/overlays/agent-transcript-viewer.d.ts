/**
 * Fullscreen transcript viewer.
 *
 * `AgentHubOverlayComponent.openChat` mounts this as a `fullscreen` overlay
 * (`ui.showOverlay(..., { fullscreen: true })`), so it borrows the terminal's
 * alternate screen buffer (the vim/less idiom) and paints the whole screen — no
 * compositing into the live transcript's scrollback. It renders a parked
 * subagent / advisor / collab-guest transcript that has no live in-view session.
 *
 * Local transcripts tail append-only growth: unchanged file identity plus stable
 * sentinels means only newly appended JSONL is parsed and rendered. Rewrites,
 * truncation, rotation, or sentinel drift fall back to a full rebuild so changed
 * historical entries cannot leave stale components behind. Collab guests use the
 * same append path over the host's byte-capped transcript reads.
 */
import type * as fs from "node:fs";
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import type { Component, TUI } from "../tui.js";
import { type KeyId } from "../app-keybindings.js";
import type { MessageRenderer } from "../chat/extension-types.js";
import type { AgentLifecycleLike } from "./agent-hub-types.js";
import type { AgentHubRegistry } from "./agent-hub-types.js";
import type { SessionMessageEntryLike } from "../chat/transcript-entry.js";
import type { SessionObserverRegistry } from "./session-observer-registry.js";
import type { AgentHubRemote } from "./agent-hub.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
/** Parsed message and model metadata relevant to a transcript viewer. */
export type AgentTranscriptEntry = SessionMessageEntryLike | {
    type: "model_change";
    model: string;
};
/** Local filesystem and session parsing capabilities supplied by the host. */
export interface AgentTranscriptSource {
    fs: Pick<typeof fs, "openSync" | "closeSync" | "readSync" | "readFileSync" | "statSync">;
    parseEntries(text: string): AgentTranscriptEntry[];
}
export interface AgentTranscriptViewerDeps {
    agentId: string;
    transcript: AgentTranscriptSource;
    /** Persisted entry to reveal on first paint when opened from an activity row. */
    initialEntryId?: string;
    registry: AgentHubRegistry;
    /** Collab guest: read transcript from the host instead of a local file. */
    remote?: AgentHubRemote;
    /** Progress/cost snapshot source for the stats line. */
    observers?: SessionObserverRegistry;
    /** Revive+prompt path for messageable local agents. Lazy to avoid touching the global. */
    lifecycle?: () => AgentLifecycleLike;
    ui: TUI;
    getTool?: (name: string) => AgentTool | undefined;
    /** Whether the active registry entry came from a built-in factory. */
    isBuiltInTool?: (name: string) => boolean;
    getMessageRenderer?: (customType: string) => MessageRenderer | undefined;
    cwd: string;
    hideThinkingBlock?: () => boolean;
    proseOnlyThinking?: () => boolean;
    expandKeys: KeyId[];
    /** Keys that toggle the whole hub closed (app.agents.hub + app.session.observe). */
    hubKeys: KeyId[];
    requestRender: () => void;
    /** Close just this viewer (Esc), returning to the hub table. */
    onClose: () => void;
    /** Close this viewer AND the hub (hub-toggle keys). */
    onHubClose: () => void;
}
export declare class AgentTranscriptViewer implements Component {
    #private;
    constructor(deps: AgentTranscriptViewerDeps);
    dispose(): void;
    handleInput(data: string): void;
    render(width: number): readonly string[];
    /**
     * Header, transcript body (the builder's container, which describes its own
     * blocks), notice, message editor, stats and key hints. Scrolling is the
     * terminal's, so the j/k/g/G scroll hints are omitted.
     */
    describe(_cx: DescribeContext): NativeNode;
}
