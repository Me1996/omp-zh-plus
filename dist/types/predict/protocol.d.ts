import type { PredictedWord } from "@oh-my-pi/pi-natives";
export { TEXT_PREDICT_WORKER_ARG } from "../cli/worker-selectors.js";
/** Global broker scope owning the daemon. */
export declare const TEXT_PREDICT_BROKER_SCOPE = "text-predict";
/** Environment key carrying the endpoint the daemon listens on. */
export declare const TEXT_PREDICT_SOCKET_ENV = "OMP_TEXT_PREDICT_SOCKET";
/** Environment key carrying the agent directory whose history and state the daemon serves. */
export declare const TEXT_PREDICT_AGENT_DIR_ENV = "OMP_TEXT_PREDICT_AGENT_DIR";
/** Broker readiness regex matched against {@link textPredictReadyBanner}. */
export declare const TEXT_PREDICT_READY_PATTERN: string;
/** Engines the daemon can open (`TextPredictor` methods); clients resolve `auto` before asking. */
export type TextPredictMethod = "ngram" | "smollm" | "apple";
/** Banner printed on stdout once the daemon accepts connections. */
export declare function textPredictReadyBanner(endpoint: string): string;
/**
 * Daemon identity for one agent directory: the broker daemon name and its
 * endpoint inside the broker runtime dir. Different agent directories (profiles,
 * tests) get separate daemons because history and learned state are per agent dir.
 */
export declare function textPredictDaemon(runtimeDir: string, agentDir: string): {
    name: string;
    endpoint: string;
};
/** Client → daemon request. */
export type TextPredictRequest = {
    id: number;
    op: "ping";
} | {
    id: number;
    op: "complete";
    method: TextPredictMethod;
    before: string;
    prefix: string;
} | {
    id: number;
    op: "feedback";
    method: TextPredictMethod;
    before: string;
    prefix: string;
    suggestion: string;
    accepted: boolean;
}
/** Ingest history rows newer than each open engine's cursor. */
 | {
    id: number;
    op: "sync";
}
/** Persist and exit (a client found a daemon from another omp version). */
 | {
    id: number;
    op: "shutdown";
};
/** Daemon → client response. */
export type TextPredictResponse = {
    id: number;
    ok: true;
    op: "ping";
    version: string;
    pid: number;
    engines: TextPredictMethod[];
} | {
    id: number;
    ok: true;
    op: "complete";
    suggestion: PredictedWord | null;
} | {
    id: number;
    ok: true;
    op: "feedback" | "shutdown";
} | {
    id: number;
    ok: true;
    op: "sync";
    ingested: number;
} | {
    id: number;
    ok: false;
    error: string;
};
