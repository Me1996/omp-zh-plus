/**
 * Magic keywords: standalone lowercase prose words in a user prompt that
 * append a hidden, user-attributed notice for that turn and glow in the TUI.
 *
 * This table is the single source of truth. Every downstream surface derives
 * from it: the `magicKeywords.<id>` settings (`modes/settings.ts`), the notice
 * injection and `<id>-notice` message types (agent-session, queued-messages),
 * and the editor/bubble gradients (`setMagicKeywords` in pi-tui). Adding a
 * keyword means one row here plus its notice template under `prompts/system/`.
 */
/** Session facts a keyword notice may render against. */
export interface MagicKeywordContext {
    /** Enabled tool names for the turn. */
    tools: readonly string[];
    /** `task.batch`: whether `task` accepts a `tasks[]` array. */
    taskBatch: boolean;
    /** Whether the `scout` agent can be dispatched. */
    scoutAvailable: boolean;
    /** `eval.tools.enabled`: whether `@tool`-defined kernel tools exist. */
    evalTools: boolean;
}
/** One magic keyword: trigger word, gradient, settings copy, and the notice it injects. */
export interface MagicKeyword {
    /** Settings key suffix (`magicKeywords.<id>`) and notice message type prefix (`<id>-notice`). */
    id: string;
    /** Exact lowercase trigger, matched only as standalone prose. */
    word: string;
    /** Editor/bubble gradient as an HSL hue sweep `[from, to]` in degrees; `to` may exceed 360 to wrap. */
    hue: readonly [number, number];
    /** Settings panel label. */
    label: string;
    /** Settings panel description. */
    description: string;
    /** Tools that must all be enabled for the notice to apply; the notice is skipped otherwise. */
    requires: readonly string[];
    /** Render the hidden notice queued ahead of the user message. */
    notice: (context: MagicKeywordContext) => string;
}
/** Hidden notice for "ultrathink": careful multi-step reasoning. */
export declare const ULTRATHINK_NOTICE: string;
/** Hidden notice for "jevify": bulk classification through the eval kernel's `judge()`. */
export declare const JEVIFY_NOTICE: string;
/** Hidden notice for "orchestrate", naming only the tools the session actually exposes. */
export declare function renderOrchestrateNotice({ tools }: Pick<MagicKeywordContext, "tools">): string;
/** Hidden notice for "workflowz", shaped by the active task/eval capabilities. */
export declare function renderWorkflowNotice({ taskBatch, scoutAvailable, evalTools, }: Pick<MagicKeywordContext, "taskBatch" | "scoutAvailable" | "evalTools">): string;
export declare const MAGIC_KEYWORDS: readonly [{
    readonly id: "ultrathink";
    readonly word: "ultrathink";
    readonly hue: readonly [0, 330];
    readonly label: "Ultrathink Keyword";
    readonly description: "Let standalone ultrathink request maximum automatic thinking and append its hidden notice";
    readonly requires: readonly [];
    readonly notice: () => string;
}, {
    readonly id: "orchestrate";
    readonly word: "orchestrate";
    readonly hue: readonly [150, 280];
    readonly label: "Orchestrate Keyword";
    readonly description: "Let standalone orchestrate append its hidden multi-agent orchestration notice";
    readonly requires: readonly ["task"];
    readonly notice: typeof renderOrchestrateNotice;
}, {
    readonly id: "workflow";
    readonly word: "workflowz";
    readonly hue: readonly [30, 150];
    readonly label: "Workflow Keyword";
    readonly description: "Let standalone workflowz append its hidden eval workflow notice";
    readonly requires: readonly ["task", "eval"];
    readonly notice: typeof renderWorkflowNotice;
}, {
    readonly id: "jevify";
    readonly word: "jevify";
    readonly hue: readonly [300, 420];
    readonly label: "Jevify Keyword";
    readonly description: "Let standalone jevify append its hidden bulk-judge classification notice";
    readonly requires: readonly ["eval"];
    readonly notice: () => string;
}];
/** Settings key suffix of a registered keyword. */
export type MagicKeywordId = (typeof MAGIC_KEYWORDS)[number]["id"];
/** Hidden custom-message type carrying a keyword's notice. */
export type MagicKeywordNoticeType = `${MagicKeywordId}-notice`;
