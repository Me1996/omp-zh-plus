/** Status line segment identifiers accepted by custom status-line settings. */
export declare const STATUS_LINE_SEGMENT_IDS: readonly ["pi", "status", "model", "mode", "path", "git", "pr", "subagents", "token_in", "token_out", "token_total", "token_rate", "cost", "context_pct", "context_total", "time_spent", "time", "session", "hostname", "cache_read", "cache_write", "cache_hit", "session_name", "usage", "collab", "stream", "vim"];
/** One identifier from the supported status-line segment catalog. */
export type StatusLineSegmentId = (typeof STATUS_LINE_SEGMENT_IDS)[number];
/** Baseline segments used when Custom is selected without segment overrides. */
export declare const CUSTOM_STATUS_LINE_DEFAULTS: {
    readonly left: StatusLineSegmentId[];
    readonly right: StatusLineSegmentId[];
};
export declare const CONTEXT_LINE_MODE_VALUES: readonly ["off", "percentage", "annotated", "embedded"];
export type ContextLineMode = (typeof CONTEXT_LINE_MODE_VALUES)[number];
export declare const STATUS_LINE_PRESET_VALUES: readonly ["default", "minimal", "compact", "full", "nerd", "ascii", "custom"];
export type StatusLinePreset = (typeof STATUS_LINE_PRESET_VALUES)[number];
export declare const STATUS_LINE_SEPARATOR_VALUES: readonly ["powerline", "powerline-thin", "slash", "pipe", "block", "none", "ascii"];
export type StatusLineSeparatorStyle = (typeof STATUS_LINE_SEPARATOR_VALUES)[number];
