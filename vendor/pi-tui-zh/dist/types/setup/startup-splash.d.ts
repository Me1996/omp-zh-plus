import type { SetupUiHost } from "./scenes/types.js";
/** Timing controls for the standalone startup animation. */
export interface RunStartupSplashOptions {
    readonly durationMs?: number;
    readonly tickMs?: number;
    readonly now?: () => number;
}
/** Show the startup animation and restore the previous overlay focus afterward. */
export declare function runStartupSplash(ctx: SetupUiHost, options?: RunStartupSplashOptions): Promise<void>;
