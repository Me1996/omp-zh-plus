export declare class EventBus {
    #private;
    emit(channel: string, data: unknown): void;
    on(channel: string, handler: (data: unknown) => void): () => void;
    clear(): void;
}
/**
 * Publishes a subagent frame on the session bus and the observability bus.
 * SDK embedders may pass the same EventBus for both slots; the identity check
 * skips the aliased re-emit so listeners never see duplicate frames.
 */
export declare function emitSubagentFrame(eventBus: EventBus | undefined, subagentEventBus: EventBus | undefined, channel: string, payload: unknown): void;
