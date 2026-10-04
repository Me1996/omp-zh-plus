import { type UsageLimit, type UsageReport } from "@oh-my-pi/pi-ai";
import { type Component } from "../index.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
/** Local calendar-day activity consumed by the usage heatmap. */
export interface DailyActivityPoint {
    day: string;
    cost: number;
    requests: number;
}
/** One quota bucket on a provider card: the account-aggregate of one window group. */
export interface CardWindowRow {
    /** Display label (limit label with tier folded in). */
    label: string;
    /** Window label/id shown dim after the label when sibling rows share a label. */
    windowTag?: string;
    /** Mean used fraction across accounts (0..1, >1 = overage); undefined when unreported. */
    fraction: number | undefined;
    status: UsageLimit["status"];
    /** Reset countdown of the worst account, ms from now, when in the future. */
    resetMs?: number;
    /** Absolute one-sided amount (e.g. `$12.34 used`, `100 credits left`) for limits without a fraction. */
    usedText?: string;
}
/** A connected account whose usage lookup produced no attributable report. */
export interface UnavailableUsageAccount {
    provider: string;
    label: string;
}
/** Compact per-provider summary backing one card in the subscriptions grid. */
export interface ProviderCard {
    provider: string;
    name: string;
    /** Number of represented accounts, including unavailable usage lookups. */
    accounts: number;
    unavailableAccounts: string[];
    /** Window rows sorted most-pressing first. */
    windows: CardWindowRow[];
    /** True when every account reports no limits (e.g. enterprise plans). */
    unlimited: boolean;
    /** True when nothing is used anywhere (or there are no limits): collapses to a tick. */
    idle: boolean;
    resetCredits?: {
        bankedCount: number;
        redeemableCount: number;
        soonestExpiryMs?: number;
        unavailableReasons: string[];
    };
    /** Labels of accounts with verified Daybreak access. */
    daybreakAccounts?: string[];
}
/**
 * Collapse usage reports into one compact card per provider: limits grouped by
 * quota bucket (label + window), each bucket showing the mean used fraction
 * across accounts (matching the classic report's aggregate "% free") with the
 * most-used account's reset countdown. Cards sort most-pressing first so
 * what's burning is on top-left; fully idle providers collapse into a tick.
 */
export declare function buildProviderCards(reports: UsageReport[], nowMs: number, unavailableAccounts?: readonly UnavailableUsageAccount[]): ProviderCard[];
/** GitHub-style week-per-column heatmap grid derived from daily activity. */
export interface HeatmapLayout {
    /** Per week column: short month name when the column starts a new month. */
    monthLabels: (string | undefined)[];
    /** 7 rows (Mon..Sun) × N week columns; 0..4 intensity, null = future day. */
    cells: (number | null)[][];
    totalCost: number;
    totalRequests: number;
    /** Local midnight of the first cell (column 0, Monday). */
    start: Date;
}
export declare const HEATMAP_DAY_LABELS: string[];
/**
 * Lay out daily activity into a Monday-first week grid ending at `today`'s
 * week. Intensity levels are magnitude-scaled against the busiest day
 * (square-root compressed so mid-size days stay distinguishable from
 * outliers), over per-day cost — falling back to request counts when nothing
 * in range has priced usage. Unlike GitHub's rank quartiles, intensity tracks
 * *how much* work a day carried.
 */
export declare function buildHeatmapLayout(points: DailyActivityPoint[], weeks: number, today?: Date): HeatmapLayout;
/** Callbacks and data sources for {@link UsageDashboardComponent}. */
export interface UsageDashboardOptions {
    reports: UsageReport[];
    unavailableAccounts?: readonly UnavailableUsageAccount[];
    /**
     * Full classic `/usage` report of `reports` (the latest refresh) for the
     * expanded detail view; re-invoked per terminal width.
     */
    renderDetail: (width: number, reports: UsageReport[]) => string;
    /**
     * Stream daily activity into the heatmap: push cached DB rows immediately,
     * then push again after an incremental session sync. Resolves when the sync
     * settles; rejection renders as a dim unavailable note. `signal` aborts when
     * the dashboard closes so an in-flight sync can stop early.
     */
    loadActivity: (push: (points: DailyActivityPoint[]) => void, signal: AbortSignal) => Promise<void>;
    /** Re-fetch the usage reports (`r`); omitted when the host can't. Resolves null when nothing came back. */
    refresh?: () => Promise<UsageReport[] | null>;
    requestRender: () => void;
    onClose: () => void;
}
/**
 * Sanitize activity loading error text for safe single-line display in the TUI overlay.
 * Strips ANSI/control sequences, expands tabs, collapses whitespace runs/newlines,
 * shortens home directory paths to ~, and removes trailing dots.
 */
export declare function formatActivityErrorDetail(error: string, homeDir?: string): string;
export declare class UsageDashboardComponent implements Component {
    #private;
    /** The terminal draws the sheet: a large glass overlay titled Usage. */
    readonly nativeOverlay: {
        readonly role: "omp.overlay.usage";
        readonly size: "lg";
        readonly anchor: "center";
        readonly head: "Usage";
    };
    constructor(options: UsageDashboardOptions);
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
    /**
     * The sheet body (the terminal's `lg` overlay is the frame): a head row
     * (checked ago, Overview/Details tabs, Refresh), then either the provider
     * grid of frames with window meters and the activity heatmap, or the
     * per-provider detail tables. `meter`/`chart` fall back to
     * `progress`/`table` on terminals without them. Rebuilt only when its
     * inputs change.
     */
    describe(cx: DescribeContext): NativeNode;
    /** Tab clicks switch views like Enter/Esc; the Refresh button runs `r`. */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(data: string): void;
}
