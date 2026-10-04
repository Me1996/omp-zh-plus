import type { Component } from "../index.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import type { Theme } from "../theme/theme.js";
import { Ellipsis } from "../render/index.js";
/** Device name for applying a staged action. */
export declare const RESOLVE_DEVICE_NAME = "resolve";
/** Device name for discarding a staged action. */
export declare const REJECT_DEVICE_NAME = "reject";
/** Device name for submitting a plan. */
export declare const PROPOSE_DEVICE_NAME = "propose";
/** Plain-text staged-action device names. */
export type ResolutionDeviceName = typeof RESOLVE_DEVICE_NAME | typeof REJECT_DEVICE_NAME | typeof PROPOSE_DEVICE_NAME;
/** Resolution applied to a staged action. */
export type ResolveAction = "apply" | "discard";
/** Details payload carried on a resolve/reject dispatch result (`XdevDispatch.inner`). */
export interface ResolveDetails {
    action: ResolveAction;
    reason: string;
    sourceToolName?: string;
    label?: string;
    sourceResultDetails?: unknown;
}
/** Invoker input for queued pending-preview handlers. */
export interface ResolveInvocation {
    action: ResolveAction;
    reason: string;
}
/** Streaming-safe call preview for a resolution-device write: `Resolve/Reject/Propose: <text>`. */
export declare function renderResolutionDeviceCall(device: ResolutionDeviceName, content: unknown, uiTheme: Theme): Component;
/** Native form of {@link renderResolutionDeviceCall}: `Resolve/Reject/Propose` head with the first content line. */
export declare function describeResolutionDeviceCall(device: ResolutionDeviceName, content: unknown): NativeToolView;
/** Native form of {@link renderDeviceCallPreview}: title head plus the first content line of a pending device write. */
export declare function describeDeviceCallPreview(title: string, content: unknown): NativeToolView;
/** Render the first content line of a pending device write. */
export declare function renderDeviceCallPreview(title: string, content: unknown, uiTheme: Theme, ellipsis?: Ellipsis): Component;
/** Render staged-action acceptance or rejection. */
export declare const resolveRenderer: {
    renderCall(args: Partial<ResolveInvocation>, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: ResolveDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, uiTheme: Theme): Component;
    describeCall(args: Partial<ResolveInvocation>): NativeToolView;
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: ResolveDetails;
        isError?: boolean;
    }): NativeToolView | undefined;
    inline: true;
    mergeCallAndResult: true;
};
/** Whether an xd:// device name is one of the plain-text resolution devices. */
export declare function isResolutionDeviceName(name: string): name is ResolutionDeviceName;
