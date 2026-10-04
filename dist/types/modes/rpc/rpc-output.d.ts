import type { Writable } from "node:stream";
/** Synchronous event producers spill to disk while the RPC reader applies backpressure. */
export declare class RpcOutputWriter {
    #private;
    private readonly sink;
    private readonly onFailure;
    constructor(sink: Writable, onFailure: (error: Error) => void);
    write(frames: Iterable<string>): void;
    close(): Promise<void>;
}
