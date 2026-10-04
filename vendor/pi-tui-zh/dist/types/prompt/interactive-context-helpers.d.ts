/** Shared assistant transcript construction and model-authored link caching. */
import type { AssistantMessage, Model } from "@oh-my-pi/pi-ai";
import type { ImageBudget } from "../components/image.js";
import type { AssistantThinkingRenderer } from "../chat/extension-types.js";
import { AssistantMessageComponent } from "../chat/assistant-message.js";
/** Session display capabilities supplied unchanged by the interactive host. */
export interface AssistantMessageSession {
    readonly model?: Model;
    readonly extensionRunner?: {
        getAssistantThinkingRenderers(): readonly AssistantThinkingRenderer[];
    };
}
/** Host state required to construct and refresh assistant transcript segments. */
export interface AssistantMessageHost {
    readonly viewSession: AssistantMessageSession;
    readonly effectiveHideThinkingBlock: boolean;
    readonly proseOnlyThinking: boolean;
    readonly assistantImagesVisible: boolean;
    readonly hideToolActivity: boolean;
    readonly toolOutputExpanded: boolean;
    readonly ui: {
        requestRender(): void;
        readonly imageBudget: ImageBudget;
    };
    resolveAssistantMessageLinks(texts: readonly string[]): Promise<ReadonlyMap<string, string>>;
}
/**
 * Resolve and cache the current session's model-authored prose links. Existing
 * entries remain available to synchronous transcript rebuilds; links present in
 * this batch are replaced atomically so missing resources cannot retain a stale
 * destination.
 */
export declare function refreshAssistantMessageLinkTargets(ctx: AssistantMessageHost, messages: readonly AssistantMessage[]): Promise<ReadonlyMap<string, string>>;
/** Current resolved destinations for synchronous component construction. */
export declare function getAssistantMessageLinkTargets(ctx: AssistantMessageHost): ReadonlyMap<string, string>;
/** Limit a session snapshot to destinations authored by one rendered segment. */
export declare function assistantMessageLinkTargets(message: AssistantMessage, targets: ReadonlyMap<string, string>): ReadonlyMap<string, string>;
/**
 * Construct an {@link AssistantMessageComponent} wired to the live context's
 * thinking/image settings. `message` is omitted for the streaming placeholder
 * component and supplied when rendering a persisted turn.
 */
export declare function createAssistantMessageComponent(ctx: AssistantMessageHost, message?: AssistantMessage, linkTargets?: ReadonlyMap<string, string>): AssistantMessageComponent;
