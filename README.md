# TensorChat Streaming

A TypeScript/JavaScript package for real-time streaming with Tensorchat.io cincurrent/tensor prompting.

## Installation

```bash
npm install @tensorchat/streaming
```

## Usage

### Basic Streaming

```javascript
import { TensorChatStreaming } from '@tensorchat/streaming';

const client = new TensorChatStreaming({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.tensorchat.ai', // optional
  throttleMs: 50 // optional, default 50ms
});

const request = {
  context: 'Your context here',
  model: 'gpt-4',
  tensors: [
    {
      messages: 'Your prompt',
      concise: true,
      search: false
    }
  ]
};

await client.streamProcess(request, {
  onStart: (data) => console.log('Started:', data),
  onTensorChunk: (data) => console.log('Chunk:', data.chunk),
  onTensorComplete: (data) => console.log('Complete:', data),
  onError: (error) => console.error('Error:', error)
});
```

### React Hook

```jsx
import { useTensorChatStreaming } from '@tensorchat/streaming';

function MyComponent() {
  const { streamProcess } = useTensorChatStreaming({
    apiKey: 'your-api-key'
  });

  const handleStream = async () => {
    await streamProcess(request, {
      onTensorChunk: (data) => {
        // Update UI with streaming data
        setResult(prev => prev + data.chunk);
      }
    });
  };

  return <button onClick={handleStream}>Start Stream</button>;
}
```

## API Reference

### TensorChatStreaming

Main streaming client class.

#### Constructor Options

- `apiKey`: Your TensorChat API key
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

## License

MIT