/** Canonical prefix for settings URLs. */
export declare const CFG_URL_PREFIX = "cfg://";
/** Trailing write segment that persists a `cfg://` change instead of scoping it to the session. */
export declare const CFG_SAVE_SEGMENT = "save";
/** Setting addressed by a `cfg://` URL. */
export interface CfgTarget {
    /** Setting path segments; empty for the root. `/` and `.` both separate segments. */
    segments: string[];
    /** Whether the URL ends in the `/save` suffix, which is removed from {@link segments}. */
    save: boolean;
}
/**
 * Parse a `cfg://` URL (`cfg://advisor/enabled`, `cfg://advisor.enabled/save`).
 * Returns `null` for other schemes; query and fragment are ignored.
 */
export declare function parseCfgUrl(input: string): CfgTarget | null;
