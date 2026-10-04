/** Process-wide display preferences applied by the host settings hooks. */
export interface ChatTranscriptDisplayPreferences {
    hideToolActivity: boolean;
    readToolResultPreview: boolean;
    showImages: boolean;
    cacheMissMarker: boolean;
    showTokenUsage: boolean;
    showTurnTime: boolean;
}
/** Current transcript display preferences. */
export declare const chatTranscriptDisplayPreferences: ChatTranscriptDisplayPreferences;
/** Apply host display preferences without pulling settings into the renderer. */
export declare function setChatTranscriptDisplayPreferences(preferences: Partial<ChatTranscriptDisplayPreferences>): void;
