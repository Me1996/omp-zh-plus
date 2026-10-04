import { type BtwHistoryRecord } from "@oh-my-pi/pi-tui-zh/overlays/btw-history";
export { type BtwHistoryRecord, type BtwHistoryTurn, getBtwCopyText, getBtwLatestTurn, getBtwTurns, } from "@oh-my-pi/pi-tui-zh/overlays/btw-history";
/** Session-local sidecar storage; never reads or writes the main session journal. */
export declare class BtwHistoryStore {
    #private;
    constructor(directory: string | undefined);
    /**
     * Open the BTW history for an artifacts directory. Subagents share their
     * parent's artifacts directory, so a `scope` (the owning session id) keeps
     * each focused agent's side conversations apart from main and its siblings.
     */
    static open(artifactsDir: string | undefined, scope?: string): Promise<BtwHistoryStore>;
    getRecords(): readonly BtwHistoryRecord[];
    upsert(record: BtwHistoryRecord): Promise<void>;
    /** Retry a failed checkpoint against the original revision, without rebasing onto disk changes. */
    retry(record: BtwHistoryRecord): Promise<void>;
    flush(): Promise<void>;
}
