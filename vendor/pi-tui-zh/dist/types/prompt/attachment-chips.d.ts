import { type Component, type ImageBudget } from "../index.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
import type { CustomEditor } from "./custom-editor.js";
/**
 * The composer attachment band: one rounded card per staged attachment, rendered directly above
 * the prompt box. Image and video cards show a live thumbnail (Kitty Unicode placeholders — the only
 * protocol whose output is plain text cells and therefore composable inside a border row) with
 * the pixel dimensions as the bottom caption; text-paste cards show the leading snippet with a
 * `+N lines` / `N chars` caption. The top caption is the same `<icon> #N` token that sits in
 * the editor buffer, in the same identity color. Cards that no longer fit the terminal width
 * are omitted rather than wrapped. Renders to nothing while no attachment is staged.
 */
export declare class AttachmentChipsBand implements Component {
    #private;
    private readonly editor;
    private readonly budget;
    private readonly requestRender;
    constructor(editor: CustomEditor, budget: ImageBudget, requestRender: () => void);
    /**
     * A wrapping `row` of chip `card`s (`omp.composer.chip`) titled with the
     * buffer token (`<icon> #N`): images and videos show the image itself,
     * pastes their leading lines; the caption carries pixel size or line/char
     * count. Hidden while nothing is staged.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
