export interface DaemonBrokerStartOptions {
    /** Base of the exponential child-restart backoff. */
    restartBackoffBaseMs?: number;
    /**
     * Called once the broker accepts connections. An embedding host connects its
     * clients after this; a client that connects earlier finds no endpoint and
     * spawns a competing broker process.
     */
    onListening?: () => void;
}
/** Start the detached project or global daemon broker selected by the CLI worker host. */
export declare function startDaemonBrokerFromEnvironment(options?: DaemonBrokerStartOptions): Promise<void>;
