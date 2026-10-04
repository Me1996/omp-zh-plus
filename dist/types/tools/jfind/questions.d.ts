/**
 * The three request shapes the cascade sends to the judge, as `state` plus
 * one noul question per entry. Nouls give absolute probabilities, so entries
 * are thresholded independently and batches are comparable with each other.
 *
 * State objects are built with alphabetically ordered keys so the wire bytes
 * match the reference implementation (which serializes through sorted maps);
 * judgment quality was benchmarked against that exact layout.
 */
import type { JsonValue, NoulQuestion } from "@oh-my-pi/pi-ai";
import { type Passage } from "./passages.js";
import { type FileEntry } from "./tree.js";
/** A judgment request: JSON state plus noul questions keyed by entry. */
export interface Request {
    state: {
        readonly [key: string]: JsonValue;
    };
    questions: Record<string, NoulQuestion>;
}
/** Question key of the `i`th entry in a filename batch. */
export declare function entryKey(i: number): string;
/** Question key of the `k`th passage in a sketch or verification batch. */
export declare function passageKey(k: number): string;
/** One noul per file over a shared tree-rendered listing of the batch. */
export declare function nameBatch(project: string, query: string, entries: readonly FileEntry[]): Request;
/** One sketch card: the file it came from and its budgeted verbatim lines. */
export interface SketchCard {
    fileKey: string;
    rel: string;
    sketch: string;
}
/**
 * Mixed-file packing of sketch cards: one state ingestion pays for many
 * independent small cards instead of rereading a whole file to discover its
 * useful spans.
 */
export declare function sketchBatch(query: string, cards: readonly SketchCard[]): Request;
/** Verification of complete passages from one file, judged independently. */
export declare function passageBatch(query: string, rel: string, passages: readonly Passage[]): Request;
