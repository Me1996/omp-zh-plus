/**
 * The `smollm` setting's ghost text: SmolLM's pick blended with n-gram's.
 *
 * Each engine's word scores its weighted confidence, plus the other engine's
 * weighted confidence when both picked the same word; the higher score wins
 * and shows at or above {@link SHOW_THRESHOLD}. On a replay of 400 held-out
 * prompts (see `pi_predict::ngram` docs) the blend saved 39.6 % of keystrokes
 * against SmolLM's 37.7 % and n-gram's 32.4 %, at a similar wrong-ghost rate.
 * Without SmolLM (weights still downloading, or it failed to load) the blend
 * degrades to n-gram at a ~0.17 threshold.
 */
import type { PredictedWord } from "@oh-my-pi/pi-natives";
/** Blend both engines' answers for one query; `null` shows nothing. */
export declare function blendPredictions(ngram: PredictedWord | null, smollm: PredictedWord | null): PredictedWord | null;
