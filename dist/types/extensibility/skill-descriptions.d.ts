import { type AgentTelemetry } from "@oh-my-pi/pi-agent-core";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import type { Skill } from "./skills.js";
export type SkillDescriptionCompressor = (name: string, description: string, request: string) => Promise<string>;
/**
 * Resolve the configured fast role for each background request, without using the foreground model.
 * `getTelemetry` supplies the telemetry handle for each request's chat span.
 */
export declare function createSkillDescriptionCompressor(registry: ModelRegistry, settings: Settings, sessionId?: string, getTelemetry?: () => AgentTelemetry | undefined): SkillDescriptionCompressor;
/** A deterministic, bounded routing hint while model compression is pending. */
export declare function previewSkillDescription(description: string): string;
/**
 * Process-wide store at {@link getSkillDescriptionsDbPath}, opened on first use
 * and closed at exit. Opening per render and per compression write created and
 * deleted the `-wal`/`-shm` sidecars and re-ran PRAGMA/CREATE/chmod every time.
 * `undefined` when it cannot be opened (logged once; prompts keep the bounded
 * previews) and under the test runner, so tests never read or write the user's
 * cache; tests open {@link SkillDescriptionStore.open} explicitly.
 */
export declare function sharedSkillDescriptionStore(): SkillDescriptionStore | undefined;
/**
 * Store under an SDK session's own `agentDir` when it differs from the process
 * agent dir; the caller closes it with the session. `undefined` under the test
 * runner (same isolation as {@link sharedSkillDescriptionStore}) or when it
 * cannot be opened (logged; the catalog then uses the shared store).
 */
export declare function openSessionSkillDescriptionStore(agentDir: string): SkillDescriptionStore | undefined;
/** SQLite store of model-compressed skill descriptions, keyed by prompt + skill content hash. */
export declare class SkillDescriptionStore {
    #private;
    /** Database file; scopes in-flight compression jobs shared by catalogs on this store. */
    readonly path: string;
    private constructor();
    /**
     * Open (creating if needed) the store at `dbPath`.
     * @throws when the directory or database cannot be created.
     */
    static open(dbPath?: string): SkillDescriptionStore;
    /** @throws on SQLite errors. */
    get(key: string): string | undefined;
    /** @throws on SQLite errors. */
    put(key: string, description: string): void;
    close(): void;
    [Symbol.dispose](): void;
}
/** One prompt/session snapshot; completing a background job never mutates its rendered descriptions. */
export declare class SkillDescriptionCatalog {
    #private;
    /** `store` defaults to {@link sharedSkillDescriptionStore}; without one, prompts keep previews. */
    constructor(options?: {
        store?: SkillDescriptionStore;
        compress?: SkillDescriptionCompressor;
    });
    /** Read the session's frozen prompt hints without starting new model work. */
    snapshot(skills: readonly Skill[]): Array<Skill & {
        description: string;
    }>;
    render(skills: readonly Skill[]): Array<Skill & {
        description: string;
    }>;
    /** Await background writes already scheduled by this catalog (for shutdown or tests). */
    waitForPending(): Promise<void>;
}
