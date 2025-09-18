// Ultra-fast streaming example with real-time UI updates
const { TensorchatStreaming } = require('./dist/index.js');

async function demonstrateUltraFastStreaming() {
  // Initialize with minimal config
  const client = new TensorchatStreaming({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.tensorchat.ai',
    verbose: true // Enable to see performance logs
  });

  const request = {
    context: 'Analyze market trends',
    model: 'gpt-4',
    tensors: [
      { messages: 'What are the current crypto trends?' },
      { messages: 'Analyze stock market volatility' },
      { messages: 'Predict next quarter performance' }
    ]
  };

  // Track UI state for demonstration
  const tensorContent = new Map();

  try {
    await client.streamProcess(request, {
      // Search progress updates (when search is enabled)
      onSearchProgress: (data) => {
        console.log(`🔍 Searching for tensor ${data.index}...`);
        // Update search status in UI
        // updateSearchStatus(data.index, 'searching');
      },
      
      // Search completion (when search is enabled)
      onSearchComplete: (data) => {
        console.log(`✅ Search complete for tensor ${data.index}`);
        // Update search status in UI
        // updateSearchStatus(data.index, 'complete');
      },
      
      // Real-time UI updates (called for each chunk)
      onTensorChunk: (data) => {
        if (!tensorContent.has(data.index)) {
          tensorContent.set(data.index, '');
        }
        // Update UI immediately - no throttling delays!
        tensorContent.set(data.index, tensorContent.get(data.index) + data.chunk);
        console.log(`⚡ UI Update - Tensor ${data.index}: +${data.chunk.length} chars`);
        
        // Update your React state, DOM, or UI framework here
        // updateTensorDisplay(data.index, tensorContent.get(data.index));
      },
      
      // Final guaranteed callback (called once per tensor when complete)
      onTensorComplete: (data) => {
        console.log(`🚀 Tensor ${data.index} complete!`);
        console.log(`📄 Final content length: ${data.result.content.length}`);
        console.log(`⚡ Total chunks processed: ${data.streamBuffers?.length || 0}`);
        console.log(`🎯 UI content length: ${tensorContent.get(data.index)?.length || 0}`);
        console.log('---');
        
        // Final UI update with complete data
        // finalizeTensorDisplay(data.index, data.result.content);
      },
      
      // Called once when all tensors complete
      onComplete: (data) => {
        console.log('🎉 All processing complete!');
        console.log(`Total tensors: ${data.totalTensors}`);
      },
      
      // Error handling
      onError: (error) => {
        console.error('❌ Error:', error.message);
      }
    });
  } finally {
    // Clean up resources
    client.destroy();
  }
}

// Key performance benefits:
console.log(`
🚀 ULTRA-FAST STREAMING WITH UI UPDATES:

✅ Zero throttling - immediate UI updates
✅ Dual callback system - chunks for UI, complete for finalization
✅ Optimized buffer processing - indexOf with start position
✅ Memory efficient - buffers cleared after completion
✅ Guaranteed callback order - onTensorComplete always last
✅ No requestAnimationFrame overhead
✅ No setTimeout/clearTimeout calls
✅ Real-time UI responsiveness

⚡ Result: Maximum throughput + instant UI updates!

📱 Usage Pattern:
- onSearchProgress: Show search status/spinner
- onSearchComplete: Hide search status, prepare for content
- onTensorChunk: Update UI state immediately (React setState, etc.)
- onTensorComplete: Final processing, validation, storage
`);

// Uncomment to run:
// demonstrateUltraFastStreaming();