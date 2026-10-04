import { Container } from "../tui.js";
import type { CollabPromptDetails } from "./messages.js";
import type { CustomMessage } from "./messages.js";
import type { NativeNode } from "../native/node.js";
/**
 * Renders a collab guest prompt on every participant's transcript: a
 * user-message-styled bubble prefixed with the author's name.
 */
export declare class CollabPromptMessageComponent extends Container {
    #private;
    constructor(message: CustomMessage<CollabPromptDetails>);
    /** A user-toned card headed by the guest's name, with the prompt as markdown. */
    describe(): NativeNode;
}
