/**
 * Per-session policy gate for advisor `advise()` calls.
 *
 * The advisor system prompt tells the watcher model a per-update advice budget
 * (default 4 non-blockers, `blocker` exempt):
 *
 * > max N non-blockers/update (`blocker` exempt)
 * > NEVER repeat advice you already gave, and NEVER send the same advice twice
 *
 * Real advisor models violate this. Issue #3520 captured a session where
 * `__advisor.jsonl` recorded 309 `advise` calls covering 92 unique notes —
 * 114× `Stop.`, 52× `No issue; continue.`, 41× `Done.` — flooding the primary
 * transcript with `<advisory severity="blocker">Stop.</advisory>` after the
 * task was already complete. The fix is to make the rules load-bearing in code
 * instead of prose: drop duplicates, content-free self-talk, and over-budget
 * calls at the `AdviseTool` admission boundary so the primary stays clean even when
 * the advisor misbehaves.
 *
 * The guard is the single admission authority: every decision carries a
 * truthful {@link AdvisorSuppressionReason} that `AdviseTool` surfaces
 * verbatim in its acknowledgment — a rejected note is never described as
 * recorded, and a rate-limited note is never mislabeled a duplicate.
 */
/**
 * Case-insensitive, punctuation-folded normalization. Collapses every run of
 * non-letter / non-digit characters into a single space and trims, so
 * `"Stop."`, `"*Stop*"`, and `"  stop  "` all key to `stop`, while
 * `"No issue; continue."` keys to `no issue continue`.
 *
 * Exported for tests.
 */
export declare function normalizeAdvisorNote(note: string): string;
/** Maximum non-blocker advise notes allowed per update cycle across all configurations. */
export declare const ADVISOR_MAX_BUDGET_PER_UPDATE = 32;
/** Default non-blocker advise notes allowed per update cycle when unspecified. */
export declare const ADVISOR_DEFAULT_BUDGET_PER_UPDATE = 4;
/** Why the guard suppressed a note. Surfaced verbatim in the tool acknowledgment. */
export type AdvisorSuppressionReason = "empty" | "noise" | "duplicate" | "rate-limit";
/**
 * The guard's admission decision for one `advise()` call — the single source
 * of truth `AdviseTool` acts on; the tool never re-infers eviction or
 * suppression policy from its own state.
 */
export interface AdvisorAdmission {
    /** Whether the note may reach the primary (routed now or held for a deferred flush). */
    accepted: boolean;
    /** Why a suppressed note was rejected. Set only when `accepted` is false. */
    reason?: AdvisorSuppressionReason;
    /**
     * Normalized key of a still-pending note from the SAME update that this
     * admission displaced (budget full, strictly higher severity). The caller
     * MUST drop it from its pending backlog. Only pending notes are ever
     * displaced — a note already routed to the primary keeps its budget slot,
     * because a delivery cannot be retracted.
     */
    displacedKey?: string;
}
/**
 * Decides whether an advisor `advise()` call should reach the primary agent.
 *
 * Enforces — in this order — the noise filter, session-scoped rank-aware
 * dedupe (FIFO-evicted at {@link DEFAULT_HISTORY_CAPACITY}), and a per-update
 * budget of admitted non-blocker notes. Suppressed calls never consume the
 * budget — a noise call doesn't burn the slot for a real concern that follows
 * in the same update. A `blocker` is exempt from the budget: it must always
 * interrupt, so a lower-severity note emitted earlier in the same update can
 * never rate-limit it out.
 *
 * Dedupe is rank-aware: re-raising the same text at a strictly higher
 * severity is a real escalation (nit → concern → blocker), not a repeat, and
 * is admitted — an already-delivered nit re-raised as a blocker still
 * interrupts. Equal or lower severity re-raises stay suppressed, so an
 * advisor cannot bypass dedupe by retagging the same text sideways.
 *
 * The budget is rank-aware within a single update: when it is full, a
 * strictly-higher-severity note displaces the lowest-rank STILL-PENDING slot
 * (a queued concern kicks out a queued nit) and the decision names the
 * displaced note via {@link AdvisorAdmission.displacedKey}. Routed notes
 * remain charged and cannot be displaced — delivery cannot be retracted to
 * free a slot. With a budget of 1 this collapses to one non-blocker per
 * update with concern-evicts-pending-nit; with the default budget 4, up to 4
 * non-blockers are admitted before displacement applies.
 *
 * Reset on advisor reset (compaction, session switch, `/new`) via
 * {@link reset}. Per-update budget is cleared at the start of every advisor
 * `agent.prompt()` cycle via {@link beginUpdate} (driven by
 * `AdviseTool.beginUpdate`).
 */
export declare class AdvisorEmissionGuard {
    #private;
    constructor(opts?: {
        capacity?: number;
        budgetPerUpdate?: number;
    });
    /**
     * Drop all dedupe and per-update state. Called when the advisor runtime is
     * reset — same boundary as `yieldQueue.clear("advisor")`, so a re-primed
     * advisor can re-raise old issues (the primary transcript was rewritten).
     * Driven by `AdviseTool.resetDeliveredNotes()`.
     */
    reset(): void;
    /**
     * Clear the per-update budget. Called at the start of every advisor
     * `agent.prompt()` cycle (via `AdviseTool.beginUpdate`) so the next advisor
     * model cycle starts with a fresh budget. Notes still pending from earlier
     * updates keep their reservations — they hold no slot here and cannot be
     * displaced by the new update's admissions.
     */
    beginUpdate(): void;
    /**
     * Record that a still-pending note was re-raised at a strictly higher
     * severity and is being escalated in place — no new admission, no extra
     * budget. Keeps the dedupe rank and any current-update slot coherent, so a
     * later equal/lower repeat of the text stays suppressed and displacement
     * compares the note's real rank. No-op when `rank` does not exceed the
     * recorded rank.
     */
    escalatePending(note: string, rank: number): void;
    /**
     * Mark a previously admitted pending note as routed to the primary (a
     * deferred flush delivered it). Its budget slot — when still within the
     * originating update — becomes non-displaceable: a routed note cannot be
     * retracted to free budget. No-op once the update boundary has cleared the
     * slot.
     */
    markRouted(note: string): void;
    /**
     * Decide whether the proposed note may reach the primary. The decision is
     * the single admission authority: on `accepted` the guard has recorded the
     * note (consumed budget where due, updated the dedupe rank) and names any
     * displaced pending note; on rejection the `reason` is the truthful
     * classification for the advisor-facing acknowledgment.
     *
     * `pending` declares the caller's routing intent: withheld behind an
     * in-progress primary turn (displaceable by a later strictly-higher-rank
     * admission this update) versus routed immediately (charged, never
     * displaceable). A note that fails the noise/empty/dedupe filter never
     * consumes the budget, so a suppressed phrase cannot burn the update's
     * slot ahead of a substantive concern. Empty / whitespace-only notes are
     * suppressed defensively even though the tool-args contract requires a
     * non-empty string.
     */
    admit(note: string, opts: {
        rank: number;
        pending: boolean;
    }): AdvisorAdmission;
}
