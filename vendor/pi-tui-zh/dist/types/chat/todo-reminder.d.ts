import { Container } from "../tui.js";
import { type TodoItem } from "../tools/todo.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
/**
 * Component that renders a todo completion reminder notification, committed into
 * the transcript like a TTSR notification so it stays anchored in history rather
 * than floating above the editor.
 * Shows when the agent stops with incomplete todos.
 */
export declare class TodoReminderComponent extends Container {
    #private;
    constructor(todos: TodoItem[], attempt: number, maxAttempts: number);
    setToolActivityVisible(visible: boolean): void;
    /** A `checklist` reminder of the open items where the terminal lists the kind (§7.5); else the notice card. */
    describe(cx?: DescribeContext): NativeNode;
}
