import { StreamRequest, StreamEventData, StreamCallbacks, TensorchatConfig } from './types';

export class TensorchatStreaming {
  private apiKey: string;
  private baseUrl: string;
  private verbose: boolean;
  private tensorBuffers: Map<number, string[]> = new Map();
  private completedTensors: Set<number> = new Set();

  constructor(config: TensorchatConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.tensorchat.ai';
    this.verbose = config.verbose ?? false; // Default to false
  }

  /**
   * Ultra-fast buffer processing with minimal allocations
   */
  private processBuffer(buffer: string): { lines: string[], remainingBuffer: string } {
    const lines: string[] = [];
    let startIndex = 0;
    
    // Use indexOf with start position to avoid repeated string scanning
    while (true) {
      const lineEnd = buffer.indexOf('\n\n', startIndex);
      if (lineEnd === -1) break;
      
      lines.push(buffer.slice(startIndex, lineEnd));
      startIndex = lineEnd + 2;
    }
    
    return {
      lines,
      remainingBuffer: buffer.slice(startIndex)
    };
  }

  /**
   * Ultra-fast stream processing - buffers data and provides real-time UI updates
   */
  async streamProcess(
    request: StreamRequest,
    callbacks: StreamCallbacks = {}
  ): Promise<void> {
    const { onSearchProgress, onSearchComplete, onTensorChunk, onTensorComplete, onComplete, onError } = callbacks;

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
      this.tensorBuffers.clear();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines using optimized buffer processing
          const { lines, remainingBuffer } = this.processBuffer(buffer);
          buffer = remainingBuffer;

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: StreamEventData = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'search_progress':
                    onSearchProgress?.(data);
                    if (this.verbose) {
                      console.log(`🔍 Search progress for tensor ${data.index}`);
                    }
                    break;

                  case 'search_complete':
                    onSearchComplete?.(data);
                    if (this.verbose) {
                      console.log(`✅ Search completed for tensor ${data.index}`);
                    }
                    break;

                  case 'tensor_chunk':
                    // Ultra-fast buffering + optional UI streaming
                    if (data.index !== undefined && data.chunk && !this.completedTensors.has(data.index)) {
                      // Buffer chunks for complete callback
                      if (!this.tensorBuffers.has(data.index)) {
                        this.tensorBuffers.set(data.index, []);
                      }
                      this.tensorBuffers.get(data.index)!.push(data.chunk);
                      
                      // Optional real-time UI callback (no throttling for max speed)
                      onTensorChunk?.(data);
                      
                      if (this.verbose) {
                        console.log(`📝 Tensor ${data.index} chunk: ${data.chunk.length} chars`);
                      }
                    }
                    break;

                  case 'tensor_complete':
                    if (data.index !== undefined) {
                      // Mark tensor as completed
                      this.completedTensors.add(data.index);
                      
                      // Get all buffered data for this tensor
                      const bufferedChunks = this.tensorBuffers.get(data.index) || [];
                      const completeData = {
                        ...data,
                        streamBuffers: bufferedChunks,
                        result: {
                          ...data.result,
                          content: bufferedChunks.join('')
                        }
                      };

                      // Clean up buffer to save memory
                      this.tensorBuffers.delete(data.index);

                      // Call the guaranteed last callback
                      onTensorComplete?.(completeData);
                      
                      if (this.verbose) {
                        console.log(`✅ Tensor ${data.index} completed with ${bufferedChunks.length} chunks`);
                      }
                    }
                    break;

                  case 'complete':
                    if (this.verbose) {
                      console.log(`🎉 All tensors completed!`);
                    }
                    onComplete?.(data);
                    return;

                  case 'error':
                  case 'fatal_error':
                    throw new Error(data.error || data.details || 'Streaming error');
                }
              } catch (parseError) {
                if (this.verbose) {
                  console.warn('Failed to parse streaming data:', line, parseError);
                }
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

  // /**
  //  * Process a single tensor (non-streaming)
  //  */
  // async processSingle(request: StreamRequest): Promise<any> {
  //   const response = await fetch(`${this.baseUrl}/process`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${this.apiKey}`,
  //       'x-api-key': this.apiKey,
  //     },
  //     body: JSON.stringify(request),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //   }

  //   return response.json();
  // }

  /**
   * Clean up any pending resources
   */
  destroy(): void {
    this.completedTensors.clear();
    this.tensorBuffers.clear();
  }
}