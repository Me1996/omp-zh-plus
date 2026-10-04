import { type SgrMouseEvent } from "../../mouse.js";
import type { NativeNode } from "../../native/node.js";
import type { SetupScene, SetupSceneController, SetupSceneHost } from "./types.js";
/**
 * "Sign in" scene: lets the user authenticate one or more model providers via
 * OAuth. It never auto-advances the wizard — the user may sign in to several
 * providers and then continue with Esc.
 */
export declare class SignInScene implements SetupSceneController {
    #private;
    readonly title = "Sign in to your providers";
    get subtitle(): string;
    constructor(host: SetupSceneHost);
    dispose(): void;
    invalidate(): void;
    handleInput(data: string): void;
    /** Forward mouse to the provider selector; pointer is inert during an active login or code prompt. */
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    render(width: number, maxLines?: number): readonly string[];
    /**
     * Picking: intro, the provider selector (describes itself) and the last
     * outcome. Signing in: a spinner heading, the login link (with the full
     * URL once, char-wrapped), any code prompt and the flow's progress lines.
     */
    describe(): NativeNode;
}
/** Onboarding scene for provider sign-in. */
export declare const providersSetupScene: SetupScene;
