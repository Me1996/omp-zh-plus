import { Container } from "../index.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
/**
 * A persistent error banner pinned above the editor. Unlike the transcript
 * "Error: …" line (which scrolls away as the conversation grows), this stays in
 * the fixed region directly above the input so a turn that ended on a provider
 * error — e.g. Anthropic's "Output blocked by content filtering policy" — cannot
 * be missed. It is cleared when the next turn starts. The message wraps to the
 * render width and keeps {@link MAX_BANNER_ROWS} rows; the expand hint on the
 * overflow row reveals the full body inline in the transcript.
 *
 * Natively the transcript's error frame always shows the full message, so the
 * strip is only a reminder and offers a Dismiss button that calls `onDismiss`.
 */
export declare class ErrorBannerComponent extends Container {
    #private;
    constructor(message: string, onDismiss?: () => void);
    /**
     * An error-tinted strip pinned above the composer: the message's first line
     * (the transcript's error frame keeps the full message and its actions)
     * and a Details button that unfolds the rest here, then Dismiss.
     */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
}
