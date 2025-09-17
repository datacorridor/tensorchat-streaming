import { TensorChatStreaming } from './TensorChatStreaming';
import { StreamRequest, StreamCallbacks, TensorChatConfig } from './types';

/**
 * Framework-agnostic TensorChat streaming client manager
 * This replaces the React hook with a generic class-based approach
 */
export class TensorChatStreamingManager {
  private client: TensorChatStreaming | null = null;
  private config: TensorChatConfig;

  constructor(config: TensorChatConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (this.client) {
      this.client.destroy();
    }
    this.client = new TensorChatStreaming(this.config);
  }

  /**
   * Update configuration and reinitialize client
   */
  updateConfig(newConfig: Partial<TensorChatConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initialize();
  }

  /**
   * Stream process tensors with real-time callbacks
   */
  async streamProcess(request: StreamRequest, callbacks: StreamCallbacks = {}): Promise<void> {
    if (!this.client) {
      throw new Error('TensorChat client not initialized');
    }
    return this.client.streamProcess(request, callbacks);
  }

  /**
   * Process a single tensor (non-streaming)
   */
  async processSingle(request: StreamRequest): Promise<any> {
    if (!this.client) {
      throw new Error('TensorChat client not initialized');
    }
    return this.client.processSingle(request);
  }

  /**
   * Get the underlying client instance
   */
  getClient(): TensorChatStreaming | null {
    return this.client;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
  }
}

/**
 * Factory function for creating a TensorChat streaming manager
 * @param config - Configuration for the TensorChat client
 * @returns A new TensorChatStreamingManager instance
 */
export function createTensorChatStreaming(config: TensorChatConfig): TensorChatStreamingManager {
  return new TensorChatStreamingManager(config);
}
