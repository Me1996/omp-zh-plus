import type { ActiveRepoContext } from "@oh-my-pi/pi-tui-zh/status-line/host";
export declare function resolveActiveRepoContext(cwd: string): Promise<ActiveRepoContext | null>;
export declare function resolveActiveRepoContextSync(cwd: string): ActiveRepoContext | null;
