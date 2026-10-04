import { FramedMessageComponent } from "../chrome/message-frame.js";
import type { MessageRenderer } from "./extension-types.js";
import { type CustomMessage } from "./messages.js";
/**
 * Component that renders a custom message entry from extensions.
 * Uses distinct styling to differentiate from user messages.
 */
export declare class CustomMessageComponent extends FramedMessageComponent<CustomMessage<unknown>> {
    constructor(message: CustomMessage<unknown>, customRenderer?: MessageRenderer);
}
