import { type Settings } from "../config/settings.js";
/** Throw when the native generated-file detector rejects this path. */
export declare function assertEditableFile(absolutePath: string, displayPath?: string, activeSettings?: Settings): Promise<void>;
