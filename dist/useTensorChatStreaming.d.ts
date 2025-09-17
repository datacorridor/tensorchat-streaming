import { TensorChatStreaming } from './TensorChatStreaming';
import { StreamRequest, StreamCallbacks, TensorChatConfig } from './types';
/**
 * Framework-agnostic TensorChat streaming client manager
 * This replaces the React hook with a generic class-based approach
 */
export declare class TensorChatStreamingManager {
    private client;
    private config;
    constructor(config: TensorChatConfig);
    private initialize;
    /**
     * Update configuration and reinitialize client
     */
    updateConfig(newConfig: Partial<TensorChatConfig>): void;
    /**
     * Stream process tensors with real-time callbacks
     */
    streamProcess(request: StreamRequest, callbacks?: StreamCallbacks): Promise<void>;
    /**
     * Process a single tensor (non-streaming)
     */
    processSingle(request: StreamRequest): Promise<any>;
    /**
     * Get the underlying client instance
     */
    getClient(): TensorChatStreaming | null;
    /**
     * Clean up resources
     */
    destroy(): void;
}
/**
 * Factory function for creating a TensorChat streaming manager
 * @param config - Configuration for the TensorChat client
 * @returns A new TensorChatStreamingManager instance
 */
export declare function createTensorChatStreaming(config: TensorChatConfig): TensorChatStreamingManager;
