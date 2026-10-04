import { type TspEvent, type TspReply, type TspVerb } from "@oh-my-pi/pi-wire";
/** Every TSP message starts with this. */
export declare const TSP_PREFIX = "\u001B_tsp;";
/** The terminal's hello reply. */
export type TspHello = Extract<TspReply, {
    r: "hello";
}>;
/** A decoded terminal → program message. */
export type TspIncoming = {
    verb: "r";
    reply: TspReply;
} | {
    verb: "e";
    event: TspEvent;
};
/** Message parameters (`k=v`, ASCII, never containing `;`). */
export type TspParams = Readonly<Record<string, string | number>>;
/** Split `body` into pieces of at most `limit` UTF-8 bytes, never inside a code point. */
export declare function splitUtf8(body: string, limit: number): string[];
/**
 * Encode one logical message, chunked when `body` exceeds `limit` UTF-8 bytes.
 * Returns the complete byte string to write (all chunks, in order).
 */
export declare function encodeTspMessage(verb: TspVerb, body: string, params?: TspParams, limit?: number): string;
/** Encode a JSON message body. */
export declare function encodeTspJson(verb: TspVerb, value: unknown, params?: TspParams, limit?: number): string;
/**
 * The `hello` query; callers follow it with a DA1 sentinel. `features: ["edit"]`
 * tells the terminal that omp applies its `edit` events (TSP §8.5), so it may keep a
 * native selection in omp's editors; without it, every key stays omp's. `"undo"`
 * says omp applies `undo` events, so the terminal may turn ⌃Z in a field into one.
 * `"send"` accepts an explicit prompt for a live composer without simulating keys.
 */
export declare function encodeTspHelloQuery(version?: string): string;
/** One decoded APC message: verb, parameters and raw body. */
export interface TspRawMessage {
    verb: string;
    params: Record<string, string>;
    body: string;
}
/** Split a complete `ESC _ tsp;… ESC \` string into verb, parameters and body; null when it isn't one. */
export declare function splitTspMessage(sequence: string): TspRawMessage | null;
/**
 * Reassembles chunked terminal → program messages and decodes replies and
 * events. Unknown verbs, unknown events and unknown fields are tolerated
 * (ignored or passed through); malformed input yields null.
 */
export declare class TspReader {
    #private;
    /** Feed one complete APC string. Returns the decoded message once complete, else null. */
    feed(sequence: string): TspIncoming | null;
}
/** Decode an unchunked reply/event body. Null for malformed JSON, missing fields or program → terminal verbs. */
export declare function decodeTspBody(verb: string, body: string): TspIncoming | null;
/** Decode one complete, unchunked terminal → program message. */
export declare function parseTspMessage(sequence: string): TspIncoming | null;
