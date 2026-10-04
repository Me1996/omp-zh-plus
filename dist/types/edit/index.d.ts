import type { AgentTool, AgentToolArgStream, AgentToolArgStreamInit, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { Model, ToolExample } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "../tools/index.js";
import { type EditMode } from "@oh-my-pi/pi-tui-zh/tools/edit";
import { type EditToolDetails } from "@oh-my-pi/pi-tui-zh/tools/edit";
import { type ApplyPatchParams, applyPatchSchema, type HashlineParams, hashlineEditParamsSchema, type PatchParams, patchEditSchema, type ReplaceBatchParams, type ReplaceParams, replaceEditSchema, type SloppyParams, sloppyEditSchema } from "./schemas.js";
export type { EditRenderContext, EditToolDetails, EditToolPerFileResult, Operation, PerFileDiffPreview, } from "@oh-my-pi/pi-tui-zh/tools/edit";
export * from "./schemas.js";
export * from "./store.js";
export { type EditMode } from "@oh-my-pi/pi-tui-zh/tools/edit";
type TInput = typeof replaceEditSchema | typeof patchEditSchema | typeof hashlineEditParamsSchema | typeof applyPatchSchema | typeof sloppyEditSchema;
type EditParams = ReplaceParams | ReplaceBatchParams | PatchParams | HashlineParams | ApplyPatchParams | SloppyParams;
/**
 * Compact tool description markdown for `mode`, when one exists. TS-side
 * source (not the native addon) so PR CI — which tests against the latest
 * *release* addons — exercises the same rendering production does.
 */
export declare function editDescriptionCompact(mode: EditMode): string | undefined;
/**
 * Tool description for `mode`, at the density the model's catalog policy
 * selects (`edit-prompt-variant`). Models without the compact variant — or
 * modes that have none — keep the full prompt; both renderings preserve every
 * operation and invariant.
 */
export declare function resolveEditToolDescription(mode: EditMode, model: Pick<Model, "editPromptVariant"> | undefined): string;
export declare class EditTool implements AgentTool<TInput> {
    #private;
    private readonly session;
    readonly name = "edit";
    readonly label = "Edit";
    readonly loadMode = "essential";
    readonly concurrency = "exclusive";
    readonly strict = true;
    constructor(session: ToolSession, mode?: EditMode);
    get mode(): EditMode;
    get description(): string;
    get parameters(): TInput;
    get examples(): readonly ToolExample[] | undefined;
    get customFormat(): {
        syntax: "lark";
        definition: string;
    } | undefined;
    get customWireName(): string | undefined;
    /**
     * Strictest write decision ({@link strictestApproval}) over every path the payload writes:
     * section targets plus move/rename destinations. "write" while no target is known.
     */
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly formatApprovalDetails: (args: unknown) => string[];
    matcherDigest(args: unknown): string | undefined;
    matcherPaths(args: unknown): readonly string[] | undefined;
    matcherEntries(args: unknown): readonly {
        path: string;
        digest: string;
    }[] | undefined;
    openArgStream(init: AgentToolArgStreamInit): AgentToolArgStream;
    execute(toolCallId: string, params: EditParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<EditToolDetails, TInput>, context?: AgentToolContext): Promise<AgentToolResult<EditToolDetails, TInput>>;
}
