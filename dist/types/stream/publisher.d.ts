import * as net from "node:net";
import type { StreamChatMessage } from "@oh-my-pi/pi-wire";
import type { TUI } from "@oh-my-pi/pi-tui-zh";
import type { StreamRedactor } from "./redactor.js";
export interface StreamPublisherOptions {
    cwd: string;
    sessionId: string;
    title: string;
    tui: TUI;
    redactor: StreamRedactor;
    onStatus: (status: {
        viewers: number;
    } | null) => void;
    onChat?: (message: StreamChatMessage) => void;
}
export interface LazyStreamPublisherOptions extends Omit<StreamPublisherOptions, "redactor"> {
    loadRedactor: () => Promise<StreamRedactor>;
}
/** Publishes one interactive session's already-redacted terminal rows. */
export declare class StreamPublisher {
    #private;
    static connect(options: StreamPublisherOptions): Promise<StreamPublisher | null>;
    /** Connect and complete the protocol handshake before collecting local secrets. */
    static connectLazy(options: LazyStreamPublisherOptions): Promise<StreamPublisher | null>;
    constructor(socket: net.Socket, options: Omit<StreamPublisherOptions, "redactor">, redactor: StreamRedactor);
    /** Swap the row redactor and force a full repaint so the live viewport is re-redacted. */
    setRedactor(redactor: StreamRedactor): void;
    dispose(): void;
}
