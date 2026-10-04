/**
 * `omp auth-gateway stdio`: the gateway's routes as JSON lines on stdin and
 * stdout (`serveAuthGatewayStdio`), for a parent process that wants omp's
 * inference without an HTTP listener or a bearer token.
 *
 * Unlike `serve` it runs on this omp's own credentials (the broker when one is
 * configured, else the local store), models (`models.yml` and extension
 * providers included) and settings. A request's `model` is an omp model
 * selector, as `--model` takes it ({@link selectorCandidates}); an attempt
 * that fails before its reply starts moves on to the next candidate. Serving
 * ends when stdin does.
 */
import type { Api, Model } from "@oh-my-pi/pi-ai";
import { ModelRegistry } from "../config/model-registry.js";
import { Settings } from "../config/settings.js";
/**
 * The models a request naming `selector` may run on, in order: the model
 * `--model` would pick (the first entry of a comma list that resolves), then
 * that model's `retry.fallbackChains` (its role's chain when the entry named a
 * role). Empty when no entry resolves.
 */
export declare function selectorCandidates(selector: string, settings: Settings, registry: Pick<ModelRegistry, "getAll" | "getAvailable">): Model<Api>[];
/** Serves the gateway on stdin/stdout until stdin ends, then exits. */
export declare function runAuthGatewayStdio(): Promise<void>;
