import type { PredictedWord } from "@oh-my-pi/pi-natives";
import type { WordCompletionEngine, WordPredictionBackend } from "@oh-my-pi/pi-tui-zh/prompt/word-completion";
import { type TextPredictMethod } from "./protocol.js";
/**
 * Engine serving a configured method. `auto` is ngram, so it never downloads
 * SmolLM's weights; `apple` falls back to ngram off macOS.
 */
export declare function resolveTextPredictMethod(method: WordCompletionEngine): TextPredictMethod;
/** One daemon answer: the suggestion and the engine that produced it. */
export interface TextPrediction {
    engine: TextPredictMethod;
    suggestion: PredictedWord | null;
}
/** Word-prediction backend for a configured engine, served by the daemon. */
export declare function textPredictionBackend(method: WordCompletionEngine): WordPredictionBackend;
/**
 * One completion from the daemon with its confidence, for diagnostics such as
 * `omp predict`. Unlike the editor backend, failures reject instead of
 * degrading to no ghost text.
 */
export declare function requestTextPrediction(method: WordCompletionEngine, before: string, prefix: string): Promise<TextPrediction>;
/**
 * Close this process's daemon connection (the daemon keeps running). For
 * short-lived commands such as `omp predict`; the composer keeps its
 * connection for the process lifetime.
 */
export declare function closeTextPrediction(): void;
/** Ask a running daemon to ingest newly written history rows. */
export declare function syncTextPrediction(): void;
/**
 * Distribution smoke test: start the worker through the CLI entry with an
 * empty agent directory, then ping it, answer one `ngram` completion, sync,
 * and shut it down.
 */
export declare function smokeTestTextPredictDaemon(): Promise<void>;
