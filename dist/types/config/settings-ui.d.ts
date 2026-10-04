import { type SettingsHost } from "@oh-my-pi/pi-tui-zh/overlays/settings-defs";
/**
 * Adapt the application schema and settings store to the terminal overlay. The panel shows and
 * edits the value of the settings layers, never an environment-supplied one (so an env credential
 * is never pre-filled or written to config); descriptions note an active environment variable.
 */
export declare function createSettingsHost(): SettingsHost;
