import type { Model } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { AgentDefinition } from "../task/types.js";
import { type ModelMention } from "@oh-my-pi/pi-tui-zh/prompt/model-mention-syntax";
import type { SessionEntry } from "./session-entries.js";
import type { SessionManager } from "./session-manager.js";
/** Journal entry identifying a model the user authorized for delegation. */
export declare const MODEL_MENTION_ENTRY_TYPE = "model_mention";
/** Replay valid branch entries, keeping the first occurrence of each agent and selector. */
export declare function readModelMentions(entries: readonly SessionEntry[]): ModelMention[];
/** Session capabilities needed to authorize and persist model mentions. */
export interface ModelMentionHost {
    sessionManager: SessionManager;
    modelRegistry: ModelRegistry;
    scopedModels(): ReadonlyArray<Model>;
    /** User-authorized model agents inherited from the parent session. */
    inheritedAgents?: readonly AgentDefinition[];
}
/** Owns branch-local pseudonyms for models explicitly tagged by the user. */
export declare class ModelMentionRegistry {
    #private;
    constructor(host: ModelMentionHost);
    /** Rebuild pseudonyms after resume, rewind, or a session switch. */
    syncFromBranch(): void;
    /** User-authorized model pseudonyms in first-mention order. */
    get mentions(): readonly ModelMention[];
    /** Resolve an exact selector within the same model scope as the session picker. */
    findMentionable(selector: string): Model | undefined;
    /** Register user-tagged models and replace their tokens with persisted agent tags. */
    expandMentions(text: string): string;
    /** Expose inherited and session-tagged models as general-purpose task agents. */
    sessionAgents(): AgentDefinition[];
}
