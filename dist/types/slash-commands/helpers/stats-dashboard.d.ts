import * as stats from "@oh-my-pi/omp-stats";
export declare const DEFAULT_STATS_DASHBOARD_PORT = 3847;
export interface StatsDashboardArgs {
    port: number;
    host: string;
}
export interface StatsDashboardLaunchResult {
    url: string;
    message: string;
}
export declare function parseStatsDashboardArgs(args: string): StatsDashboardArgs | {
    error: string;
};
/**
 * Start (or reuse) the dashboard and open it, without waiting for ingest: the
 * server syncs sessions in the background and streams progress to the page.
 * `judge` powers the Frustration page's judge runs; a later launch replaces
 * the registered one, so the dashboard always judges through the most recent
 * session.
 */
export declare function launchStatsDashboard(args: StatsDashboardArgs, judge?: stats.StatsJudgeProvider): Promise<StatsDashboardLaunchResult>;
export declare function stopStatsDashboard(): void;
