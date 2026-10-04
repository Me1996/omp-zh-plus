/**
 * Directory of a local IDA install that ships idalib, or undefined when none exists.
 * An explicit `configured` directory is authoritative: when it lacks idalib, nothing else is tried.
 * Otherwise checks `$IDADIR`, `ida-config.json`, then standard install locations.
 */
export declare function locateIdaInstall(configured: string | undefined): string | undefined;
/** IDA install directory when `ida.enabled` is on and an install is found; undefined otherwise. */
export declare const cfgIdaInstall: import("../config/registry.js").Derived<string | undefined>;
/** Whether IDA features (`read` views, the `ida` tool) are exposed. */
export declare const cfgIdaAvailable: import("../config/registry.js").Derived<boolean>;
