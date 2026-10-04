import type { Agent, AgentMessage, AgentTurnEndContext } from "@oh-my-pi/pi-agent-core";
import type { Model } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
import type { LocalProtocolOptions } from "../internal-urls/index.js";
import type { PlanModeState } from "../plan-mode/state.js";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { PlanProposalHandler } from "../tools/resolve.js";
import type { PlanYolo, Prewalk } from "./agent-session-types.js";
import type { SessionManager } from "./session-manager.js";
/** Hidden plan steering is consumed within the live run and must not reappear after a context rebuild. */
export declare function isPrewalkPlanNudge(message: AgentMessage): boolean;
/** Capabilities the prewalk coordinator borrows from its owning session. */
export interface PrewalkCoordinatorHost {
    agent: Agent;
    sessionManager: SessionManager;
    settings: Settings;
    model(): Model | undefined;
    configuredThinkingLevel(): ConfiguredThinkingLevel | undefined;
    emitNotice(level: "info" | "warning" | "error", message: string, source?: string): void;
    setModelTemporary(model: Model, thinkingLevel?: ConfiguredThinkingLevel, options?: {
        ephemeral?: boolean;
    }): Promise<void>;
    setActiveToolsByName(names: string[]): Promise<void>;
    restoreNonMCPToolPresentation(nonMCPToolNames: string[], nonMCPMountedToolNames: string[]): Promise<void>;
    getActiveToolNames(): string[];
    getEnabledToolNames(): string[];
    getMountedXdevToolNames(): string[];
    hasBuiltInTool(name: string): boolean;
    getPlanModeState(): PlanModeState | undefined;
    setPlanModeState(state: PlanModeState | undefined): void;
    getPlanReferencePath(): string;
    setPlanProposalHandler(handler: PlanProposalHandler | null): void;
    waitForSessionMessagePersistence(message: AgentMessage): Promise<void>;
    localProtocolOptions(): LocalProtocolOptions;
}
/** Initial state for prewalk and plan-yolo startup flows. */
export interface PrewalkCoordinatorOptions {
    prewalk?: Prewalk;
    planYolo?: PlanYolo;
}
/** Coordinates one-way model prewalks and automatic plan-yolo handoffs. */
export type PrewalkRestartResult = "armed" | "reset" | "rejected";
export declare class PrewalkCoordinator {
    #private;
    constructor(host: PrewalkCoordinatorHost, options?: PrewalkCoordinatorOptions);
    /** Current prewalk target, if the one-way switch remains armed. */
    get state(): Prewalk | undefined;
    /** Whether the armed prewalk would perform a model or thinking-level handoff. */
    get willHandoff(): boolean;
    /** Advances the one-way prewalk switch at a completed assistant-turn boundary. */
    advanceAtTurnEnd(liveMessages: AgentMessage[], context: AgentTurnEndContext | undefined): Promise<void>;
    /** Drops a pending prewalk hand-off (e.g. `prewalk.enabled` turned off); no-op when none is armed. */
    disarm(): void;
    /** Arms a prewalk immediately for an explicit slash-command request. */
    arm(target: Model, thinkingLevel?: ConfiguredThinkingLevel): boolean;
    /**
     * Restores the planning model and reuses or creates the requested one-shot handoff.
     * A different active arm rejects the restart before the current model changes.
     */
    restart(source: Model, sourceThinkingLevel: ConfiguredThinkingLevel | undefined, target: Model, targetThinkingLevel: ConfiguredThinkingLevel | undefined): Promise<PrewalkRestartResult>;
    /** Lazily enables plan-yolo's plan phase before the first prompt is built. */
    armPlanYoloIfNeeded(): Promise<void>;
}
