import { type Component, Container } from "../tui.js";
import type { NativeNode } from "../native/node.js";
/** One refresh of a streaming overlay's presentation. */
export interface StreamingPanelPresentation {
    /** Non-empty sections separated by one blank row. */
    readonly sections: readonly (Component | readonly Component[] | undefined)[];
    /** Use a provider when action availability may change without a controller transition. */
    readonly footer: string | (() => string);
}
/**
 * Shared body/footer shell for streaming overlays. The overlay controller keeps
 * its own state machine and calls {@link refresh} after each transition.
 */
export declare class StreamingPanelContent extends Container {
    #private;
    constructor(presentation: () => StreamingPanelPresentation);
    /** Rebuild sections and the footer from controller-owned state. */
    refresh(): void;
    /** The sections as a spaced stack followed by the footer; spacing is the terminal's. */
    describe(): NativeNode;
    invalidate(): void;
}
