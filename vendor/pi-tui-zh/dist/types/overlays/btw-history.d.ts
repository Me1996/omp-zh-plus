export interface BtwHistoryTurn {
    question: string;
    answer: string;
    status: "running" | "complete" | "cancelled" | "error" | "interrupted";
    createdAt: number;
    updatedAt: number;
    error?: string;
}
export interface BtwHistoryRecord extends BtwHistoryTurn {
    id: string;
    leafId: string | null;
    followUps?: readonly BtwHistoryTurn[];
}
export declare function getBtwLatestTurn(record: BtwHistoryRecord): BtwHistoryTurn;
export declare function getBtwTurns(record: BtwHistoryRecord): readonly BtwHistoryTurn[];
/** Copy the most recent nonblank answer, preserving its original whitespace. */
export declare function getBtwCopyText(record: BtwHistoryRecord): string | undefined;
