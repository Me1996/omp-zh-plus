import type { ServiceTierOpenAISettingValue } from "../config/service-tier.js";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import { getExtraHelpText } from "./help-extra.js";
export { getExtraHelpText };
export type Mode = "text" | "json" | "rpc" | "acp" | "rpc-ui";
export interface Args {
    cwd?: string;
    /** Workspace directories beyond cwd for this session (repeatable `--add-dir`). */
    addDir?: string[];
    profile?: string;
    alias?: string;
    allowHome?: boolean;
    provider?: string;
    model?: string;
    config?: string[];
    smol?: string;
    slow?: string;
    plan?: string;
    /** Objective for a fresh interactive goal session. */
    goal?: string;
    prewalk?: boolean;
    noPrewalk?: boolean;
    prewalkInto?: string;
    planYolo?: boolean;
    planYoloInto?: string;
    maxTime?: number;
    apiKey?: string;
    systemPrompt?: string;
    systemPromptTemplate?: string;
    appendSystemPrompt?: string;
    thinking?: ConfiguredThinkingLevel;
    serviceTier?: ServiceTierOpenAISettingValue;
    hideThinking?: boolean;
    advisor?: boolean;
    externalThinking?: boolean;
    continue?: boolean;
    resume?: string | true;
    fromClaude?: boolean;
    fromCodex?: boolean;
    help?: boolean;
    version?: boolean;
    mode?: Mode;
    noSession?: boolean;
    sessionDir?: string;
    providerSessionId?: string;
    providerPromptCacheKey?: string;
    fork?: string;
    /** Collab link to join at startup (set by the `join` subcommand; no CLI flag). */
    join?: string;
    models?: string[];
    tools?: string[];
    noTools?: boolean;
    noLsp?: boolean;
    noPty?: boolean;
    hooks?: string[];
    extensions?: string[];
    trustedExtensions?: string[];
    noExtensions?: boolean;
    pluginDirs?: string[];
    print?: boolean;
    printThoughts?: boolean;
    export?: string;
    noSkills?: boolean;
    skills?: string[];
    noRules?: boolean;
    noTitle?: boolean;
    /** RPC modes only: run extensions without a UI; `rpc-ui` tool UI remains enabled. */
    noUi?: boolean;
    autoApprove?: boolean;
    approvalMode?: "always-ask" | "write" | "yolo";
    messages: string[];
    fileArgs: string[];
    /** Extension-registered flags this parse recognized — name to value. */
    unknownFlags: Map<string, boolean | string>;
    /**
     * `--`/`-` prefixed tokens this parse could not match against any built-in
     * or {@link extensionFlags} entry. The startup parse runs *before*
     * extensions load, so it always lists every extension-registered flag here;
     * the post-extension reparse in {@link applyExtensionFlags} clears those
     * once the real flag set is known. Anything still present after that
     * reparse is a genuine typo or stale flag and {@link reportUnrecognizedFlags}
     * surfaces it as a hard error so the agent does not silently start a
     * session with the misparsed positionals as a prompt (issue #2459).
     */
    unrecognizedFlags: string[];
    /**
     * Usage errors for built-in enum flags (`--mode`, `--thinking`,
     * `--approval-mode`) given a value outside their set. Recorded rather than
     * thrown because the startup parse runs before extensions load, and an
     * extension may register a same-named flag that shadows the built-in; the
     * extension-aware reparse routes such a flag to {@link unknownFlags} and
     * records nothing. Whatever remains after that reparse is reported by
     * {@link reportInvalidFlagValues}.
     */
    invalidFlagValues: string[];
}
/**
 * Reject a `--goal` launch whose mode or session shape cannot host a fresh
 * interactive goal. Judged on the startup parse, before session resolution:
 * resume, fork, and import act on these same flags as they resolve, opening
 * pickers and persisting forked or imported transcripts, so a rejection after
 * them would leave those side effects behind.
 */
export declare function validateGoalLaunch(args: Args, interactive: boolean): void;
/**
 * Reject conflicting startup inputs before constructing an interactive goal
 * session. Runs on the extension-aware reparse: an extension flag's value can
 * look like a positional prompt to the startup parse.
 */
export declare function validateGoalStartup(args: Args, goalEnabled: boolean, pipedInput?: string, planStartsOnStartup?: boolean): void;
export declare function parseArgs(inputArgs: string[], extensionFlags?: Map<string, {
    type: "boolean" | "string";
}>): Args;
/**
 * Reject requested tool names absent from the fully discovered session registry.
 *
 * The registry is already narrowed by the `--tools` filter, so it cannot say
 * which tools *would* be available. A missing name from the built-in catalog is
 * reported as unavailable in this session (e.g. `eval` without a working
 * interpreter), never as unknown; the catalog is listed as "built-in tools",
 * not as available ones.
 */
export declare function validateToolNames(requested: readonly string[] | undefined, known: readonly string[]): void;
/**
 * Emit a stderr error listing the unrecognized flags and return `true` when
 * there were any. Caller is expected to exit with a non-zero status. Splitting
 * the print from the exit keeps the helper unit-testable without forking a
 * process (issue #2459).
 */
export declare function reportUnrecognizedFlags(args: Pick<Args, "unrecognizedFlags">, write?: (text: string) => void): boolean;
/**
 * Emit one stderr error per rejected built-in flag value and return `true`
 * when there were any. Like {@link reportUnrecognizedFlags}, callers run this
 * only on the extension-aware parse, so a value meant for an extension flag
 * that shadows the built-in never trips it.
 */
export declare function reportInvalidFlagValues(args: Pick<Args, "invalidFlagValues">, write?: (text: string) => void): boolean;
/** Emit a clean CLI usage error without an internal stack trace. */
export declare function reportCliUsageError(error: unknown, write?: (text: string) => void): boolean;
export declare function printHelp(): void;
