import { type TinyLocalModelKey } from "../tiny/models.js";
export type TinyModelsAction = "download" | "list";
export interface TinyModelsCommandArgs {
    action: TinyModelsAction;
    model?: string;
    flags: {
        json?: boolean;
    };
}
export declare function resolveModels(model: string | undefined, mlx?: boolean): TinyLocalModelKey[];
export declare function runTinyModelsCommand(command: TinyModelsCommandArgs): Promise<void>;
