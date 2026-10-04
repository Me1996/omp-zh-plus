export declare const stateDefs: {
    QueueMode: string;
    InterruptMode: string;
    StreamingBehavior: string;
    QueuedMessageQueue: string;
    CacheWarmingMode: string;
    MessageUpdates: readonly unknown[];
    TodoStatus: string;
    GoalOp: string;
    GoalStatus: string;
    SlashCommandSource: string;
    SubagentSubscriptionLevel: readonly unknown[];
    AgentSource: string;
    SubagentStatus: string;
    TodoItem: {
        content: string;
        status: string;
        "blocker?": readonly unknown[];
        "details?": string;
        "notes?": string;
    };
    TodoPhase: {
        name: string;
        tasks: string;
    };
    ContextUsage: {
        tokens: string;
        contextWindow: string;
        percent: string;
    };
    QueuedMessagesState: readonly unknown[];
    ToolDescriptor: {
        name: string;
        description: string;
        "parameters?": string;
        "examples?": string;
    };
    Goal: readonly unknown[];
    GoalModeState: readonly unknown[];
    GoalResult: readonly unknown[];
    SessionState: {
        "model?": string;
        "thinkingLevel?": string;
        isStreaming: readonly unknown[];
        isCompacting: readonly unknown[];
        steeringMode: readonly unknown[];
        followUpMode: readonly unknown[];
        interruptMode: readonly unknown[];
        "sessionFile?": string;
        sessionId: string;
        "sessionName?": string;
        autoCompactionEnabled: readonly unknown[];
        fastModeEnabled: readonly unknown[];
        fastModeActive: readonly unknown[];
        tokensPerSecond: readonly unknown[];
        messageCount: readonly unknown[];
        queuedMessageCount: readonly unknown[];
        hasPendingAsyncWork: readonly unknown[];
        isSettled: readonly unknown[];
        queuedMessages: readonly unknown[];
        todoPhases: readonly unknown[];
        systemPrompt: readonly unknown[];
        dumpTools: readonly unknown[];
        "contextUsage?": string;
        goal: readonly unknown[];
    };
    BashResult: {
        output: string;
        "exitCode?": string;
        cancelled: string;
        "timedOut?": string;
        truncated: string;
        totalLines: string;
        totalBytes: string;
        outputLines: string;
        outputBytes: string;
        "artifactId?": string;
        "artifactElidedBytes?": string;
        "artifactError?": string;
        "workingDir?": string;
        "images?": string;
    };
    FastModeResult: {
        enabled: string;
        active: string;
    };
    CompactionResult: {
        summary: string;
        "shortSummary?": string;
        firstKeptEntryId: string;
        tokensBefore: string;
        "details?": string;
        "preserveData?": string;
    };
    ModelCycleResult: {
        model: string;
        "thinkingLevel?": string;
        isScoped: string;
    };
    ThinkingLevelCycleResult: {
        level: string;
    };
    CancellationResult: {
        cancelled: string;
    };
    OpenSessionResult: readonly unknown[];
    RemoveQueuedMessageResult: {
        removed: string;
    };
    PromoteQueuedMessageResult: {
        promoted: string;
    };
    BranchMessage: {
        entryId: string;
        text: string;
    };
    BranchResult: {
        text: string;
        cancelled: string;
    };
    TokenUsage: {
        input: string;
        output: string;
        reasoning: readonly unknown[];
        cacheRead: string;
        cacheWrite: string;
        total: string;
    };
    SessionCredits: {
        cost: string;
        committedCost: string;
        acuCost: string;
    };
    SessionStats: {
        "sessionFile?": string;
        sessionId: string;
        userMessages: string;
        assistantMessages: string;
        toolCalls: string;
        toolResults: string;
        totalMessages: string;
        tokens: string;
        premiumRequests: string;
        cost: string;
        "credits?": string;
        "routedModels?": string;
        "contextUsage?": string;
    };
    MessagesPage: {
        messages: string;
        totalMessages: string;
        "nextCursor?": readonly unknown[];
    };
    SlashCommandInput: {
        "hint?": string;
    };
    SlashSubcommand: {
        name: string;
        "description?": string;
        "usage?": string;
    };
    AvailableSlashCommand: {
        name: string;
        "aliases?": string;
        "description?": string;
        "input?": string;
        "subcommands?": string;
        source: string;
    };
    SessionEntries: readonly unknown[];
    SessionTree: readonly unknown[];
    SubagentSnapshot: {
        id: string;
        index: string;
        agent: string;
        agentSource: string;
        "description?": string;
        status: string;
        "task?": string;
        "assignment?": string;
        "sessionFile?": string;
        lastUpdate: string;
        "progress?": readonly unknown[];
        "parentToolCallId?": string;
    };
    SubagentMessages: readonly unknown[];
    LoginProvider: {
        id: string;
        name: string;
        available: string;
        authenticated: string;
    };
    HandoffResult: {
        "savedPath?": string;
    };
    PromptAck: readonly unknown[];
};
