import { FramedMessageComponent } from "../chrome/message-frame.js";
import type { HookMessageRenderer } from "./extension-types.js";
import type { HookMessage } from "./messages.js";
/**
 * Component that renders a custom message entry from hooks.
 * Uses distinct styling to differentiate from user messages.
 */
export declare class HookMessageComponent extends FramedMessageComponent<HookMessage<unknown>> {
    constructor(message: HookMessage<unknown>, customRenderer?: HookMessageRenderer);
}
