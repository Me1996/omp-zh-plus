/** Open records: transcript content, messages, usage, and assistant streaming events. */
export declare const messageDefs: {
    Attribution: readonly unknown[];
    StopReason: string;
    TextContent: {
        type: string;
        text: string;
        "textSignature?": string;
    };
    ThinkingContent: {
        type: string;
        thinking: string;
        "thinkingSignature?": string;
        "itemId?": string;
    };
    RedactedThinkingContent: {
        type: string;
        data: string;
    };
    ImageContent: readonly unknown[];
    ToolCall: {
        type: string;
        id: string;
        name: string;
        arguments: string;
        "thoughtSignature?": string;
        "intent?": string;
        "rawBlock?": string;
        "customWireName?": string;
        "providerMetadata?": string;
    };
    FallbackContent: readonly unknown[];
    AnthropicServerToolContent: {
        type: string;
        block: string;
    };
    UserContent: string;
    MessageContent: readonly unknown[];
    AssistantContent: string;
    UsageCost: {
        input: string;
        output: string;
        cacheRead: string;
        cacheWrite: string;
        total: string;
    };
    Usage: {
        input: string;
        output: string;
        cacheRead: string;
        cacheWrite: string;
        totalTokens: string;
        "contextTokens?": string;
        "premiumRequests?": string;
        "reasoningTokens?": string;
        "orchestration?": string;
        "cttl?": string;
        "server?": string;
        "credits?": string;
        cost: string;
    };
    UserMessage: {
        role: string;
        content: string;
        "synthetic?": string;
        "steering?": string;
        "liveSteered?": string;
        "historyRewriteAt?": string;
        "attribution?": string;
        "providerPayload?": string;
        timestamp: string;
    };
    DeveloperMessage: {
        role: string;
        content: string;
        "attribution?": string;
        "synthetic?": string;
        "userInitiated?": string;
        "providerPayload?": string;
        timestamp: string;
    };
    AssistantMessage: {
        role: string;
        content: string;
        api: string;
        provider: string;
        model: string;
        "responseId?": string;
        "upstreamProvider?": string;
        "upstreamModel?": string;
        usage: string;
        stopReason: string;
        "errorMessage?": string;
        "errorStatus?": string;
        "errorId?": string;
        "providerPayload?": string;
        timestamp: string;
        "duration?": string;
        "ttft?": string;
        "completedAt?": string;
    };
    ToolResultMessage: {
        role: string;
        toolCallId: string;
        toolName: string;
        content: string;
        "details?": string;
        isError: string;
        "attribution?": string;
        "prunedAt?": string;
        "useless?": string;
        timestamp: string;
    };
    BashExecutionMessage: {
        role: string;
        command: string;
        output: string;
        "exitCode?": string;
        cancelled: string;
        truncated: string;
        "images?": string;
        "meta?": string;
        timestamp: string;
        "excludeFromContext?": string;
    };
    PythonExecutionMessage: {
        role: string;
        code: string;
        output: string;
        "exitCode?": string;
        cancelled: string;
        truncated: string;
        "meta?": string;
        timestamp: string;
        "excludeFromContext?": string;
    };
    CustomMessage: {
        role: string;
        customType: string;
        content: string;
        display: string;
        "details?": string;
        "attribution?": string;
        timestamp: string;
    };
    HookMessage: {
        role: string;
        customType: string;
        content: string;
        display: string;
        "details?": string;
        "attribution?": string;
        timestamp: string;
    };
    BranchSummaryMessage: {
        role: string;
        summary: string;
        fromId: string;
        timestamp: string;
    };
    CompactionSummaryMessage: {
        role: string;
        summary: string;
        "shortSummary?": string;
        tokensBefore: string;
        "tokensAfter?": string;
        "method?": string;
        "providerPayload?": string;
        timestamp: string;
    };
    FileMentionItem: {
        path: string;
        content: string;
        "lineCount?": string;
        "byteSize?": string;
        "skippedReason?": string;
        "image?": string;
    };
    FileMentionMessage: {
        role: string;
        files: string;
        timestamp: string;
    };
    AgentMessage: readonly unknown[];
    AssistantStartEvent: {
        type: string;
        partial: string;
    };
    AssistantTextStartEvent: {
        type: string;
        contentIndex: string;
        partial: string;
    };
    AssistantTextDeltaEvent: {
        type: string;
        contentIndex: string;
        delta: string;
        partial: string;
    };
    AssistantTextEndEvent: {
        type: string;
        contentIndex: string;
        content: string;
        partial: string;
    };
    AssistantThinkingStartEvent: {
        type: string;
        contentIndex: string;
        partial: string;
    };
    AssistantThinkingDeltaEvent: {
        type: string;
        contentIndex: string;
        delta: string;
        partial: string;
    };
    AssistantThinkingEndEvent: {
        type: string;
        contentIndex: string;
        content: string;
        partial: string;
    };
    AssistantImageEndEvent: {
        type: string;
        contentIndex: string;
        content: string;
        partial: string;
    };
    AssistantToolCallStartEvent: {
        type: string;
        contentIndex: string;
        partial: string;
    };
    AssistantToolCallDeltaEvent: {
        type: string;
        contentIndex: string;
        delta: string;
        partial: string;
    };
    AssistantToolCallEndEvent: {
        type: string;
        contentIndex: string;
        toolCall: string;
        partial: string;
    };
    AssistantDoneEvent: {
        type: string;
        reason: string;
        message: string;
    };
    AssistantErrorEvent: {
        type: string;
        reason: string;
        error: string;
    };
    AssistantMessageEvent: readonly unknown[];
};
/** Model and thinking descriptors. */
export declare const modelDefs: {
    Effort: string;
    ThinkingLevel: readonly unknown[];
    ConfiguredThinkingLevel: readonly unknown[];
    ModelCost: readonly unknown[];
    ThinkingConfig: {
        mode: string;
        efforts: string;
        "defaultLevel?": string;
        "effortMap?": string;
        "supportsDisplay?": string;
        "prefixBinding?": string;
        "effortRouting?": string;
        "effortBudgets?": string;
        "suppressWhenOff?": string;
        "requiresEffort?": string;
    };
    ModelInfo: readonly unknown[];
};
