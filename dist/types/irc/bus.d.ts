/**
 * IrcBus - Process-global mailbox bus for agent-to-agent messaging.
 *
 * Replaces the old auto-reply model: a `send` never blocks on the recipient
 * generating anything. Delivery resolves the recipient via the global
 * AgentRegistry — parked agents are revived through the
 * AgentLifecycleManager, idle agents are woken with a real turn, and busy
 * agents receive the message as a non-interrupting aside at the next step
 * boundary (see AgentSession.deliverIrcMessage).
 */
import { type IrcDeliveryReceipt, type IrcMessage } from "@oh-my-pi/pi-tui-zh/tools/irc";
import { AgentLifecycleManager } from "../registry/agent-lifecycle.js";
import { AgentRegistry } from "../registry/agent-registry.js";
export declare class IrcBus {
    #private;
    static global(): IrcBus;
    /** Reset the global bus. Test-only. */
    static resetGlobalForTests(): void;
    constructor(registry?: AgentRegistry, lifecycle?: AgentLifecycleManager);
    /**
     * Fire-and-forget delivery. Never blocks on the recipient generating
     * anything: the receipt reports how the message reached the recipient
     * (waiter/aside = "injected", idle wake = "woken", park revival =
     * "revived"), not what they did with it.
     *
     * Mailbox semantics: a successfully delivered message never lingers in
     * the recipient's mailbox — injection/wake puts the full body into their
     * context, so buffering it too would double-deliver via a later
     * `wait`/`inbox` and inflate unread counts. Only a failed live hand-off
     * is buffered for the recipient to drain later.
     *
     * `opts.suppressRelay` skips the display-only main-UI relay for this leg.
     * Set by broadcast fan-out when the same broadcast also targets the main
     * agent directly: the main agent then already sees the body as its own
     * incoming card, so relaying the sibling legs would duplicate it.
     */
    send(msg: Omit<IrcMessage, "id" | "ts">, opts?: {
        suppressRelay?: boolean;
    }): Promise<IrcDeliveryReceipt>;
    /**
     * Whether `from` successfully sent `to` anything at or after `sinceTs`.
     * The wake-turn relay uses it to skip agents that already answered their
     * waker themselves.
     */
    sentSince(from: string, to: string, sinceTs: number): boolean;
    /**
     * Block until a message for `agentId` (optionally from `filter.from`)
     * arrives; consume + return it. Null on timeout (`timeoutMs <= 0` waits
     * forever). Rejects when `signal` aborts. By default, already-buffered
     * mail satisfies the wait before parking a future waiter; callers that
     * need a strictly future reply can disable that drain.
     */
    wait(agentId: string, filter: {
        from?: string;
    }, timeoutMs: number, signal?: AbortSignal, options?: {
        drainPending?: boolean;
    }): Promise<IrcMessage | null>;
    /**
     * Consume the OLDEST pending message for `agentId` (optionally restricted
     * to `from`), leaving the rest of the mailbox intact. This is the exact
     * atomic step `wait` performs on entry, exposed for callers that must not
     * block without draining the entire backlog.
     */
    take(agentId: string, from?: string): IrcMessage | undefined;
    /** Unread count for the local Agent Hub overlay. */
    unreadCount(agentId: string): number;
}
