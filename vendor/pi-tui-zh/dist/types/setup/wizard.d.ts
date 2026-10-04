import { CURRENT_SETUP_VERSION } from "./setup-version.js";
import type { SetupHost } from "./scenes/types.js";
import type { SetupScene } from "./scenes/types.js";
export type { SetupScene, SetupSceneController, SetupSceneHost, SetupSceneResult } from "./scenes/types.js";
export { runStartupSplash } from "./startup-splash.js";
export { CURRENT_SETUP_VERSION };
/** Ordered onboarding scenes with independent version gates. */
export declare const ALL_SCENES: readonly [SetupScene, SetupScene, SetupScene, SetupScene, SetupScene];
/** Environment and invocation gates for onboarding scene selection. */
export interface SetupSceneSelectionOptions {
    resuming?: boolean;
    isTTY?: boolean;
    skipEnv?: string;
    setupWizardEnabled?: boolean;
    force?: boolean;
}
/** Select scenes newer than the stored version, honoring hard environment gates. */
export declare function selectSetupScenes(storedVersion: number, scenes: readonly SetupScene[], ctx?: SetupHost, options?: SetupSceneSelectionOptions): Promise<SetupScene[]>;
/** Control completion persistence and the post-setup welcome animation. */
export interface RunSetupWizardOptions {
    markComplete?: boolean;
    playWelcomeIntro?: boolean;
}
/** Own the fullscreen setup overlay until its scenes and outro finish. */
export declare function runSetupWizard(ctx: SetupHost, scenes?: readonly SetupScene[], options?: RunSetupWizardOptions): Promise<void>;
