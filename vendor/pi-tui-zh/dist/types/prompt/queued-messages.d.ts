import { Container } from "../tui.js";
import type { KeyId } from "../keys.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
/** Queued messages under one heading ("Steering", "After yield"). */
export interface QueuedMessageGroup {
    readonly label: string;
    readonly messages: readonly string[];
}
/**
 * Messages queued while the agent works, above the editor. ANSI: a heading
 * per group, numbered dim rows and the dequeue hint. Natively (§8.1): a
 * stack of pills, each `corner-down-right` · the text · `⌥↑ Edit`, the total
 * count in the first pill when more than one waits; the edit control sends
 * `queue.edit`, answered like the dequeue key.
 */
export declare class QueuedMessagesBand extends Container {
    #private;
    private readonly onEdit;
    constructor(groups: readonly QueuedMessageGroup[], dequeueKey: KeyId, onEdit: () => void);
    describe(): NativeNode;
    /** The pills' Edit control: the dequeue key's path (queued messages back into the editor). */
    handleNativeEvent(event: NativeUiEvent): void;
}
