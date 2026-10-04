/** Whether a TSP surface is live in this process. */
export declare function isNativeRendering(): boolean;
/** Called by the native backend on surface open and close. */
export declare function setNativeRendering(on: boolean): void;
/** Call `listener` whenever native rendering starts or stops; returns the unsubscribe. */
export declare function onNativeRenderingChange(listener: (on: boolean) => void): () => void;
