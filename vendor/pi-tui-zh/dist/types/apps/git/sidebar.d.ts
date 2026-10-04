/**
 * Right sidebar of the git TUI.
 *
 * Dirty tree → file management: unstaged/staged sections with stage/unstage
 * actions plus a commit form (amend toggle, summary input, description
 * editor, commit button). Clean tree → HEAD commit view: subject, body,
 * author with avatar photo, parents, and the commit's file list.
 *
 * The sidebar is not a TUI component itself: the root composes its rendered
 * lines and forwards key/mouse input. Every rendered frame records a hit
 * target per row so mouse clicks resolve against what is actually visible.
 */
import { Editor } from "../../components/editor.js";
import { TextFormField } from "../../components/form.js";
import { type ImageBudget } from "../../components/image.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../../native/node.js";
import { type AvatarSource } from "./avatar.js";
import type { ChangedFile, GitViewState } from "./state.js";
/** Generated conventional commit fields shown in the commit form. */
export interface GitCommitMessage {
    type: string;
    scope?: string | null;
    summary: string;
    body: readonly string[];
}
/** Actions the sidebar raises to the root component. */
export type SidebarAction = 
/** `selection` omitted → whole tree; `label` names the target for the status line. */
{
    type: "stage";
    selection?: {
        files: ChangedFile[];
        label: string;
    };
} | {
    type: "unstage";
    selection?: {
        files: ChangedFile[];
        label: string;
    };
}
/** `delete`: throw away the row's changes (a dir batches every file underneath). */
 | {
    type: "discard";
    selection: {
        files: ChangedFile[];
        label: string;
    };
} | {
    type: "generate";
}
/** Wand pill: AI-filter the unstaged tree against a natural-language prompt. */
 | {
    type: "stage-ai";
    prompt: string;
} | {
    type: "commit";
    message: string;
    amend: boolean;
    stageAll: boolean;
};
type FileTarget = {
    kind: "file";
    file: ChangedFile;
} | {
    kind: "dir";
    key: string;
};
/** A foldable file-list section header (unstaged/staged). */
type SectionTarget = {
    kind: "section";
    area: "unstaged" | "staged";
};
type Target = FileTarget | {
    kind: "view-style";
    style: "path" | "tree";
} | SectionTarget | {
    kind: "stage-all";
} | {
    kind: "unstage-all";
} | {
    kind: "stage-ai";
} | {
    kind: "stage-ai-input";
} | {
    kind: "amend";
} | {
    kind: "summary";
} | {
    kind: "description";
} | {
    kind: "commit-button";
};
/** Sidebar state machine + renderer. */
export declare class Sidebar {
    #private;
    readonly summary: TextFormField;
    readonly description: Editor;
    /** "What should we stage?" textbox opened by the unstaged-header wand pill. */
    readonly aiInput: TextFormField;
    focused: boolean;
    amend: boolean;
    generating: boolean;
    /** File-list presentation: flat paths or a collapsible directory tree. */
    viewStyle: "path" | "tree";
    constructor(options: {
        model: GitViewState;
        avatars: AvatarSource;
        imageBudget?: ImageBudget;
        onSelectFile: (file: ChangedFile | null) => void;
        onAction: (action: SidebarAction) => void;
        onFocusDiff: () => void;
        requestRender: () => void;
    });
    /** Currently selected target, if any. */
    get selected(): Target | undefined;
    get selectedFile(): ChangedFile | null;
    /** Re-sync selection after a model refresh; returns the file to show. */
    reconcile(): ChangedFile | null;
    /** Called by the root when pane focus changes. */
    setFocused(focused: boolean): void;
    /** Clear the commit form after a successful commit. */
    clearForm(): void;
    /** Replace the form with one generated conventional commit. */
    setGeneratedCommit(commit: GitCommitMessage): void;
    /** Reflect whether an inference request currently owns the commit form. */
    setGenerating(generating: boolean): void;
    /** Escape while the sidebar has focus: blur a text input first. True when consumed. */
    handleEscape(): boolean;
    /** True while a commit-form text input is capturing letter keys. */
    get editing(): boolean;
    /**
     * Move selection to the next/previous visible file row. False at the
     * boundary. `from` anchors the walk at the file currently shown in the
     * diff pane, so hunk rollover works even when the sidebar selection sits
     * on a dir row or a commit-form control.
     */
    selectAdjacentFile(direction: 1 | -1, from?: ChangedFile | null): boolean;
    /** Select the commit summary input (the `c` shortcut). False on a clean tree. */
    focusCommitForm(): boolean;
    handleInput(data: string): void;
    /**
     * The changes sheet (NATIVE_REDESIGN §10): a head with the change count,
     * the branch and a Path/Tree segmented control; one list per section under
     * a quiet head whose `Stage all`/`Unstage all` show on hover; the commit
     * composer docked below. A clean tree shows the HEAD commit instead. Text
     * fields are live `input`/`editor` nodes only while they own the keys, so
     * the terminal's caret follows the keyboard.
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Pointer actions on the changes sheet: list clicks select (a folder also
     * folds, a second click on the selected file stages it, as the ANSI click
     * does), double clicks activate, the segmented control switches Path/Tree,
     * and the quiet buttons run their row's action; selection edits go to the
     * text field being edited. False when not the sidebar's event.
     */
    handleNativeEvent(event: NativeUiEvent): boolean;
    /** Wheel scroll over the sidebar. */
    handleWheel(delta: number): void;
    /** Left click at sidebar-local coordinates. */
    handleClick(row: number, col: number): void;
    render(width: number, height: number): string[];
    /** Permanently release viewport, form, and avatar resources. */
    dispose(): void;
}
export {};
