import { StreamRequest, StreamCallbacks, TensorchatConfig } from './types';
export declare class TensorchatStreaming {
    private apiKey;
    private baseUrl;
    private throttleMs;
    private throttleTimers;
    constructor(config: TensorchatConfig);
    /**
     * Throttle function calls to prevent UI flooding
     */
    private throttle;
    /**
     * Stream process tensors with real-time callbacks
     */
    streamProcess(request: StreamRequest, callbacks?: StreamCallbacks): Promise<void>;
    /**
     * Process a single tensor (non-streaming)
     */
    processSingle(request: StreamRequest): Promise<any>;
    /**
     * Clean up any pending throttled calls
     */
    destroy(): void;
}
