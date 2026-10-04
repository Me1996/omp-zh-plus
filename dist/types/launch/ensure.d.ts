import type { DaemonBrokerClient } from "./client.js";
import type { DaemonSnapshot } from "@oh-my-pi/pi-tui-zh/tools/daemon";
/** Snapshot a broker daemon, treating "unknown daemon" and broker errors as absent. */
export declare function describeQuietly(client: DaemonBrokerClient, name: string, label: string, signal?: AbortSignal): Promise<DaemonSnapshot | undefined>;
/** Block until the daemon reports ready; undefined on timeout or pre-ready exit. */
export declare function waitReady(client: DaemonBrokerClient, name: string, label: string, signal?: AbortSignal, timeoutMs?: number): Promise<DaemonSnapshot | undefined>;
/**
 * Best-effort stop before replacing a wedged or endpoint-less daemon. Resolves
 * with the broker's post-stop snapshot when one arrived, so callers that need
 * proof the daemon actually ended can require a terminal state; a rejected,
 * unanswered, or aborted stop resolves `undefined` — like the other quiet
 * helpers here, the RPC failure is logged and absorbed rather than thrown.
 */
export declare function stopQuietly(client: DaemonBrokerClient, name: string, label: string, signal?: AbortSignal): Promise<DaemonSnapshot | undefined>;
