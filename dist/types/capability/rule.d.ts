import type { SourceMeta } from "./types.js";
/**
 * Provider id for the bundled default rules shipped with the agent.
 * Lowest priority, so any user/project/tool rule of the same name overrides
 * a bundled default. Also used to gate the whole bundled set via
 * `ttsr.builtinRules`.
 */
export declare const BUILTIN_DEFAULTS_PROVIDER_ID = "builtin-defaults";
/**
 * Parsed frontmatter from rule files.
 */
export interface RuleFrontmatter {
    /** Whether discovery should omit this rule. */
    enabled?: boolean;
    description?: string;
    globs?: string[];
    alwaysApply?: boolean;
    /** New key for TTSR match conditions. */
    condition?: string | string[];
    /** TTSR match condition(s) expressed as ast-grep patterns (edit/write streams only). */
    astCondition?: string | string[];
    /** Natural-language yes/no question a judge model answers on each completed in-scope output. */
    question?: string;
    /** New key for TTSR stream scope. */
    scope?: string | string[];
    /** Agent-name globs this rule applies to; absent = every agent. `main` targets the top-level session. */
    agents?: string[] | string;
    /** Per-rule TTSR interrupt mode override. */
    interruptMode?: "never" | "prose-only" | "tool-only" | "always";
    [key: string]: unknown;
}
/**
 * A rule providing project-specific guidance and constraints.
 */
export interface Rule {
    /** Rule name (derived from filename) */
    name: string;
    /** Absolute path to rule file */
    path: string;
    /** Rule content (after frontmatter stripped) */
    content: string;
    /** Globs this rule applies to (if any) */
    globs?: string[];
    /** Whether to always include this rule */
    alwaysApply?: boolean;
    /** Description (for agent-requested rules) */
    description?: string;
    /** Regex condition(s) that can trigger TTSR interruption. */
    condition?: string[];
    /** ast-grep pattern condition(s) that can trigger TTSR interruption (edit/write streams only). */
    astCondition?: string[];
    /**
     * Judged-rule question: asked of the `judge` model role once an in-scope output completes,
     * never mid-stream. A yes delivers the rule as a non-interrupting warning; `condition` /
     * `astCondition`, when also set, only gate whether the question is asked.
     */
    question?: string;
    /** Optional stream scope tokens (for example: text, thinking, tool:edit(*.ts)). */
    scope?: string[];
    /** Lowercased agent-name globs this rule applies to (absent = every agent). */
    agents?: string[];
    /** Per-rule TTSR interrupt mode override (falls back to global ttsr.interruptMode). */
    interruptMode?: "never" | "prose-only" | "tool-only" | "always";
    /** Source metadata */
    _source: SourceMeta;
}
/**
 * Parse the `agents` frontmatter field into lowercased agent-name glob patterns.
 * Reuses the scope tokenizer for comma-separated spellings; `{a,b}` groups survive.
 */
export declare function parseRuleAgents(value: unknown): string[] | undefined;
/** Agent name used for the top-level (non-sub) session when evaluating `agents`. */
export declare const MAIN_AGENT_RULE_NAME = "main";
/** Fallback agent name used for a subagent session with no explicit `agentName` (see sdk.ts). */
export declare const SUB_AGENT_RULE_NAME = "sub";
/**
 * Whether a rule's `agents` scope admits `agentName`. A rule without `agents`
 * applies everywhere; `agentName === undefined` disables scoping entirely
 * (used by CLI inventory listings that must show every rule).
 */
export declare function ruleAppliesToAgent(rule: Pick<Rule, "agents">, agentName: string | undefined): boolean;
/**
 * Parse the TTSR trigger fields (`condition`, `astCondition`, `question`) and `scope` from rule frontmatter.
 *
 * - `condition` accepts string or string[]
 * - `scope` accepts string or string[]
 * - legacy `ttsr_trigger` / `ttsrTrigger` are accepted as a `condition` fallback
 * - condition tokens that look like file globs become scope shorthands:
 *   `*.rs` => `tool:edit(*.rs)`, `tool:write(*.rs)` and a catch-all condition `.*`
 * - `astCondition` holds ast-grep patterns and is kept verbatim (no glob inference)
 * - `question` accepts a single non-empty string
 */
export declare function parseRuleConditionAndScope(frontmatter: RuleFrontmatter): Pick<Rule, "condition" | "astCondition" | "question" | "scope">;
/**
 * Compile a rule `condition` into a `RegExp`, translating a leading PCRE-style
 * inline flag group into native `RegExp` flags.
 *
 * JS/Bun `RegExp` rejects inline flag prefixes such as `(?i)`, so a rule written
 * `condition: "(?i)pre.existing"` would otherwise throw at compile time and be
 * silently dropped (see issue #4796). Only a *leading* group of `i`/`m`/`s`
 * flags is translated; anything else — mid-pattern groups, unsupported flags —
 * is passed through verbatim so the native error still surfaces for genuinely
 * invalid patterns.
 */
export declare function compileRuleCondition(pattern: string): RegExp;
/**
 * Process-global snapshot of rules the active session loaded.
 * Read by internal URL protocol handlers (rule://).
 */
export declare function getActiveRules(): readonly Rule[];
/** Replace the active rule snapshot. Called once per top-level session. */
export declare function setActiveRules(value: readonly Rule[]): void;
/** Reset the active rule snapshot. Test-only. */
export declare function resetActiveRulesForTests(): void;
export declare const ruleCapability: import("./types.js").Capability<Rule>;
