/**
 * Fullscreen /agents hub, shown on the alternate screen like /models.
 *
 * Layout mirrors the model hub: a sidebar of scopes (All agents, per-source
 * groups, "+ New agent"), a body listing agents with type-to-filter search,
 * and a footer that turns into a chip strip while configuring. Enter on an
 * agent opens its property strip (enabled / model / prewalk / advisor); a
 * property opens a value strip whose "pick model…" chip dives into the real
 * ModelBrowser and whose "pattern…" chip opens an inline pattern input, so
 * every per-agent knob is picked instead of memorized.
 */
import type { Model } from "@oh-my-pi/pi-ai";
import { type Component, type TUI } from "../index.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { AgentSource } from "../tools/task.js";
import { type ModelBrowserSource } from "./model-browser.js";
/** One agent with its per-agent settings overrides resolved for display. */
export interface HubAgent {
    name: string;
    description: string;
    systemPrompt: string;
    source: AgentSource;
    filePath?: string;
    model?: string[];
    prewalk?: boolean | string;
    advisor?: boolean | string;
    disabled: boolean;
    /** `task.agentModelOverrides[name]` as a comma-joined pattern list. */
    overrideModel?: string;
    /** `task.agentPrewalk[name]`: "on", "off", or a model pattern. */
    prewalkOverride?: string;
    /** `task.agentAdvisor[name]`: "on", "off", or a model pattern. */
    advisorOverride?: string;
}
/** The per-agent knob a strip or the model browser is editing. */
export type PropertyKind = "model" | "prewalk" | "advisor";
export interface GeneratedAgentSpec {
    identifier: string;
    whenToUse: string;
    systemPrompt: string;
}
/** Runtime-owned discovery, settings, generation and persistence. */
export interface AgentsHubDeps {
    browserSource: ModelBrowserSource;
    loadAgents: () => Promise<HubAgent[]>;
    getAvailableModels: () => Model[];
    effectiveModelPatterns: (agent: HubAgent) => string[];
    resolvePatterns: (patterns: string[]) => string | undefined;
    effectivePrewalkPattern: (agent: HubAgent) => string | undefined;
    effectiveAdvisorPattern: (agent: HubAgent) => string | undefined;
    /** Persist one agent's enabled state; other agents are untouched. */
    setAgentDisabled: (name: string, options: {
        disabled: boolean;
    }) => void;
    /** Persist one agent's override for `property`; `undefined` clears it. Other agents are untouched. */
    setAgentOverride: (property: PropertyKind, name: string, value: string | undefined) => void;
    generateAgent: (description: string, onText: (text: string) => void) => Promise<string>;
    saveAgent: (scope: "project" | "user", spec: GeneratedAgentSpec) => Promise<string>;
}
export interface AgentsHubCallbacks {
    onCancel: () => void;
}
/**
 * The fullscreen agents hub component. Hosted via
 * `ui.showOverlay(..., { fullscreen: true })`; the host must call
 * {@link AgentsHubComponent.dispose} when the overlay closes.
 */
export declare class AgentsHubComponent implements Component {
    #private;
    private constructor();
    static create(tui: TUI, deps: AgentsHubDeps, callbacks?: AgentsHubCallbacks): Promise<AgentsHubComponent>;
    dispose(): void;
    invalidate(): void;
    handleInput(data: string): void;
    /**
     * The agent list (and its chip strips) is a `picker` sheet. The pattern
     * input, the model browser and the create wizard stay the generic overlay.
     */
    nativeSheet(cx: DescribeContext): boolean;
    describe(cx: DescribeContext): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
