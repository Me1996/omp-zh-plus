/**
 * Hard-cap helper for host→guest collab frames.
 *
 * The host wraps every {@link CollabFrame} in an AES-GCM envelope and ships it
 * through the relay's WebSocket. WebSocket servers enforce a per-frame
 * `maxPayloadLength` (Bun's default is 16 MB; many proxies cap lower). A
 * single oversized payload — typically a `read`/`bash`/`search` tool result
 * captured as one multi-megabyte string, or a tool result whose `content`
 * array holds thousands of small blocks — would otherwise ship as its own
 * oversized frame and trip that limit, killing the host's WebSocket with
 * `1006 Received too big message`. `CollabSocket` treats 1006 as transient
 * and reconnects, the next guest hello triggers the same oversized send, and
 * the loop never breaks (issue #3739).
 *
 * That ceiling has to be *enforced*, not approached (issue #11433). Three
 * input shapes escaped the previous best-effort version, each reproduced
 * before the fix:
 *
 * - a payload whose size lives in its **object keys** — a single 17 MiB key,
 *   or 200 000 short keys. Keys are identity and can never be truncated, so
 *   every string/array pass returned the payload untouched;
 * - a payload nested past the engine's own serialization limit: the walk
 *   recursed once per level and threw `RangeError: Maximum call stack size
 *   exceeded` out of the `onEntryAppended` chokepoint. Every caller swallows
 *   that throw, so the real symptom was silent: the entry never reached
 *   guests (live path), or a `snapshot-chunk` train ended without its
 *   `final: true` terminator and the guest's join timed out while the host
 *   still listed it as joined (snapshot path);
 * - a CJK-heavy payload, because the cap was compared against
 *   `JSON.stringify(...).length` — UTF-16 code units, up to 3x under the
 *   bytes the relay would see.
 *
 * The shape-preserving passes still run first: keeping the wire shape is what
 * carries discriminators and ids to the guest. What survives them is replaced
 * by a *typed placeholder*, because bounding the bytes at that point means
 * abandoning the payload by definition:
 *
 * - a session entry becomes a `custom_message` that keeps the original
 *   `id`/`parentId`/`timestamp`, so the guest's branch chain stays connected
 *   and the loss is visible in the replica instead of silent;
 * - an agent event becomes a `notice`, which by contract never enters agent
 *   state and never reaches the model.
 */
import type { SessionEntry as WireSessionEntry } from "@oh-my-pi/pi-wire";
import type { AgentSessionEvent } from "../session/agent-session.js";
import type { SessionEntry } from "../session/session-entries.js";
/**
 * Per-payload ceiling for host→guest frames. Bun's default WebSocket
 * `maxPayloadLength` is 16 MB; we leave a generous margin so the AES-GCM
 * envelope (+ IV + tag), the 4-byte peer header, and the outer wire wrapper
 * fit comfortably under that on every reasonable relay.
 */
export declare const MAX_REPLICATED_PAYLOAD_BYTES: number;
/** `customType` of the entry a guest receives in place of one that cannot be shrunk. */
export declare const COLLAB_ENTRY_OMITTED_CUSTOM_TYPE = "collab-entry-too-large";
/**
 * A session entry the guest's wire grammar can represent — what the host has
 * after filtering on `isWireSessionEntry`. Both bounds preserve it: the
 * placeholder is a `custom_message`, which is a member of the host union and
 * of the wire skeleton alike, so the guest's renderer and replica loader keep
 * treating the frame as a normal entry.
 */
export type ReplicatedEntry = SessionEntry & WireSessionEntry;
/**
 * Deepest nesting the walk emits.
 *
 * The engine, not this helper, is the limit being defended: measured on Bun,
 * `JSON.stringify` and `structuredClone` both throw `RangeError` at roughly
 * 40 000 levels, and every consumer serializes a replicated payload again —
 * the host seals frames through `JSON.stringify` (crypto.ts), the guest
 * writes the replica as JSONL (guest.ts). 1 000 keeps a 40x margin under the
 * engine limit while staying far above any real entry (they nest a handful of
 * levels). Deeper payloads are elided with a marker rather than dropped, so
 * ids and shallow metadata still reach the guest.
 */
export declare const MAX_REPLICATED_DEPTH = 1000;
/**
 * UTF-8 byte length of `value`'s JSON form — the metric the relay actually
 * enforces, and therefore the only one this module compares against the
 * ceiling. `codePointLength`/`String#length` are UTF-16 code units and
 * under-count non-ASCII payloads by up to 3x.
 *
 * Returns `null` when the value cannot be serialized at all (cyclic, `BigInt`,
 * or nested past the engine's own recursion limit). Callers treat `null` as
 * "definitely over the ceiling" — that is what routes a pathological payload
 * into the placeholder path instead of shipping it.
 */
export declare function replicationByteLength(value: unknown): number | null;
/**
 * Deep-copy `value` under the same depth bound the shrink passes use, without
 * clipping a single string or array.
 *
 * This is the copier the host hands to `SessionManager.snapshotForReplication`.
 * The default there is `structuredClone`, which throws `RangeError` on a payload
 * nested past the engine's recursion limit — and that throw lands inside the
 * host's hello handler, *before* {@link shrinkReplicatedEntry} gets the chance
 * to bound the offending entry, so the joining guest never receives its
 * `final` chunk (issue #11433). Copying through the walk instead degrades only
 * the too-deep branch, and the entry still arrives with its `id`/`parentId`
 * intact.
 *
 * Bounded, not lossless: nesting past {@link MAX_REPLICATED_DEPTH} and repeated
 * ancestors become markers, exactly as in the shrink passes. Session entries are
 * JSON by construction (persisted as JSONL, shipped as JSON), so the walk's
 * container handling is not a narrowing for the values the host copies through
 * it: own `__proto__` keys survive as data (dictionary destinations) and own
 * `toJSON` methods are honored, matching what `JSON.stringify` emits for the
 * replica JSONL and the sealed wire frame (PR #11999 review).
 */
export declare function copyForReplication<T>(value: T): T;
/**
 * Bound one replicated session entry under
 * {@link MAX_REPLICATED_PAYLOAD_BYTES}.
 *
 * Shrinking is shape-preserving whenever it can be. When it cannot — size in
 * the keys, or a payload that is not serializable at all — the entry is
 * replaced by a `custom_message` that keeps `id`/`parentId`/`timestamp`, so
 * the guest's branch chain stays connected and the substitution is visible in
 * the replica. A `custom_message` is the carrier because the guest's live
 * entry path only special-cases `message`/`compaction`/`branch_summary`, and
 * because it survives the replica JSONL load that the snapshot path performs.
 *
 * The snapshot path loads the replica through the normal session machinery, so
 * on that path the placeholder does reach the guest's model context. That is
 * deliberate: the guest's model is told the content was dropped instead of
 * silently reasoning over a gap in the transcript.
 *
 * Typed on the host's own entry union rather than the wire skeleton: the
 * frame carries the rich entry and only *serializes* into the wire shape.
 *
 * Never throws: it is called from the `onEntryAppended` chokepoint, whose
 * caller swallows exceptions, and from the snapshot chunker, where a throw
 * would strand the guest without a `final` chunk.
 */
export declare function shrinkReplicatedEntry(entry: ReplicatedEntry): ReplicatedEntry;
/**
 * Emit the guest-visible notice that accompanies a live oversized-entry
 * substitution. Mirrors the wording of the placeholder so a guest that only
 * applies `message` entries to its live agent context still learns an entry
 * was dropped (PR #11999 review) — notices never enter agent state and never
 * reach the model, so this is display-only.
 */
export declare function oversizedEntryNotice(entryType: string): Extract<AgentSessionEvent, {
    type: "notice";
}>;
/**
 * Bound one replicated agent event under {@link MAX_REPLICATED_PAYLOAD_BYTES}.
 *
 * Events carry no identity to preserve, so an event that survives the
 * shape-preserving passes is replaced by a `notice` naming the omitted type —
 * notices never enter agent state and never reach the model, which keeps the
 * substitution out of the guest's context instead of silently diverging from
 * the host's view.
 */
export declare function shrinkReplicatedEvent(event: AgentSessionEvent): AgentSessionEvent;
