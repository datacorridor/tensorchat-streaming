import { StreamRequest, StreamCallbacks, TensorChatConfig } from './types';
export declare class TensorChatStreaming {
    private apiKey;
    private baseUrl;
    private throttleMs;
    private throttleTimers;
    constructor(config: TensorChatConfig);
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
