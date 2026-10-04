import { type Extension } from "@oh-my-pi/pi-tui-zh/overlays/extensions/types";
/**
 * Load all extensions from all capabilities.
 */
export declare function loadAllExtensions(cwd?: string, disabledIds?: string[]): Promise<Extension[]>;
/**
 * Toggle provider enabled state.
 */
export declare function toggleProvider(providerId: string): boolean;
/**
 * Toggle a foreign provider's `~/` config opt-in.
 */
export declare function toggleUserSource(providerId: string): boolean;
