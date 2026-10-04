export type ClassifiedInstallTarget = {
    type: "local";
    path: string;
} | {
    type: "marketplace";
    name: string;
    marketplace: string;
} | {
    type: "npm";
    spec: string;
};
export type MarketplaceInstallOptions = {
    dryRun: boolean;
    force?: boolean;
    scope?: "user" | "project";
};
export type MarketplaceInstallPreview = {
    dryRun: true;
    action: "install";
    plugin: string;
    marketplace: string;
};
export interface MarketplacePreviewReader {
    validateInstallPlugin(name: string, marketplace: string, options?: Omit<MarketplaceInstallOptions, "dryRun">): Promise<void>;
}
export declare function handleMarketplaceInstall(manager: MarketplacePreviewReader, target: Extract<ClassifiedInstallTarget, {
    type: "marketplace";
}>, options: MarketplaceInstallOptions, emitPreview: (preview: MarketplaceInstallPreview) => void): Promise<boolean>;
export declare function classifyInstallTarget(spec: string, knownMarketplaces: Set<string>): ClassifiedInstallTarget;
