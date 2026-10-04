/**
 * Editor-anchored, right-aligned progress rows above the working line: judge
 * batches (`judge_batch`) and automatic downloads/installs (model weights,
 * tool binaries, browsers, side runtimes). Both render through
 * {@link renderHudProgressRow} so they read as one HUD.
 */
import { type Component } from "@oh-my-pi/pi-tui-zh";
import type { NativeNode } from "@oh-my-pi/pi-tui-zh/native/node";
import type { DownloadActivity } from "../downloads/activity.js";
import type { JudgmentBatchProgress } from "../eval/judgment-batch-events.js";
/** Progress rows for concurrent judge batches. */
export declare class JudgmentBatchProgressHud implements Component {
    #private;
    update(progress: JudgmentBatchProgress): void;
    delete(id: string): void;
    clear(): void;
    describe(): NativeNode;
    render(width: number): readonly string[];
}
/**
 * Progress rows for automatic downloads and installs (see `downloads/activity`):
 * a byte bar when the size is known, the current step otherwise, then a brief
 * `ready` or a lingering failure reason. Owns its reveal/retain timers.
 */
export declare class DownloadActivityHud implements Component {
    #private;
    constructor(requestRender: () => void);
    update(activity: DownloadActivity): void;
    dispose(): void;
    describe(): NativeNode;
    render(width: number): readonly string[];
}
