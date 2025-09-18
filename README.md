# Tensorchat Streaming JavaScript Client

[![NPM version](https://badge.fury.io/js/@tensorchat.io%2Fstreaming.svg)](https://badge.fury.io/js/@tensorchat.io%2Fstreaming)
[![Node.js 14+](https://img.shields.io/badge/node.js-14+-blue.svg)](https://nodejs.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Framework-agnostic TypeScript/JavaScript client for Tensorchat.io streaming API. Process multiple LLM prompts concurrently with real-time streaming responses and ultra-fast performance optimizations.

## Features

- **Ultra-Fast Streaming**: Zero throttling delays with optimized buffer processing
- **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, Svelte, or any framework
- **Real-time UI Updates**: Live streaming updates for responsive user interfaces
- **Concurrent Processing**: Handle multiple prompts simultaneously with intelligent buffering
- **TypeScript Support**: Fully typed for better developer experience
- **Search Integration**: Track search progress and completion for enhanced UX
- **Memory Efficient**: Automatic buffer cleanup and minimal memory footprint
- **Guaranteed Callbacks**: Reliable completion callbacks with complete data

## Installation

```bash
npm install @tensorchat.io/streaming
```

## Quick Start

```javascript
import { TensorchatStreaming } from "@tensorchat.io/streaming";

const client = new TensorchatStreaming({
  apiKey: "your-api-key",
  baseUrl: "https://api.tensorchat.ai", // optional
  verbose: false // optional, default false
});

const request = {
  context: "Analyze the following data",
  model: "gpt-4",
  tensors: [
    { messages: "Summarize key trends", search: true },
    { messages: "Extract insights", search: false },
    { messages: "Generate recommendations", search: true }
  ]
};

await client.streamProcess(request, {
  onSearchProgress: (data) => {
    console.log(`Searching for tensor ${data.index}...`);
  },
  
  onSearchComplete: (data) => {
    console.log(`Search complete for tensor ${data.index}`);
  },
  
  onTensorChunk: (data) => {
    // Real-time UI updates - called for each chunk
    console.log(`Tensor ${data.index}: ${data.chunk}`);
    updateUI(data.index, data.chunk);
  },
  
  onTensorComplete: (data) => {
    // Final callback with complete data
    console.log(`Tensor ${data.index} complete`);
    console.log(`Content: ${data.result.content}`);
    console.log(`Total chunks: ${data.streamBuffers.length}`);
  },
  
  onComplete: (data) => {
    console.log("All tensors processed");
  },
  
  onError: (error) => {
    console.error("Processing error:", error);
  }
});

// Clean up when done
client.destroy();
```

## Advanced Usage

### React Integration

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { TensorchatStreaming } from '@tensorchat.io/streaming';

function StreamingComponent() {
  const [tensorContents, setTensorContents] = useState({});
  const [searchStatuses, setSearchStatuses] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    clientRef.current = new TensorchatStreaming({
      apiKey: process.env.REACT_APP_TENSORCHAT_API_KEY,
      verbose: true
    });

    return () => clientRef.current?.destroy();
  }, []);

  const processData = async () => {
    setIsProcessing(true);
    setTensorContents({});
    setSearchStatuses({});

    const request = {
      context: "Market analysis context",
      model: "gpt-4",
      tensors: [
        { messages: "Analyze crypto trends", search: true },
        { messages: "Stock market overview", search: true },
        { messages: "Economic predictions", search: false }
      ]
    };

    try {
      await clientRef.current.streamProcess(request, {
        onSearchProgress: (data) => {
          setSearchStatuses(prev => ({
            ...prev,
            [data.index]: 'searching'
          }));
        },

        onSearchComplete: (data) => {
          setSearchStatuses(prev => ({
            ...prev,
            [data.index]: 'complete'
          }));
        },

        onTensorChunk: (data) => {
          setTensorContents(prev => ({
            ...prev,
            [data.index]: (prev[data.index] || '') + data.chunk
          }));
        },

        onTensorComplete: (data) => {
          // Final validation and processing
          console.log(`Tensor ${data.index} final content:`, data.result.content);
        },

        onComplete: () => {
          setIsProcessing(false);
        },

        onError: (error) => {
          console.error('Streaming error:', error);
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Request failed:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <button onClick={processData} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Start Analysis'}
      </button>

      {Object.entries(tensorContents).map(([index, content]) => (
        <div key={index} style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
          <h3>
            Tensor {index}
            {searchStatuses[index] === 'searching' && ' (Searching...)'}
            {searchStatuses[index] === 'complete' && ' (Search Complete)'}
          </h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        </div>
      ))}
    </div>
  );
}

export default StreamingComponent;
```

### Framework Manager (Alternative)

For more complex applications, use the framework manager:

```javascript
import { createTensorchatStreaming } from '@tensorchat.io/streaming';

const manager = createTensorchatStreaming({
  apiKey: 'your-api-key',
  verbose: true
});

// Use the manager
await manager.streamProcess(request, callbacks);

// Update configuration
manager.updateConfig({ verbose: false });

// Clean up
manager.destroy();
```

## API Reference

### TensorchatStreaming Class

#### Constructor Options

```typescript
interface TensorchatConfig {
  apiKey: string;           // Your Tensorchat API key (required)
  baseUrl?: string;         // API endpoint (default: 'https://api.tensorchat.ai')
  verbose?: boolean;        // Enable debug logging (default: false)
}
```

#### Methods

##### `streamProcess(request, callbacks)`

Process tensors with real-time streaming.

**Parameters:**
- `request`: StreamRequest object
- `callbacks`: StreamCallbacks object

**Returns:** Promise<void>

##### `destroy()`

Clean up resources and clear buffers.

### Stream Request Format

```typescript
interface StreamRequest {
  context: string;          // Context for all tensors
  model: string;            // LLM model to use
  tensors: TensorConfig[];  // Array of tensor configurations
}

interface TensorConfig {
  messages: string;         // The prompt/message
  concise?: boolean;        // Request concise response
  model?: string;           // Override model for this tensor
  search?: boolean;         // Enable search for this tensor
}
```

### Stream Callbacks

```typescript
interface StreamCallbacks {
  onSearchProgress?: (data: StreamEventData) => void;     // Search in progress
  onSearchComplete?: (data: StreamEventData) => void;     // Search completed
  onTensorChunk?: (data: StreamEventData) => void;        // Streaming content chunk
  onTensorComplete?: (data: StreamEventData) => void;     // Tensor complete with final data
  onComplete?: (data: StreamEventData) => void;           // All tensors complete
  onError?: (error: Error) => void;                       // Error handling
}
```

### Stream Event Data

```typescript
interface StreamEventData {
  type: string;             // Event type
  index?: number;           // Tensor index
  chunk?: string;           // Content chunk (for tensor_chunk events)
  result?: {
    content: string;        // Complete content (for tensor_complete events)
    // ... other result properties
  };
  streamBuffers?: string[]; // All chunks for this tensor (tensor_complete only)
  error?: string;           // Error message (for error events)
  totalTensors?: number;    // Total number of tensors (for complete events)
}
```

## Performance Optimizations

The client includes several performance optimizations for maximum throughput:

- **Zero Throttling**: No artificial delays in chunk processing
- **Optimized Buffer Processing**: Uses indexOf with start position for efficient string parsing
- **Memory Efficient**: Automatic buffer cleanup after tensor completion
- **Minimal String Operations**: Single join operation per tensor for final content
- **Smart Callback Management**: Guaranteed callback ordering with onTensorComplete as final call

## Error Handling

The client provides comprehensive error handling:

```javascript
await client.streamProcess(request, {
  onError: (error) => {
    console.error('Streaming error:', error.message);
    // Handle different error types
    if (error.message.includes('HTTP 401')) {
      // Handle authentication error
    } else if (error.message.includes('HTTP 429')) {
      // Handle rate limiting
    }
  }
});
```

## Best Practices

1. **Always call destroy()** when done to clean up resources
2. **Use onTensorChunk** for real-time UI updates
3. **Use onTensorComplete** for final processing and validation
4. **Enable search callbacks** when using search functionality
5. **Handle errors gracefully** with proper error callbacks
6. **Set verbose: true** during development for debugging

## Browser Compatibility

- Modern browsers with fetch API support
- Node.js 14+
- TypeScript 4.0+

## Links & Resources

- **NPM Package**: https://www.npmjs.com/package/@tensorchat.io/streaming
- **GitHub Repository**: https://github.com/datacorridor/tensorchat-streaming
- **Tensorchat Platform**: https://tensorchat.io
- **API Documentation**: https://tensorchat.io/#api-docs

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/datacorridor/tensorchat-streaming/issues)
- **Email**: support@datacorridor.io
- **Documentation**: [tensorchat.io/#api-docs](https://tensorchat.io/#api-docs)

Tensorchat.io is a product of Data Corridor Limited
