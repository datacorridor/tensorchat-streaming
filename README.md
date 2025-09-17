# Tensorchat Streaming Javascript Client

[![NPM version](https://badge.fury.io/js/@tensorchat.io%2Fstreaming.svg)](https://badge.fury.io/js/@tensorchat.io%2Fstreaming)
[![Node.js 14+](https://img.shields.io/badge/node.js-14+-blue.svg)](https://nodejs.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Framework-agnostic TypeScript/JavaScript client for Tensorchat.io streaming API. Process multiple LLM prompts concurrently with real-time streaming responses.

## Features

- **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, Svelte, or any framework
- **Real-time Streaming**: Get live updates as tensors are processed
- **Concurrent Processing**: Handle multiple prompts simultaneously
- **TypeScript Support**: Fully typed for better developer experience
- **Configurable**: Throttling, custom endpoints, and more
- **Lightweight**: No framework dependencies required

<!-- ## Models & API Access

- **400+ Models Available**: Access over 400 language models through [Openrouter](https://openrouter.ai) integration
- **API Key**: Obtain your API key from [tensorchat.io](https://tensorchat.io) to get started
- **Multiple Providers**: Support for OpenAI, Anthropic, Google, and many other model providers through a unified interface -->

## Installation

```bash
npm install @tensorchat.io/streaming
```

## Usage

### Basic Streaming

```javascript
import { TensorchatStreaming } from "@tensorchat.io/streaming";

const client = new TensorchatStreaming({
  apiKey: "your-api-key",
  baseUrl: "https://api.tensorchat.ai", // optional
  throttleMs: 50, // optional, default 50ms
});

const request = {
  context: "Your context here",
  model: "google/gemini-2.5-flash-lite",
  tensors: [
    {
      messages: "Your prompt",
      concise: true,
      search: false,
    },
  ],
};

await client.streamProcess(request, {
  onStart: (data) => console.log("Started:", data),
  onTensorChunk: (data) => console.log("Chunk:", data.chunk),
  onTensorComplete: (data) => console.log("Complete:", data),
  onError: (error) => console.error("Error:", error),
});
```

### React Usage (Recommended)

Basic React integration with the framework-agnostic package:

```jsx
import React, { useEffect, useRef, useState } from "react";
import { createTensorchatStreaming } from "@tensorchat.io/streaming";

function TensorProcessor() {
  const streamingClient = useRef(null);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize streaming client
  useEffect(() => {
    streamingClient.current = createTensorchatStreaming({
      apiKey: "your-api-key",
    });

    return () => streamingClient.current?.destroy();
  }, []);

  const handleProcess = async () => {
    setIsProcessing(true);
    setResults([]);

    await streamingClient.current.streamProcess(
      {
        content: "Your content here...",
        tensors: [
          { messages: "Summarize this" },
          { messages: "Extract key points" },
        ],
      },
      {
        onTensorChunk: (data) => {
          // Update results in real-time
          setResults((prev) => {
            const newResults = [...prev];
            newResults[data.index] =
              (newResults[data.index] || "") + data.result?.chunk;
            return newResults;
          });
        },
        onComplete: () => setIsProcessing(false),
        onError: (error) => {
          console.error("Error:", error);
          setIsProcessing(false);
        },
      }
    );
  };

  return (
    <div>
      <button onClick={handleProcess} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Start Processing"}
      </button>

      {results.map((result, index) => (
        <div key={index}>
          <h3>Result {index + 1}</h3>
          <p>{result}</p>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### TensorchatStreaming

Main streaming client class.

#### Constructor Options

- `apiKey`: Your Tensorchat API key
- `baseUrl`: API base URL (optional)
- `throttleMs`: Throttle interval for chunk updates (optional, default 50ms)

#### Methods

- `streamProcess(request, callbacks)`: Stream process tensors
- `destroy()`: Clean up resources

### Stream Callbacks

- `onStart`: Stream started
- `onProgress`: Tensor processing started
- `onSearchProgress`: Search in progress
- `onSearchComplete`: Search completed
- `onTensorChunk`: Streaming content chunk
- `onTensorComplete`: Tensor processing complete
- `onTensorError`: Tensor processing error
- `onComplete`: All tensors complete
- `onError`: Fatal error occurred

## Links & Resources

- **PyPI Package**: https://pypi.org/project/tensorchat-streaming/
- **NPM Package**: https://www.npmjs.com/package/@tensorchat.io/streaming
- **GitHub Repository**: https://github.com/datacorridor/tensorchat-streaming
- **Tensorchat Platform**: https://tensorchat.io
- **API Documentation**: https://tensorchat.io/#api-docs
- **OpenRouter Models**: https://openrouter.ai/models

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support & Contributing

- **Issues**: [GitHub Issues](https://github.com/datacorridor/tensorchat-streaming/issues)
- **Email**: support@datacorridor.io
- **Documentation**: [tensorchat.io/#api-docs](https://tensorchat.io/#api-docs)

**Tensorchat.io is a product of Data Corridor Limited**

**Made with ❤️ for the AI community**
