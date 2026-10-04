import type { Judge, JudgeOptions } from "@oh-my-pi/pi-ai";
import { type Rule } from "../capability/rule.js";
import type { TtsrSettings } from "./ttsr-settings.js";
export type TtsrMatchSource = "text" | "thinking" | "tool";
/** Context about the stream content currently being checked against TTSR rules. */
export interface TtsrMatchContext {
    source: TtsrMatchSource;
    /** Tool name for tool argument deltas, e.g. "edit" or "write". */
    toolName?: string;
    /** Candidate file paths associated with the current stream chunk. */
    filePaths?: string[];
    /** Stable key to isolate buffering (for example a tool call ID). */
    streamKey?: string;
}
/** One completed assistant output (reply, reasoning, or one file of a tool call) as rules see it. */
export interface TtsrOutput {
    content: string;
    context: TtsrMatchContext;
    /** How warnings name the output, e.g. "reply" or "`edit` call on `src/a.ts`". */
    subject: string;
}
/** A judged rule eligible for one output, with its question. */
export interface JudgedCandidate {
    rule: Rule;
    question: string;
}
/** Yes-probability at or above which a judged rule counts as violated. */
export declare const JUDGED_RULE_THRESHOLD = 0.7;
/**
 * Jev tokens of output content sent per judgment. Jev rejects a judgment branch
 * past ~33k tokens (`max_tokens_exceeded`), and each branch also carries the
 * request template, the state keys, the subject and one question.
 */
export declare const JUDGED_CONTENT_MAX_TOKENS = 32000;
/**
 * Ask every candidate's question about `output` in one request — Jev bills the
 * shared state once — and return the rules judged violated. Judge failures
 * propagate to the caller.
 */
export declare function judgeRules(judge: Judge, output: TtsrOutput, candidates: readonly JudgedCandidate[], options?: JudgeOptions): Promise<Rule[]>;
/**
 * Fixed TTSR settings (omitted fields take the defaults), or a getter the manager reads on every
 * check so live setting changes apply immediately.
 */
export type TtsrSettingsSource = Partial<TtsrSettings> | (() => TtsrSettings);
export declare class TtsrManager {
    #private;
    constructor(settings?: TtsrSettingsSource);
    /** Add a TTSR rule to be monitored. */
    addRule(rule: Rule): boolean;
    /**
     * Add a stream chunk to its scoped buffer and return matching rules.
     *
     * Buffers are isolated by source/tool key so matches don't bleed across
     * assistant prose, thinking text, and unrelated tool argument streams.
     */
    checkDelta(delta: string, context: TtsrMatchContext): Rule[];
    /**
     * Replace the scoped buffer with a tool-provided normalized snapshot and
     * return matching rules.
     *
     * Used for tools exposing `matcherDigest`: the digest is recomputed from the
     * full (partial) arguments on every delta, so it replaces the buffer instead
     * of being appended to it.
     */
    checkSnapshot(snapshot: string, context: TtsrMatchContext): Rule[];
    /**
     * Evaluate ast-grep `astCondition` rules against a reconstructed tool snapshot.
     *
     * Only edit/write tool streams reach here (AST conditions need a language, which
     * we infer from the file extension on the tool's path argument). The snapshot is
     * matched in memory by the native engine (`astMatch`), so this is async and
     * intentionally throttled: identical consecutive snapshots (the common case when
     * only non-source arguments change between deltas) are skipped.
     */
    checkAstSnapshot(snapshot: string, context: TtsrMatchContext): Promise<Rule[]>;
    /** True when any stream-matched rule carries ast-grep conditions. */
    hasAstRules(): boolean;
    /** True when any registered rule is judged (`question`). */
    hasJudgedRules(): boolean;
    /**
     * Judged rules to ask about one completed output: in scope, inside the rule's
     * path globs, past the repeat gate, and — when the rule also declares
     * `condition`/`astCondition` — passing that cheap prefilter first.
     */
    judgedCandidates(content: string, context: TtsrMatchContext): Promise<JudgedCandidate[]>;
    /**
     * Claim judged verdicts for delivery: drop rules another verdict already
     * claimed or that cannot repeat yet, and mark the rest injected so
     * concurrent judgments cannot deliver them twice.
     */
    claim(rules: readonly Rule[]): Rule[];
    /** Mark rules as injected (won't trigger again until conditions allow). */
    markInjected(rulesToMark: Rule[]): void;
    /** Mark rule names as injected (won't trigger again until conditions allow). */
    markInjectedByNames(ruleNames: string[]): void;
    /** Get names of all injected rules (for persistence). */
    getInjectedRuleNames(): string[];
    /** Restore injected state from a list of rule names. */
    restoreInjected(ruleNames: string[]): void;
    /**
     * Reset stream buffers. Called at every stream boundary: a new turn, a new
     * assistant message within a turn, and a restarted response. Buffers never
     * span two assistant messages; repeat-after-gap counters are untouched.
     */
    resetBuffer(): void;
    /** Clear only one tool stream's transient matcher state. */
    clearStream(streamKey: string): void;
    /** Check if any TTSR rules are registered. */
    hasRules(): boolean;
    /**
     * Atomically replace monitored rules while retaining injection state for names
     * that remain registered. While TTSR is disabled nothing registers, so injection
     * state is kept intact for when it is re-enabled.
     *
     * Returns the names accepted for TTSR monitoring so the caller can bucket
     * rejected conditional rules through its normal fallback path.
     */
    replaceRules(rules: readonly Rule[]): Set<string>;
    /** All rules currently registered for TTSR monitoring, in registration order. */
    getRules(): Rule[];
    /** Increment message counter (call after each turn). */
    incrementMessageCount(): void;
    /** Get current message count. */
    getMessageCount(): number;
    /** Current settings, read live from the manager's source. */
    getSettings(): TtsrSettings;
}
