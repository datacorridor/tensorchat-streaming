import { StreamRequest, StreamEventData, StreamCallbacks, TensorchatConfig } from './types';

export class TensorchatStreaming {
  private apiKey: string;
  private baseUrl: string;
  private throttleMs: number;
  private throttleTimers: Map<string, number> = new Map();
  private completedTensors: Set<number> = new Set();

  constructor(config: TensorchatConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.tensorchat.ai';
    this.throttleMs = config.throttleMs || 50; // Default 50ms throttle
  }

  /**
   * Throttle function calls to prevent UI flooding
   */
  private throttle<T extends any[]>(key: string, fn: (...args: T) => void, ...args: T): void {
    if (this.throttleTimers.has(key)) {
      clearTimeout(this.throttleTimers.get(key)!);
    }

    const timeoutId = window.setTimeout(() => {
      // Double-check that the tensor hasn't completed before calling the function
      const tensorIndex = key.startsWith('chunk-') ? parseInt(key.split('-')[1]) : -1;
      if (tensorIndex === -1 || !this.completedTensors.has(tensorIndex)) {
        fn(...args);
      }
      this.throttleTimers.delete(key);
    }, this.throttleMs);

    this.throttleTimers.set(key, timeoutId);
  }

  /**
   * Clear all pending throttled calls for a specific tensor
   */
  private clearTensorThrottles(tensorIndex: number): void {
    const chunkKey = `chunk-${tensorIndex}`;
    if (this.throttleTimers.has(chunkKey)) {
      clearTimeout(this.throttleTimers.get(chunkKey)!);
      this.throttleTimers.delete(chunkKey);
    }
  }

  /**
   * Process a tensor chunk immediately without throttling (for final chunks)
   */
  private processChunkImmediate(data: StreamEventData, onTensorChunk?: (data: StreamEventData) => void): void {
    if (onTensorChunk && data.index !== undefined && !this.completedTensors.has(data.index)) {
      onTensorChunk(data);
    }
  }

  /**
   * Stream process tensors with real-time callbacks
   */
  async streamProcess(
    request: StreamRequest,
    callbacks: StreamCallbacks = {}
  ): Promise<void> {
    const {
      onStart,
      onProgress,
      onSearchProgress,
      onSearchComplete,
      onTensorChunk,
      onTensorComplete,
      onTensorError,
      onComplete,
      onError
    } = callbacks;

    try {
      const response = await fetch(`${this.baseUrl}/streamProcess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      
      // Reset state for new stream
      this.completedTensors.clear();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          while (buffer.includes('\n\n')) {
            const lineEnd = buffer.indexOf('\n\n');
            const line = buffer.slice(0, lineEnd);
            buffer = buffer.slice(lineEnd + 2);

            if (line.startsWith('data: ')) {
              try {
                const data: StreamEventData = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'start':
                    console.log(`🚀 Starting ${data.totalTensors} tensors with ${data.model}`);
                    onStart?.(data);
                    break;

                  case 'progress':
                    console.log(`⏳ Processing tensor ${data.index}...`);
                    onProgress?.(data);
                    break;

                  case 'search_progress':
                    console.log(`🔍 Searching for tensor ${data.index}...`);
                    onSearchProgress?.(data);
                    break;

                  case 'search_complete':
                    console.log(`✅ Search completed for tensor ${data.index}`);
                    onSearchComplete?.(data);
                    break;

                  case 'tensor_chunk':
                    console.log(`📝 Tensor ${data.index} chunk received`);
                    // Only process chunks for tensors that haven't completed
                    if (onTensorChunk && data.index !== undefined && !this.completedTensors.has(data.index)) {
                      this.throttle(`chunk-${data.index}`, onTensorChunk, data);
                    }
                    break;

                  case 'tensor_complete':
                    console.log(`✅ Tensor ${data.index} completed`);
                    if (data.index !== undefined) {
                      // Clear any pending throttled chunks for this tensor
                      this.clearTensorThrottles(data.index);
                      // Process any final chunk immediately if present
                      if (data.chunk && onTensorChunk && !this.completedTensors.has(data.index)) {
                        this.processChunkImmediate(data, onTensorChunk);
                      }
                      // Mark tensor as completed
                      this.completedTensors.add(data.index);
                    }
                    onTensorComplete?.(data);
                    break;

                  case 'tensor_error':
                    console.warn(`❌ Tensor ${data.index} failed: ${data.result?.error}`);
                    onTensorError?.(data);
                    break;

                  case 'complete':
                    console.log(`🎉 All tensors completed!`);
                    // Clear all remaining throttled calls
                    this.throttleTimers.forEach(timerId => clearTimeout(timerId));
                    this.throttleTimers.clear();
                    onComplete?.(data);
                    return;

                  case 'error':
                  case 'fatal_error':
                    throw new Error(data.error || data.details || 'Streaming error');
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', line, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Process a single tensor (non-streaming)
   */
  async processSingle(request: StreamRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Clean up any pending throttled calls
   */
  destroy(): void {
    this.throttleTimers.forEach(timerId => clearTimeout(timerId));
    this.throttleTimers.clear();
    this.completedTensors.clear();
  }
}