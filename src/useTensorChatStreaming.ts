import { TensorchatStreaming } from './TensorchatStreaming';
import { StreamRequest, StreamCallbacks, TensorchatConfig } from './types';

/**
 * Framework-agnostic Tensorchat streaming client manager
 * This replaces the React hook with a generic class-based approach
 */
export class TensorchatStreamingManager {
  private client: TensorchatStreaming | null = null;
  private config: TensorchatConfig;

  constructor(config: TensorchatConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (this.client) {
      this.client.destroy();
    }
    this.client = new TensorchatStreaming(this.config);
  }

  /**
   * Update configuration and reinitialize client
   */
  updateConfig(newConfig: Partial<TensorchatConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initialize();
  }

  /**
   * Stream process tensors with real-time callbacks
   */
  async streamProcess(request: StreamRequest, callbacks: StreamCallbacks = {}): Promise<void> {
    if (!this.client) {
      throw new Error('Tensorchat client not initialized');
    }
    return this.client.streamProcess(request, callbacks);
  }

  /**
   * Process a single tensor (non-streaming)
   */
  // async processSingle(request: StreamRequest): Promise<any> {
  //   if (!this.client) {
  //     throw new Error('Tensorchat client not initialized');
  //   }
  //   return this.client.processSingle(request);
  // }

  /**
   * Get the underlying client instance
   */
  getClient(): TensorchatStreaming | null {
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
 * Factory function for creating a Tensorchat streaming manager
 * @param config - Configuration for the Tensorchat client
 * @returns A new TensorchatStreamingManager instance
 */
export function createTensorchatStreaming(config: TensorchatConfig): TensorchatStreamingManager {
  return new TensorchatStreamingManager(config);
}
