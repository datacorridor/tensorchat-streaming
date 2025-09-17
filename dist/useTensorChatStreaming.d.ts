import { TensorchatStreaming } from './TensorchatStreaming';
import { StreamRequest, StreamCallbacks, TensorchatConfig } from './types';
/**
 * Framework-agnostic Tensorchat streaming client manager
 * This replaces the React hook with a generic class-based approach
 */
export declare class TensorchatStreamingManager {
    private client;
    private config;
    constructor(config: TensorchatConfig);
    private initialize;
    /**
     * Update configuration and reinitialize client
     */
    updateConfig(newConfig: Partial<TensorchatConfig>): void;
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
    getClient(): TensorchatStreaming | null;
    /**
     * Clean up resources
     */
    destroy(): void;
}
/**
 * Factory function for creating a Tensorchat streaming manager
 * @param config - Configuration for the Tensorchat client
 * @returns A new TensorchatStreamingManager instance
 */
export declare function createTensorchatStreaming(config: TensorchatConfig): TensorchatStreamingManager;
