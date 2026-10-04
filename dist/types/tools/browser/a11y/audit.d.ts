import type { Page } from "puppeteer-core";
/** Options accepted by the browser accessibility audit helper. */
export interface BrowserA11yOptions {
    /** Restrict the audit to rules carrying at least one of these axe tags. */
    tags?: string[];
    /** Restrict the audit to these axe rule ids. */
    rules?: string[];
    /** Audit only the subtree matching this CSS selector. */
    selector?: string;
    /** Include results that require manual review in the returned report. */
    includeIncomplete?: boolean;
}
/** One failing DOM node reported by axe-core. */
export interface BrowserA11yNode {
    /** Selector path; nested arrays preserve shadow-root boundaries. */
    target: string[] | string[][];
    /** Truncated outer HTML for the failing node. */
    html: string;
    /** Axe's explanation of why the node failed. */
    failureSummary: string;
}
/** One axe-core rule result. */
export interface BrowserA11yViolation {
    /** Axe rule id. */
    id: string;
    /** Axe impact level, or null when the rule has none. */
    impact: string | null;
    /** Human-readable remediation summary. */
    help: string;
    /** Axe rule documentation URL. */
    helpUrl: string;
    /** Standards and rule-family tags. */
    tags: string[];
    /** Total number of failing nodes before the displayed-node limit. */
    nodeCount: number;
    /** At most ten representative failing nodes. */
    nodes: BrowserA11yNode[];
}
/** Structured result returned by a browser accessibility audit. */
export interface BrowserA11yResult {
    /** Audited page URL. */
    url: string;
    /** Accessibility engine identity. */
    engine: {
        name: "axe-core";
        version: string;
    };
    /** Counts of rule-level results. */
    counts: {
        violations: number;
        incomplete: number;
        passes: number;
    };
    /** Rules with confirmed accessibility violations. */
    violations: BrowserA11yViolation[];
    /** Rules needing manual review when requested. */
    incomplete: BrowserA11yViolation[];
}
/** Normalize an axe-core response into the stable browser audit result shape. */
export declare function normalizeA11yResult(url: string, raw: unknown, includeIncomplete: boolean): BrowserA11yResult;
/** Run axe-core through Puppeteer's isolated-world evaluator for every frame and merge the partial reports. */
export declare function runA11yAudit(page: Page, options?: BrowserA11yOptions): Promise<BrowserA11yResult>;
/** Build a standalone page-world axe audit script for the cmux backend. */
export declare function buildA11yPageScript(options?: BrowserA11yOptions): string;
/** Format an axe report as a concise, agent-readable text summary. */
export declare function formatA11ySummary(result: BrowserA11yResult): string;
