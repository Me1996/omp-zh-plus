import { type ConfiguredThinkingLevel } from "../thinking.js";
/** Opt-in selectors that can otherwise be literal model-id suffixes. */
export interface ThinkingSuffixOptions {
    allowMaxSuffix?: boolean;
    allowAutoAlias?: boolean;
}
/** Selector parsing options with authoritative literal-model lookup. */
export interface ModelStringParseOptions extends ThinkingSuffixOptions {
    isLiteralModelId?: (provider: string, id: string) => boolean;
}
/** Recognize all configured effort selectors after literal-id matching. */
export declare const MAX_THINKING_SUFFIX_OPTIONS: ThinkingSuffixOptions;
/** Parse a suffix while preserving selectors not explicitly enabled. */
export declare function parseThinkingSuffix(value: string, options?: ThinkingSuffixOptions): ConfiguredThinkingLevel | undefined;
/**
 * Split a trailing `:<level>` thinking selector off a model pattern.
 *
 * `level` is set when the suffix parses as a concrete thinking level (or, when
 * the caller opts in via `allowMaxSuffix`/`allowAutoAlias`, the guarded `:max`
 * level / `:auto` sentinel); `base` then has the suffix stripped. Otherwise
 * `base` is the input.
 * `minColonIndex` requires the colon to appear strictly after that index —
 * role-alias callers pass the matched alias prefix length.
 */
export declare function splitThinkingSuffix(pattern: string, minColonIndex?: number, options?: ThinkingSuffixOptions): {
    base: string;
    level?: ConfiguredThinkingLevel;
};
/**
 * Parse a model string in "provider/modelId" format.
 * Returns undefined if the format is invalid.
 */
export declare function parseModelString(modelStr: string, options?: ModelStringParseOptions): {
    provider: string;
    id: string;
    thinkingLevel?: ConfiguredThinkingLevel;
} | undefined;
export declare function formatModelSelectorValue(selector: string, thinkingLevel: ConfiguredThinkingLevel | undefined): string;
/**
 * Split a trailing `@<upstream>` provider-routing selector off a model pattern.
 *
 * `openrouter/z-ai/glm-4.7@cerebras` -> base `openrouter/z-ai/glm-4.7`, upstream
 * `cerebras`. Tiered upstreams keep their path (`...@google-ai-studio/priority`).
 * A `:thinking` suffix after the slug is kept on the base
 * (`...@cerebras:high` -> base `...:high`). Returns undefined when there is no
 * `@` or the suffix is not a bare provider slug, so model ids that legitimately
 * contain `@` (`claude-opus-4-8@default`, `workers-ai/@cf/...`) are never split.
 */
export declare function splitUpstreamRouting(pattern: string): {
    base: string;
    upstream: string;
} | undefined;
