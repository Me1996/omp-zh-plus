import type { CollabFrame, RelayControlMessage } from "./protocol.js";
/**
 * How long after a transient drop a host keeps retrying the relay's duplicate-host
 * close (4009). The client can see its connection end before the relay does, and
 * the relay refuses the reconnect until its liveness check retires the old socket:
 * the public relay took about 40 s for a connection that went silent, and Bun's
 * default WebSocket idle timeout, which the reference relay inherits, is 120 s. A
 * refusal after this window, or on a first connect, is a real second host.
 */
export declare const HOST_RECLAIM_WINDOW_MS = 150000;
/**
 * Backoff cap for those reclaim retries. Each one is a single upgrade the relay
 * refuses at once, so a short cap costs little and lands the reclaim within a few
 * seconds of the relay retiring the old socket instead of up to 30 s later.
 */
export declare const HOST_RECLAIM_BACKOFF_MAX_MS = 5000;
/**
 * How long a reclaim-time open stays provisional. The relay refuses a duplicate
 * host from its open handler, so the 4009 close frame follows the upgrade
 * response directly; an open that outlives this (or delivers any relay message
 * first) is accepted. Until then the room reset, `onOpen` and the send queue stay
 * untouched, so a refusal cannot drop the guest roster or drain the backlog into
 * a doomed socket.
 */
export declare const HOST_RECLAIM_CONFIRM_MS = 1000;
export interface CollabSocketOptions {
    /** wss://host[:port]/r/<roomId> — no query string. */
    wsUrl: string;
    role: "host" | "guest";
    key: CryptoKey;
}
export declare class CollabSocket {
    #private;
    /** Fires after every successful (re)connect. */
    onOpen?: () => void;
    onFrame?: (frame: CollabFrame, fromPeer: number) => void;
    onControl?: (msg: RelayControlMessage) => void;
    /** Fires on each close; `willReconnect` distinguishes retries from terminal shutdown. */
    onClose?: (reason: string, willReconnect: boolean) => void;
    constructor(opts: CollabSocketOptions);
    get isOpen(): boolean;
    /**
     * False once the relay has retired this peer. Owners read this instead of
     * keeping their own departure bookkeeping: a frame that finishes decrypting
     * after its sender's `peer-left` sees `false` here, because reception order is
     * exact even though dispatch order is not.
     */
    isServing(peerId: number): boolean;
    /** Fires on every reconnect: the relay recreated the room and reissues peer ids from 1. */
    onRoomRecreated?: () => void;
    connect(): void;
    send(frame: CollabFrame, targetPeer?: number): void;
    /** Keeps a snapshot contiguous with its welcome and ahead of subsequent live traffic. */
    sendBatch(frames: Iterable<CollabFrame>, targetPeer?: number): void;
    /**
     * Discard everything still queued for a peer that left. The queue is shared
     * and strictly FIFO, so a half-delivered snapshot would otherwise hold its
     * head and stall every later frame — including the next guest's welcome —
     * behind a retransmission the relay drops on arrival.
     *
     * @returns how many queued entries were discarded.
     */
    dropPeer(peerId: number): number;
    /**
     * Resolves once regular sends queued before this call have been sealed and are
     * either written to the transport or retained as a prepared envelope.
     */
    flush(): Promise<void>;
    /** Revoke unsent frames, including sealing work, before admitting a final frame. */
    discardPendingSends(): void;
    /** Intentional close: clears any retry timer, suppresses reconnect. A later connect() starts fresh. */
    close(): void;
}
