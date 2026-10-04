import type { Component } from "../index.js";
import type { Theme } from "../theme/theme.js";
import type { NativeToolView } from "./renderer.js";
/** Call preview for an `xd://report_issue` write. */
export declare function renderReportIssueDeviceCall(content: unknown, uiTheme: Theme): Component;
/** Native call preview for an `xd://report_issue` write. */
export declare function describeReportIssueDeviceCall(content: unknown): NativeToolView;
/** Device name for automatic tool issue reports. */
export declare const REPORT_ISSUE_DEVICE_NAME = "report_issue";
/** Internal device URL for automatic tool issue reports. */
export declare const REPORT_ISSUE_DEVICE_PATH = "xd://report_issue";
