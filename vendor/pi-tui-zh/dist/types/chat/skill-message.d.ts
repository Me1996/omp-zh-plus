import { Container } from "../tui.js";
import type { CustomMessage, SkillPromptDetails } from "./messages.js";
import { type NativeNode, type NativeUiEvent } from "../native/node.js";
/**
 * Transcript row for a user-invoked skill. Two layouts, chosen by where the
 * `/skill:<name>` token sat in the submitted draft:
 *
 * - **Callout** (token first): a user bubble with a skill-colored left rail,
 *   the skill chip and prompt size as its header, then the rest of the draft
 *   as full Markdown.
 * - **Inline** (token mid-prompt): a plain user bubble with the token drawn
 *   as the same soft-pill chip the composer showed.
 *
 * In both, the chip is an OSC 8 link to the SKILL.md. Expanding (tool-output
 * toggle) appends the rendered skill prompt.
 */
export declare class SkillMessageComponent extends Container {
    #private;
    constructor(message: CustomMessage<SkillPromptDetails>, imageLinks?: readonly (string | undefined)[]);
    setExpanded(expanded: boolean): void;
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * A user-toned card (role `omp.skill`): the skill chip (linked to its
     * SKILL.md) and prompt size in the head, the user's draft as markdown, and
     * the loaded skill prompt, described only while expanded because it can
     * be large.
     */
    describe(): NativeNode;
    /**
     * Transcript finalization contract (see `FinalizableBlock`): an optimistic
     * `/skill:` row reports `false` so the container keeps it live and removable
     * until reconcile; every other skill card is finalized on creation.
     */
    isTranscriptBlockFinalized(): boolean;
    /** Hold this card live as an unreconciled optimistic `/skill:` row (#11217). */
    markTranscriptBlockPending(): void;
    /** Finalize an optimistic row adopted in place after it already retired to
     *  scrollback before its canonical `message_start` arrived (#11217). */
    markTranscriptBlockFinalized(): void;
    invalidate(): void;
    dispose(): void;
}
