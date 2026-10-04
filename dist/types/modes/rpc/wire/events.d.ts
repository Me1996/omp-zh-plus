export declare const eventDefs: {
    AutoCompactionReason: string;
    AutoCompactionAction: string;
    CacheWarmingPhase: string;
    CacheWarmingOutcome: string;
    NotifyType: string;
    AgentStartEvent: {
        type: string;
    };
    AgentEndEvent: {
        type: string;
        messages: readonly unknown[];
        "messageCount?": readonly unknown[];
        "isTerminal?": readonly unknown[];
        "yielded?": readonly unknown[];
        "awaitingAsyncWork?": readonly unknown[];
        "telemetry?": string;
        "coverage?": string;
    };
    TurnStartEvent: {
        type: string;
    };
    TurnEndEvent: {
        type: string;
        message: string;
        toolResults: string;
    };
    MessageStartEvent: {
        type: string;
        message: string;
        "messageId?": readonly unknown[];
    };
    MessageUpdateEvent: {
        type: string;
        message: string;
        assistantMessageEvent: string;
        "messageId?": readonly unknown[];
    };
    MessageEndEvent: {
        type: string;
        message: string;
        "messageId?": readonly unknown[];
    };
    ToolExecutionStartEvent: {
        type: string;
        toolCallId: string;
        toolName: string;
        "args?": string;
        "intent?": string;
    };
    ToolExecutionUpdateEvent: {
        type: string;
        toolCallId: string;
        toolName: string;
        "args?": string;
        "partialResult?": string;
    };
    ToolStreamUpdateEvent: {
        type: string;
        toolCallId: string;
        toolName: string;
        "update?": string;
    };
    ToolExecutionEndEvent: {
        type: string;
        toolCallId: string;
        toolName: string;
        "result?": string;
        "isError?": string;
    };
    AutoCompactionStartEvent: {
        type: string;
        reason: string;
        action: string;
    };
    AutoCompactionEndEvent: {
        type: string;
        action: string;
        "result?": string;
        aborted: string;
        willRetry: string;
        "errorMessage?": string;
        "skipped?": readonly unknown[];
    };
    AutoRetryStartEvent: {
        type: string;
        attempt: string;
        maxAttempts: string;
        delayMs: string;
        errorMessage: string;
        "errorId?": string;
    };
    AutoRetryEndEvent: {
        type: string;
        success: string;
        attempt: string;
        "finalError?": string;
        retryErrors: readonly unknown[];
    };
    CacheWarmingStartEvent: readonly unknown[];
    CacheWarmingEndEvent: readonly unknown[];
    RetryFallbackAppliedEvent: {
        type: string;
        from: string;
        to: string;
        role: string;
        "reason?": string;
    };
    RetryFallbackSucceededEvent: {
        type: string;
        model: string;
        role: string;
    };
    ModelChangedEvent: {
        type: string;
    };
    ConfigWarningsChangedEvent: {
        type: string;
    };
    AdvisorCostChangedEvent: {
        type: string;
    };
    AdvisorYieldedEvent: {
        type: string;
    };
    TtsrTriggeredEvent: {
        type: string;
        rules: string;
    };
    TodoReminderEvent: {
        type: string;
        todos: string;
        attempt: string;
        maxAttempts: string;
    };
    TodoAutoClearEvent: {
        type: string;
    };
    IrcMessageEvent: {
        type: string;
        message: string;
    };
    NoticeEvent: {
        type: string;
        level: string;
        message: string;
        "source?": string;
    };
    ThinkingLevelChangedEvent: readonly unknown[];
    GoalUpdatedEvent: readonly unknown[];
    QueueUpdateEvent: readonly unknown[];
    RpcAgentEvent: readonly unknown[];
};
