/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type ScopeLike } from "../config/registry.js";
export declare const cfgMnemopiDbPath: import("../config/registry.js").Setting<string | undefined, "mnemopi.dbPath">;
export declare const cfgMnemopiBank: import("../config/registry.js").Setting<string | undefined, "mnemopi.bank">;
export declare const cfgMnemopiScoping: import("../config/registry.js").Setting<"global" | "per-project" | "per-project-tagged", "mnemopi.scoping">;
/**
 * Whether `retain`/`learn` can take `scope: "global"`: only Mnemopi with a bank every project
 * recalls (`global` or `per-project-tagged` scoping). Tools hide the option everywhere else.
 */
export declare function isGlobalMemoryScopeAvailable(scope: ScopeLike): boolean;
export declare const cfgMnemopiEmbeddingVariant: import("../config/registry.js").Setting<"en" | "multilingual", "mnemopi.embeddingVariant">;
export declare const cfgMnemopiAutoRecall: import("../config/registry.js").Setting<boolean, "mnemopi.autoRecall">;
export declare const cfgMnemopiAutoRetain: import("../config/registry.js").Setting<boolean, "mnemopi.autoRetain">;
export declare const cfgMnemopiPolyphonicRecall: import("../config/registry.js").Setting<boolean, "mnemopi.polyphonicRecall">;
export declare const cfgMnemopiEnhancedRecall: import("../config/registry.js").Setting<boolean, "mnemopi.enhancedRecall">;
export declare const cfgMnemopiProactiveLinking: import("../config/registry.js").Setting<boolean, "mnemopi.proactiveLinking">;
export declare const cfgMnemopiNoEmbeddings: import("../config/registry.js").Setting<boolean, "mnemopi.noEmbeddings">;
export declare const cfgMnemopiEmbeddingModel: import("../config/registry.js").Setting<string | undefined, "mnemopi.embeddingModel">;
export declare const cfgMnemopiEmbeddingApiUrl: import("../config/registry.js").Setting<string | undefined, "mnemopi.embeddingApiUrl">;
export declare const cfgMnemopiEmbeddingApiKey: import("../config/registry.js").Setting<string | undefined, "mnemopi.embeddingApiKey">;
export declare const cfgMnemopiLlmMode: import("../config/registry.js").Setting<"none" | "remote" | "smol", "mnemopi.llmMode">;
export declare const cfgMnemopiLlmBaseUrl: import("../config/registry.js").Setting<string | undefined, "mnemopi.llmBaseUrl">;
export declare const cfgMnemopiLlmApiKey: import("../config/registry.js").Setting<string | undefined, "mnemopi.llmApiKey">;
export declare const cfgMnemopiLlmModel: import("../config/registry.js").Setting<string | undefined, "mnemopi.llmModel">;
export declare const cfgMnemopiRetainEveryNTurns: import("../config/registry.js").Setting<number, "mnemopi.retainEveryNTurns">;
export declare const cfgMnemopiRecallLimit: import("../config/registry.js").Setting<number, "mnemopi.recallLimit">;
export declare const cfgMnemopiRecallContextTurns: import("../config/registry.js").Setting<number, "mnemopi.recallContextTurns">;
export declare const cfgMnemopiRecallMaxQueryChars: import("../config/registry.js").Setting<number, "mnemopi.recallMaxQueryChars">;
export declare const cfgMnemopiInjectionTokenLimit: import("../config/registry.js").Setting<number, "mnemopi.injectionTokenLimit">;
export declare const cfgMnemopiDebug: import("../config/registry.js").Setting<boolean, "mnemopi.debug">;
