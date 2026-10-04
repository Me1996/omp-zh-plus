export declare const frameDefs: {
    ReadyEvent: readonly unknown[];
    PromptStatus: string;
    PromptError: readonly unknown[];
    PromptResultEvent: readonly unknown[];
    SessionSettledEvent: readonly unknown[];
    ExtensionError: {
        type: string;
        extensionPath: string;
        event: string;
        error: string;
    };
    AvailableCommandsUpdateEvent: readonly unknown[];
    SubagentLifecycleStatus: string;
    SubagentLifecyclePayload: {
        id: string;
        agent: string;
        agentSource: string;
        "description?": string;
        status: string;
        "sessionFile?": string;
        "parentToolCallId?": string;
        index: string;
        "detached?": readonly unknown[];
    };
    SubagentProgressPayload: {
        index: string;
        agent: string;
        agentSource: string;
        task: string;
        "parentToolCallId?": string;
        "assignment?": string;
        progress: readonly unknown[];
        "sessionFile?": string;
        "detached?": string;
    };
    SubagentEventPayload: {
        id: string;
        event: string;
    };
    SubagentLifecycleEvent: readonly unknown[];
    SubagentProgressEvent: readonly unknown[];
    SubagentEvent: readonly unknown[];
    LivePhase: string;
    LiveRole: string;
    LivePhaseEvent: {
        type: string;
        phase: string;
    };
    LiveLevelsEvent: readonly unknown[];
    LiveTranscriptEvent: readonly unknown[];
    LiveEndEvent: readonly unknown[];
    CommandOutputEvent: readonly unknown[];
    SessionInfoUpdateEvent: readonly unknown[];
    ConfigUpdateEvent: readonly unknown[];
    RpcFrameErrorEvent: readonly unknown[];
    WidgetPlacement: string;
    SelectOptionDetail: readonly unknown[];
    AskOption: {
        label: string;
        "description?": string;
        "preview?": string;
    };
    AskQuestion: readonly unknown[];
    SelectUiRequest: {
        type: string;
        id: string;
        method: string;
        title: string;
        options: string;
        "optionDetails?": string;
        "timeout?": string;
    };
    ConfirmUiRequest: {
        type: string;
        id: string;
        method: string;
        title: string;
        message: string;
        "timeout?": string;
    };
    InputUiRequest: {
        type: string;
        id: string;
        method: string;
        title: string;
        "placeholder?": string;
        "timeout?": string;
    };
    EditorUiRequest: {
        type: string;
        id: string;
        method: string;
        title: string;
        "prefill?": string;
        "promptStyle?": string;
    };
    AskUiRequest: readonly unknown[];
    CancelUiRequest: readonly unknown[];
    NotifyUiRequest: {
        type: string;
        id: string;
        method: string;
        message: string;
        "notifyType?": string;
    };
    SetStatusUiRequest: {
        type: string;
        id: string;
        method: string;
        statusKey: string;
        "statusText?": string;
    };
    SetWidgetUiRequest: {
        type: string;
        id: string;
        method: string;
        widgetKey: string;
        "widgetLines?": string;
        "widgetPlacement?": string;
    };
    SetTitleUiRequest: {
        type: string;
        id: string;
        method: string;
        title: string;
    };
    SetEditorTextUiRequest: {
        type: string;
        id: string;
        method: string;
        text: string;
    };
    OpenUrlUiRequest: {
        type: string;
        id: string;
        method: string;
        url: string;
        "launchUrl?": readonly unknown[];
        "instructions?": string;
    };
    ExtensionUiRequest: readonly unknown[];
    AskAnswer: readonly unknown[];
    ValueUiResponse: readonly unknown[];
    ConfirmUiResponse: readonly unknown[];
    CancelUiResponse: readonly unknown[];
    AnswersUiResponse: readonly unknown[];
    ExtensionUiResponse: readonly unknown[];
    HostToolCallRequest: {
        type: string;
        id: string;
        toolCallId: string;
        toolName: string;
        arguments: string;
    };
    HostToolCancelRequest: {
        type: string;
        id: string;
        targetId: string;
    };
    HostToolResultPayload: readonly unknown[];
    HostToolUpdate: readonly unknown[];
    HostToolResult: readonly unknown[];
    HostUriOperation: string;
    HostUriRequest: {
        type: string;
        id: string;
        operation: string;
        url: string;
        "content?": readonly unknown[];
    };
    HostUriCancelRequest: {
        type: string;
        id: string;
        targetId: string;
    };
    HostUriResult: readonly unknown[];
    RpcHostRequest: readonly unknown[];
    RpcInbound: readonly unknown[];
    RpcResponse: readonly unknown[];
    ToolLoadMode: string;
    HostToolDefinition: {
        name: string;
        "label?": string;
        description: string;
        parameters: string;
        "hidden?": string;
        "loadMode?": string;
        "readsSkillUris?": string;
    };
    HostUriSchemeDefinition: {
        scheme: string;
        "description?": string;
        "writable?": string;
        "immutable?": string;
    };
};
