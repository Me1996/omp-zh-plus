import type { MouseRoutable, SgrMouseEvent } from "../mouse.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import { type SelectPickerOptions } from "../native/picker.js";
import { type Component, type Focusable } from "../tui.js";
import { Input } from "./input.js";
import { type SelectItem, SelectList, type SelectListTheme } from "./select-list.js";
/** Styling hooks used by the reusable form-field layout. */
export interface FormFieldTheme {
    label(text: string): string;
    description(text: string): string;
    error(text: string): string;
    hint(text: string): string;
}
/** Interactive control accepted by {@link FormField}. */
export type FormControl = Component & Partial<Focusable> & {
    handleInput(data: string): void;
    pasteText?(text: string): void;
};
/** Declarative label, help, preview, and footer content surrounding a control. */
export interface FormFieldOptions {
    theme: FormFieldTheme;
    label?: string;
    description?: string;
    details?: readonly Component[];
    previewLabel?: string;
    preview?: Component;
    hint?: string;
    /** Read-only rows rendered after the control and before the interaction hint. */
    summary?: readonly Component[];
    footer?: Component;
    /** Insert a blank row before the field's label/description/detail content. */
    leadingSpace?: boolean;
    spaceBeforeControl?: boolean;
    spaceAfterControl?: boolean;
}
/**
 * Layout and focus adapter for one form control. The control remains a normal
 * component; this class only owns shared form chrome and local mouse routing.
 */
export declare class FormField implements Component, Focusable, MouseRoutable {
    #private;
    readonly control: FormControl;
    constructor(control: FormControl, options: FormFieldOptions);
    /** Label, description, details, preview, the control, error, summary, hint and footer as one column. */
    describe(_cx: DescribeContext): NativeNode;
    get focused(): boolean;
    get debugChildren(): readonly Component[];
    set focused(value: boolean);
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    /** Show a bounded, single-line validation or submission error. */
    setError(message: string | undefined): void;
    handleInput(data: string): void;
    pasteText(text: string): void;
    /** Translate a field-local row to its control-local row, excluding all surrounding chrome. */
    controlLineAt(line: number): number | undefined;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    render(width: number): readonly string[];
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
}
/** Behavior used when a single-line field is submitted with an empty value. */
export type EmptyInputBehavior = "submit" | "cancel" | "reject";
/** Options for a validated, cancellable single-line field. */
export interface TextFormFieldOptions extends Omit<FormFieldOptions, "preview"> {
    initialValue?: string;
    secret?: boolean;
    prompt?: string;
    empty?: EmptyInputBehavior;
    emptyError?: string;
    validate?: (value: string) => string | undefined;
    onSubmit(value: string): void | Promise<void>;
    onCancel(): void;
    /** Schedule a frame after an asynchronous submit settles. */
    requestRender?: () => void;
}
/**
 * Single-line form field backed by {@link Input}. Validation and thrown submit
 * errors stay visible on the field; empty-value policy is explicit per caller.
 */
export declare class TextFormField extends FormField {
    #private;
    readonly input: Input;
    constructor(options: TextFormFieldOptions);
    getValue(): string;
    setValue(value: string): void;
    /** Validate and submit the current value according to the configured empty policy. */
    submit(): void;
}
/** Options for a SelectList-backed form field with optional live preview. */
export interface SelectFormFieldOptions extends Omit<FormFieldOptions, "preview"> {
    items: ReadonlyArray<SelectItem>;
    currentValue?: string;
    maxVisible?: number;
    selectTheme: SelectListTheme;
    getPreview?: () => string;
    onSelectionChange?: (value: string) => void | Promise<void>;
    onSubmit(value: string): void | Promise<void>;
    onCancel(): void;
    /** Schedule a frame after an asynchronous preview update settles. */
    requestRender?: () => void;
    /** The picker sheet a long choice (> {@link PICKER_MIN_ITEMS} items) describes as; defaults to the label. */
    picker?: SelectPickerOptions;
}
/** SelectList field that centralizes selection, cancellation, preview refresh, and mouse routing. */
export declare class SelectFormField extends FormField {
    #private;
    readonly selectList: SelectList;
    /** Number of choices (before filtering). */
    readonly itemCount: number;
    constructor(options: SelectFormFieldOptions);
    invalidate(): void;
    /** Long choices describe as a picker sheet where supported; the host places it (layer or prefs editor). */
    describe(cx: DescribeContext): NativeNode;
    /** Picker pointer events drive the list as its keys do (preview, pick, cancel). */
    handleNativeEvent(event: NativeUiEvent): void;
}
/** Options for focus and input dispatch across several composable fields. */
export interface FormOptions {
    fields: readonly FormField[];
    onCancel(): void;
    isCancel?: (data: string) => boolean;
}
/**
 * Small form controller for multi-field surfaces. It owns focus traversal,
 * field-local mouse routing, and cancellation while fields retain submit policy.
 */
export declare class Form implements Component, Focusable, MouseRoutable {
    #private;
    constructor(options: FormOptions);
    /** The fields as one column; focus traversal stays keyboard-driven. */
    describe(_cx: DescribeContext): NativeNode;
    get focused(): boolean;
    get debugChildren(): readonly Component[];
    set focused(value: boolean);
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    handleInput(data: string): void;
    pasteText(text: string): void;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
    render(width: number): readonly string[];
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
}
