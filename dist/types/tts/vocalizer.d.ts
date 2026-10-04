/**
 * Streaming assistant speech-vocalization.
 *
 * The vocalizer turns the assistant's STREAMING output into spoken audio as a
 * side effect of the normal turn. Two pipelines share the synthesis/playback
 * tail:
 *
 * - Mechanical (default): deltas run through a {@link SpeakableStream} — which
 *   drops code/tables/markup, speaks link labels and URL hosts, and cuts
 *   speakable segments the moment a boundary appears — and each ready segment
 *   is pushed to the TTS worker.
 * - Enhanced (`speech.enhanced`, requires a session-wired
 *   {@link SpeechEnhancer}): deltas accumulate into fence-aware markdown
 *   blocks; each block (small ones coalesced) is rewritten into natural spoken
 *   prose by the tiny/smol model — at most {@link MAX_REWRITES_IN_FLIGHT}
 *   completions in flight, results pushed strictly in order — then segmented
 *   by the same {@link SpeakableStream} as a safety net. A failed or timed-out
 *   rewrite falls back to mechanical cleanup of the raw block, so speech never
 *   blocks on the model.
 *
 * In both modes the synthesis session (worker, player) opens lazily on the
 * first speakable segment, and an idle timer speaks buffered text when
 * generation stalls (tool call, thinking block). One
 * {@link StreamingAudioPlayer} per utterance plays chunks back gaplessly;
 * utterance playback is chained so sequential utterances never overlap.
 *
 * Overspeech control:
 * - {@link clear} stops playback instantly (kills every live player) and
 *   aborts in-flight synthesis and rewrites — wired to a new turn, an
 *   Esc/Ctrl+C interrupt, and a sent message.
 * - {@link duck}/{@link unduck} lower/restore the volume while the user is
 *   speaking (push-to-talk), so the assistant doesn't talk over them.
 *
 * Errors are swallowed (debug-logged) so a synthesis or playback failure never
 * throws into the turn. A process-level singleton ({@link vocalizer}) is shared
 * by the event controller (streaming deltas) and the ask tool (spoken
 * questions); the event controller wires the per-session model source and
 * enhancer via {@link Vocalizer.setModelSource} and {@link Vocalizer.setEnhancer}.
 */
import type { ModelBrowserRegistry } from "@oh-my-pi/pi-tui-zh/overlays/model-browser";
import { type Settings } from "../config/settings.js";
import { type SpeechEnhancer } from "./speech-enhancer.js";
export interface VocalizerModelSource {
    settings: Settings;
    registry: ModelBrowserRegistry;
}
/** Resolve the first speech-role candidate that the local streaming worker can run. */
export declare function resolveLocalSpeechModelId(source: VocalizerModelSource): string;
export interface VocalizerPlayer {
    start(sampleRate: number): void;
    write(pcm: Float32Array): void;
    setGain(gain: number): void;
    end(): Promise<void>;
    stop(): void;
}
export declare class Vocalizer {
    #private;
    constructor(createPlayer?: () => VocalizerPlayer);
    /** Wire (or drop) the per-session enhanced-rewrite service. */
    setEnhancer(enhancer: SpeechEnhancer | null): void;
    /** Wire (or drop) the live per-session model source used by local speech synthesis. */
    setModelSource(source: VocalizerModelSource | null): void;
    /**
     * Suppress new vocalization until the returned idempotent release function runs.
     * Existing synthesis and playback stop immediately; nested scopes release independently.
     */
    suspend(): () => void;
    /**
     * Stream a delta of assistant text into the pipeline. No-op when
     * vocalization is disabled. The synthesis session (worker, player) is only
     * opened once the first speakable segment exists, so a reply that
     * normalizes to silence (pure code, tables, URLs) costs nothing. The
     * trailing partial is flushed by {@link flush} or the idle timer. The
     * pipeline (enhanced vs mechanical) is latched per utterance.
     */
    pushDelta(text: string): void;
    /**
     * Close the current input stream (call at message/turn end). Drains the
     * trailing partial as final segments; in enhanced mode the session ends
     * only after the last in-flight rewrite has pushed, while the next
     * utterance may already be streaming.
     */
    flush(): void;
    /**
     * Speak a complete piece of text in one shot (ask questions, yield-mode final
     * message): stream it in and immediately close the input. No-op when disabled.
     */
    speak(text: string): void;
    /**
     * Interrupt and drop every utterance, killing in-flight playback, synthesis,
     * and rewrites (new turn / user message / Esc interrupt). Audio stops at once.
     */
    clear(): void;
    /**
     * True while any utterance is still audible or synthesizing — a live
     * player, an unfinished stream handle, or an in-flight rewrite is enough.
     * Callers (Esc handler) treat this as the "silence me" signal.
     */
    isSpeaking(): boolean;
    /** Lower the volume while the user is speaking (push-to-talk), so speech doesn't drown them out. */
    duck(): void;
    /** Restore full volume once the user stops speaking. */
    unduck(): void;
    /** Resolve once the playback chain has drained (tests / shutdown). */
    idle(): Promise<void>;
}
/** Process-level vocalizer shared by the event controller and the ask tool. */
export declare const vocalizer: Vocalizer;
