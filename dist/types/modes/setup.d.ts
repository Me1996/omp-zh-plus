import type { SetupHost, SetupScene } from "@oh-my-pi/pi-tui-zh/setup/scenes/types";
import { ALL_SCENES, CURRENT_SETUP_VERSION, type RunSetupWizardOptions, type SetupSceneSelectionOptions } from "@oh-my-pi/pi-tui-zh/setup/wizard";
import type { Settings } from "../config/settings.js";
import type { InteractiveModeContext } from "./types.js";
export { ALL_SCENES, CURRENT_SETUP_VERSION };
export type { SetupScene, SetupSceneHost } from "@oh-my-pi/pi-tui-zh/setup/scenes/types";
export { runStartupSplash } from "@oh-my-pi/pi-tui-zh/setup/startup-splash";
/** Bind application preferences and runtime effects to the setup presentation. */
export declare function createSetupHost(ctx: InteractiveModeContext): SetupHost;
/** Persist completion only after the setup overlay finishes. */
export declare function markSetupWizardComplete(settings: Settings, version?: number): Promise<void>;
/** Select eligible setup scenes using the application's live capabilities. */
export declare function selectSetupScenes(storedVersion: number, scenes: readonly SetupScene[], ctx?: InteractiveModeContext, options?: SetupSceneSelectionOptions): Promise<SetupScene[]>;
/** Run setup with application-owned persistence and provider effects. */
export declare function runSetupWizard(ctx: InteractiveModeContext, scenes?: readonly SetupScene[], options?: RunSetupWizardOptions): Promise<void>;
/** Open provider setup without advancing onboarding or replaying the welcome intro. */
export declare function runProviderSetupWizard(ctx: InteractiveModeContext): Promise<void>;
