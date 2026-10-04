import type { SetupHost } from "./scenes/types.js";
/** Load and run provider setup without completing onboarding or replaying the welcome intro. */
export declare function runProviderSetupWizard(ctx: SetupHost): Promise<void>;
