export declare const cfgToolsArtifactSpillThreshold: import("../config/registry.js").Setting<number, "tools.artifactSpillThreshold">;
export declare const cfgToolsArtifactTailBytes: import("../config/registry.js").Setting<number, "tools.artifactTailBytes">;
export declare const cfgToolsArtifactHeadBytes: import("../config/registry.js").Setting<number, "tools.artifactHeadBytes">;
export declare const cfgToolsOutputMaxColumns: import("../config/registry.js").Setting<number, "tools.outputMaxColumns">;
export declare const cfgToolsArtifactTailLines: import("../config/registry.js").Setting<number, "tools.artifactTailLines">;
export declare const cfgToolsArtifactMaxBytes: import("../config/registry.js").Setting<number, "tools.artifactMaxBytes">;
export declare const cfgReadLineNumbers: import("../config/registry.js").Setting<boolean, "readLineNumbers">;
export declare const cfgReadDefaultLimit: import("../config/registry.js").Setting<number, "read.defaultLimit">;
export declare const cfgReadRenderMarkdown: import("../config/registry.js").Setting<boolean, "read.renderMarkdown">;
export declare const cfgReadSummarizeEnabled: import("../config/registry.js").Setting<boolean, "read.summarize.enabled">;
export declare const cfgReadSummarizeProse: import("../config/registry.js").Setting<boolean, "read.summarize.prose">;
export declare const cfgReadSummarizeMinBodyLines: import("../config/registry.js").Setting<number, "read.summarize.minBodyLines">;
export declare const cfgReadSummarizeMinCommentLines: import("../config/registry.js").Setting<number, "read.summarize.minCommentLines">;
export declare const cfgReadSummarizeMinTotalLines: import("../config/registry.js").Setting<number, "read.summarize.minTotalLines">;
export declare const cfgReadSummarizeUnfoldUntil: import("../config/registry.js").Setting<number, "read.summarize.unfoldUntil">;
export declare const cfgReadSummarizeUnfoldLimit: import("../config/registry.js").Setting<number, "read.summarize.unfoldLimit">;
export declare const cfgReadToolResultPreview: import("../config/registry.js").Setting<boolean, "read.toolResultPreview">;
export declare const cfgToolsApproval: import("../config/registry.js").Setting<{}, "tools.approval">;
export declare const cfgToolsApprovalMode: import("../config/registry.js").Setting<"always-ask" | "write" | "yolo", "tools.approvalMode">;
export declare const cfgTodoEnabled: import("../config/registry.js").Setting<boolean, "todo.enabled">;
export declare const cfgTodoReminders: import("../config/registry.js").Setting<boolean, "todo.reminders">;
export declare const cfgTodoRemindersMax: import("../config/registry.js").Setting<number, "todo.remindersMax">;
export declare const cfgTodoEager: import("../config/registry.js").Setting<"always" | "default" | "preferred", "todo.eager">;
export declare const cfgTasksTodoClearDelay: import("../config/registry.js").Setting<number, "tasks.todoClearDelay">;
export declare const cfgGlobEnabled: import("../config/registry.js").Setting<boolean, "glob.enabled">;
export declare const cfgGrepEnabled: import("../config/registry.js").Setting<boolean, "grep.enabled">;
export declare const cfgGrepContextBefore: import("../config/registry.js").Setting<number, "grep.contextBefore">;
export declare const cfgGrepContextAfter: import("../config/registry.js").Setting<number, "grep.contextAfter">;
export declare const cfgAstGrepEnabled: import("../config/registry.js").Setting<boolean, "astGrep.enabled">;
export declare const cfgAstEditEnabled: import("../config/registry.js").Setting<boolean, "astEdit.enabled">;
export declare const cfgFindEnabled: import("../config/registry.js").Setting<"auto" | "off" | "on", "find.enabled">;
export declare const cfgDebugEnabled: import("../config/registry.js").Setting<boolean, "debug.enabled">;
export declare const cfgLaunchEnabled: import("../config/registry.js").Setting<boolean, "launch.enabled">;
export declare const cfgSpeechgenEnabled: import("../config/registry.js").Setting<boolean, "speechgen.enabled">;
export declare const cfgGenerateImageEnabled: import("../config/registry.js").Setting<boolean, "generate_image.enabled">;
export declare const cfgComputerEnabled: import("../config/registry.js").Setting<boolean, "computer.enabled">;
export declare const cfgRatchetEnabled: import("../config/registry.js").Setting<boolean, "ratchet.enabled">;
export declare const cfgArchiveEnabled: import("../config/registry.js").Setting<boolean, "archive.enabled">;
export declare const cfgComputerDisplay: import("../config/registry.js").Setting<string, "computer.display">;
export declare const cfgComputerMaxWidth: import("../config/registry.js").Setting<number, "computer.maxWidth">;
export declare const cfgComputerMaxHeight: import("../config/registry.js").Setting<number, "computer.maxHeight">;
export declare const cfgImagesQuestionTimeoutMs: import("../config/registry.js").Setting<number, "images.questionTimeoutMs">;
export declare const cfgCheckpointEnabled: import("../config/registry.js").Setting<boolean, "checkpoint.enabled">;
export declare const cfgFetchEnabled: import("../config/registry.js").Setting<boolean, "fetch.enabled">;
export declare const cfgVaultEnabled: import("../config/registry.js").Setting<boolean, "vault.enabled">;
export declare const cfgGithubEnabled: import("../config/registry.js").Setting<boolean, "github.enabled">;
export declare const cfgGithubCacheEnabled: import("../config/registry.js").Setting<boolean, "github.cache.enabled">;
export declare const cfgGithubCacheSoftTtlSec: import("../config/registry.js").Setting<number, "github.cache.softTtlSec">;
export declare const cfgGithubCacheHardTtlSec: import("../config/registry.js").Setting<number, "github.cache.hardTtlSec">;
export declare const cfgWebSearchEnabled: import("../config/registry.js").Setting<boolean, "web_search.enabled">;
export declare const cfgSecurityEnabled: import("../config/registry.js").Setting<boolean, "security.enabled">;
export declare const cfgAskEnabled: import("../config/registry.js").Setting<boolean, "ask.enabled">;
export declare const cfgToolsIntentTracing: import("../config/registry.js").Setting<boolean, "tools.intentTracing">;
export declare const cfgToolsAbortOnFabricatedResult: import("../config/registry.js").Setting<boolean, "tools.abortOnFabricatedResult">;
export declare const cfgToolsSpeculativeExecutionEnabled: import("../config/registry.js").Setting<boolean, "tools.speculativeExecution.enabled">;
export declare const cfgToolsSpeculativeExecutionMaxInFlight: import("../config/registry.js").Setting<number, "tools.speculativeExecution.maxInFlight">;
export declare const cfgToolsMaxTimeout: import("../config/registry.js").Setting<number, "tools.maxTimeout">;
export declare const cfgAsyncEnabled: import("../config/registry.js").Setting<boolean, "async.enabled">;
export declare const cfgAsyncMaxJobs: import("../config/registry.js").Setting<number, "async.maxJobs">;
export declare const cfgToolsXdev: import("../config/registry.js").Setting<boolean, "tools.xdev">;
export declare const cfgToolsXdevDocs: import("../config/registry.js").Setting<"builtins" | "catalog" | "inline", "tools.xdevDocs">;
export declare const cfgToolsXdevInlineDevices: import("../config/registry.js").Setting<string[], "tools.xdevInlineDevices">;
export declare const cfgDevAutoqa: import("../config/registry.js").Setting<boolean, "dev.autoqa">;
export declare const cfgDevAutoqaPushEndpoint: import("../config/registry.js").Setting<string, "dev.autoqaPush.endpoint">;
export declare const cfgDevAutoqaPushToken: import("../config/registry.js").Setting<string | undefined, "dev.autoqaPush.token">;
/**
 * User decision on sharing automatic `report_tool_issue` grievances.
 *
 *   - `"unset"`  — never asked; the first `report_tool_issue` invocation
 *                  pops a consent dialog and persists the answer here.
 *   - `"granted"` — record and (when push is configured) ship grievances.
 *   - `"denied"`  — silently no-op every `report_tool_issue` call.
 *
 * Owned by `packages/coding-agent/src/tools/report-tool-issue.ts` via the
 * process-global consent handler registered by `InteractiveMode`.
 *
 * @default "unset"
 */
export declare const cfgDevAutoqaConsent: import("../config/registry.js").Setting<"denied" | "granted" | "unset", "dev.autoqaConsent">;
/** Settings read by `resolveBuiltinToolPlan` (`tools/index.ts`); a live session reconciles its built-ins when any changes. */
export declare const cfgBuiltinToolGates: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    ask: import("../config/registry.js").Setting<boolean, "ask.enabled">;
    astEdit: import("../config/registry.js").Setting<boolean, "astEdit.enabled">;
    astGrep: import("../config/registry.js").Setting<boolean, "astGrep.enabled">;
    async: import("../config/registry.js").Setting<boolean, "async.enabled">;
    autolearn: import("../config/registry.js").Setting<boolean, "autolearn.enabled">;
    bash: import("../config/registry.js").Setting<boolean, "bash.enabled">;
    checkpoint: import("../config/registry.js").Setting<boolean, "checkpoint.enabled">;
    contextManagement: import("../config/registry.js").Setting<boolean, "compaction.experimentalContextManagement">;
    debug: import("../config/registry.js").Setting<boolean, "debug.enabled">;
    evalJs: import("../config/registry.js").Setting<boolean, "eval.js">;
    evalPy: import("../config/registry.js").Setting<boolean, "eval.py">;
    find: import("../config/registry.js").Setting<"auto" | "off" | "on", "find.enabled">;
    github: import("../config/registry.js").Setting<boolean, "github.enabled">;
    glob: import("../config/registry.js").Setting<boolean, "glob.enabled">;
    grep: import("../config/registry.js").Setting<boolean, "grep.enabled">;
    ida: import("../config/registry.js").Derived<boolean>;
    launch: import("../config/registry.js").Setting<boolean, "launch.enabled">;
    lsp: import("../config/registry.js").Setting<boolean, "lsp.enabled">;
    security: import("../config/registry.js").Setting<boolean, "security.enabled">;
    taskMaxRecursionDepth: import("../config/registry.js").Setting<number, "task.maxRecursionDepth">;
    todo: import("../config/registry.js").Setting<boolean, "todo.enabled">;
    webSearch: import("../config/registry.js").Setting<boolean, "web_search.enabled">;
}>>;
/** Settings that add or remove the built-in tools they gate (`AgentSession.reconcileBuiltinTools`). */
export declare const cfgSessionToolGates: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    builtins: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
        ask: import("../config/registry.js").Setting<boolean, "ask.enabled">;
        astEdit: import("../config/registry.js").Setting<boolean, "astEdit.enabled">;
        astGrep: import("../config/registry.js").Setting<boolean, "astGrep.enabled">;
        async: import("../config/registry.js").Setting<boolean, "async.enabled">;
        autolearn: import("../config/registry.js").Setting<boolean, "autolearn.enabled">;
        bash: import("../config/registry.js").Setting<boolean, "bash.enabled">;
        checkpoint: import("../config/registry.js").Setting<boolean, "checkpoint.enabled">;
        contextManagement: import("../config/registry.js").Setting<boolean, "compaction.experimentalContextManagement">;
        debug: import("../config/registry.js").Setting<boolean, "debug.enabled">;
        evalJs: import("../config/registry.js").Setting<boolean, "eval.js">;
        evalPy: import("../config/registry.js").Setting<boolean, "eval.py">;
        find: import("../config/registry.js").Setting<"auto" | "off" | "on", "find.enabled">;
        github: import("../config/registry.js").Setting<boolean, "github.enabled">;
        glob: import("../config/registry.js").Setting<boolean, "glob.enabled">;
        grep: import("../config/registry.js").Setting<boolean, "grep.enabled">;
        ida: import("../config/registry.js").Derived<boolean>;
        launch: import("../config/registry.js").Setting<boolean, "launch.enabled">;
        lsp: import("../config/registry.js").Setting<boolean, "lsp.enabled">;
        security: import("../config/registry.js").Setting<boolean, "security.enabled">;
        taskMaxRecursionDepth: import("../config/registry.js").Setting<number, "task.maxRecursionDepth">;
        todo: import("../config/registry.js").Setting<boolean, "todo.enabled">;
        webSearch: import("../config/registry.js").Setting<boolean, "web_search.enabled">;
    }>>;
    generateImage: import("../config/registry.js").Setting<boolean, "generate_image.enabled">;
    speechgen: import("../config/registry.js").Setting<boolean, "speechgen.enabled">;
    xdev: import("../config/registry.js").Setting<boolean, "tools.xdev">;
}>>;
