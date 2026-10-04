import type { EditMode } from "@oh-my-pi/pi-tui-zh/tools/edit";
import type { Settings } from "../config/settings.js";
/** First `edit.modelVariants` entry whose pattern occurs in `model` (case-insensitive). */
export declare function editVariantForModel(settings: Settings, model: string | undefined): EditMode | undefined;
export interface EditModeSessionLike {
    settings: Settings;
    getActiveModelString?: () => string | undefined;
}
export declare function resolveEditMode(session: EditModeSessionLike): EditMode;
