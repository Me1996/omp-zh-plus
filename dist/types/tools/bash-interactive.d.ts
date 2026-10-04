import type { AgentToolContext } from "@oh-my-pi/pi-agent-core";
import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type OutputSummary } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
export interface BashInteractiveResult extends OutputSummary {
    exitCode: number | undefined;
    cancelled: boolean;
    timedOut: boolean;
    /** Terminal graphics extracted from raw PTY output before transcript sanitization. */
    images?: ImageContent[];
}
export declare function runInteractiveBashPty(ui: Pick<NonNullable<AgentToolContext["ui"]>, "custom">, options: {
    command: string;
    cwd: string;
    timeoutMs?: number;
    signal?: AbortSignal;
    env?: Record<string, string>;
    artifactPath?: string;
    artifactId?: string;
}): Promise<BashInteractiveResult>;
