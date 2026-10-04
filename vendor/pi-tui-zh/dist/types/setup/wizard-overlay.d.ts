import { type Component, type OverlayFocusOwner } from "../tui.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
import type { SetupHost } from "./scenes/types.js";
import type { SetupScene } from "./scenes/types.js";
/** Fullscreen onboarding presentation with scene focus and mouse routing. */
export declare class SetupWizardComponent implements Component, OverlayFocusOwner {
    #private;
    readonly ctx: SetupHost;
    readonly scenes: readonly SetupScene[];
    constructor(ctx: SetupHost, scenes: readonly SetupScene[]);
    run(): Promise<void>;
    dispose(): void;
    invalidate(): void;
    ownsOverlayFocusTarget(component: Component): boolean;
    handleInput(data: string): void;
    render(width: number): readonly string[];
    /**
     * Fullscreen description: splash, the active scene inside the wizard
     * frame (brand header, step counter, title, footer hints), or the outro.
     * The splash→scene dissolve is a row effect with no native counterpart, so
     * a transition describes as the scene.
     */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
}
