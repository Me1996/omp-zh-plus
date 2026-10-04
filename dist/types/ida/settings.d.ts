/** Whether `read` opens executables in IDA Pro and the `ida` tool is enabled. */
export declare const cfgIdaEnabled: import("../config/registry.js").Setting<boolean, "ida.enabled">;
/** Python interpreter that can import ida_domain and idapro; blank auto-detects. */
export declare const cfgIdaPython: import("../config/registry.js").Setting<string, "ida.python">;
/** IDA install directory containing libidalib; blank auto-detects. */
export declare const cfgIdaInstallDir: import("../config/registry.js").Setting<string, "ida.installDir">;
/** Most IDA host daemons open at once per project; opening another evicts the least recently used idle one. */
export declare const cfgIdaMaxOpen: import("../config/registry.js").Setting<number, "ida.maxOpen">;
/** Idle seconds after which an IDA database is saved and closed; 0 keeps it open. */
export declare const cfgIdaIdleCloseSec: import("../config/registry.js").Setting<number, "ida.idleCloseSec">;
