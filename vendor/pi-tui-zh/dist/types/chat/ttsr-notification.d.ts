import { Container } from "../tui.js";
/** Rule fields shown in rewind notifications. */
export interface NotificationRule {
    name: string;
    description?: string;
    content?: string;
}
/**
 * Component that renders a TTSR (Time Traveling Stream Rules) notification.
 * Shows when a rule violation is detected and the stream is being rewound.
 * One block can carry several rules: a single event may match multiple rules,
 * and consecutive notifications merge into the previous block via
 * {@link addRules} while it is still the live transcript tail.
 */
export declare class TtsrNotificationComponent extends Container {
    #private;
    constructor(rules: NotificationRule[]);
    setToolActivityVisible(visible: boolean): void;
    /** Merge additional rules into this block (deduped by rule name). */
    addRules(rules: NotificationRule[]): void;
    setExpanded(expanded: boolean): void;
    isExpanded(): boolean;
}
