import type { Page } from "puppeteer-core";
/** Serializable description of an init script registered on one tab. */
export interface InitScriptInfo {
    id: string;
    source: string;
}
/** Registers, removes, and lists document-start scripts for one page. */
export declare class InitScriptManager {
    #private;
    constructor(page: Page);
    /** Register source for every future document and return its stable identifier. */
    add(source: string): Promise<{
        id: string;
    }>;
    /** Remove one previously registered script. */
    remove(id: string): Promise<void>;
    /** Return registered scripts in registration order. */
    list(): InitScriptInfo[];
}
