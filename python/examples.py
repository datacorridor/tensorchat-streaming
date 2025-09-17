"""
Example usage of Tensorchat Streaming Python client.
"""

import asyncio
import logging
from tensorchat_streaming import (
    TensorchatStreaming,
    TensorchatStreamingManager, 
    create_streaming_manager,
    TensorchatConfig,
    StreamRequest,
    TensorConfig,
    StreamCallbacks
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def basic_streaming_example():
    """Basic streaming example with callbacks."""
    print("=== Basic Streaming Example ===")
    
    config = TensorchatConfig(
        api_key="your-api-key-here",
        base_url="https://api.tensorchat.ai",
        throttle_ms=50
    )
    
    # Define callbacks
    def on_start(data):
        print(f"🚀 Started processing {data.total_tensors} tensors with {data.model}")
    
    def on_tensor_chunk(data):
        print(f"📝 Tensor {data.index}: {data.chunk}")
    
    def on_tensor_complete(data):
        print(f"✅ Tensor {data.index} completed")
    
    def on_complete(data):
        print("🎉 All tensors completed!")
    
    def on_error(error):
        print(f"❌ Error: {error}")
    
    callbacks = StreamCallbacks(
        on_start=on_start,
        on_tensor_chunk=on_tensor_chunk,
        on_tensor_complete=on_tensor_complete,
        on_complete=on_complete,
        on_error=on_error
    )
    
    # Create request
    request = StreamRequest(
        context="You are analyzing customer feedback for a software product.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(
                messages="Summarize the main themes in this feedback: 'The app is great but crashes sometimes. Love the new features though!'",
                concise=True
            ),
            TensorConfig(
                messages="Extract sentiment from: 'The app is great but crashes sometimes. Love the new features though!'",
                concise=True
            ),
            TensorConfig(
                messages="Suggest improvements based on: 'The app is great but crashes sometimes. Love the new features though!'",
                concise=True
            )
        ]
    )
    
    # Stream process
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)


async def manager_example():
    """Example using the streaming manager."""
    print("\n=== Manager Example ===")
    
    config = TensorchatConfig(api_key="your-api-key-here")
    manager = create_streaming_manager(config)
    
    try:
        request = StreamRequest(
            context="You are a data analyst.",
            model="openai/gpt-3.5-turbo",
            tensors=[
                TensorConfig(messages="What are the key benefits of async programming in Python?"),
                TensorConfig(messages="Compare asyncio vs threading in Python")
            ]
        )
        
        # Single request (non-streaming)
        result = await manager.process_single(request)
        print(f"Single request result: {result}")
        
    finally:
        await manager.destroy()


async def stateful_processor_example():
    """Example with stateful processing and result collection."""
    print("\n=== Stateful Processor Example ===")
    
    class ResultCollector:
        def __init__(self):
            self.results = {}
            self.buffers = {}
        
        def on_start(self, data):
            print(f"Processing {data.total_tensors} tensors...")
            
        def on_tensor_chunk(self, data):
            if data.index not in self.buffers:
                self.buffers[data.index] = ""
            self.buffers[data.index] += data.chunk or ""
            
        def on_tensor_complete(self, data):
            self.results[data.index] = {
                "content": self.buffers.get(data.index, ""),
                "metadata": data.result
            }
            print(f"Completed tensor {data.index}")
            
        def on_complete(self, data):
            print(f"All processing complete! Collected {len(self.results)} results")
            for idx, result in self.results.items():
                print(f"Result {idx}: {result['content'][:100]}...")
    
    collector = ResultCollector()
    config = TensorchatConfig(api_key="your-api-key-here")
    
    callbacks = StreamCallbacks(
        on_start=collector.on_start,
        on_tensor_chunk=collector.on_tensor_chunk,
        on_tensor_complete=collector.on_tensor_complete,
        on_complete=collector.on_complete
    )
    
    request = StreamRequest(
        context="You are a helpful assistant.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(messages="What is machine learning?"),
            TensorConfig(messages="What is deep learning?"),
            TensorConfig(messages="What is the difference between ML and AI?")
        ]
    )
    
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)


async def error_handling_example():
    """Example with error handling and retries."""
    print("\n=== Error Handling Example ===")
    
    async def process_with_retry(config, request, max_retries=3):
        for attempt in range(max_retries):
            try:
                async with TensorchatStreaming(config) as client:
                    result = await client.process_single(request)
                    return result
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    config = TensorchatConfig(api_key="invalid-key-for-demo")
    request = StreamRequest(
        context="Test context",
        model="openai/gpt-3.5-turbo",
        tensors=[TensorConfig(messages="Test message")]
    )
    
    try:
        result = await process_with_retry(config, request)
        print(f"Success: {result}")
    except Exception as e:
        print(f"Failed after all retries: {e}")


async def main():
    """Run all examples."""
    print("Tensorchat Streaming Python Examples")
    print("=" * 40)
    
    # Note: Replace "your-api-key-here" with actual API key from tensorchat.io
    
    try:
        await basic_streaming_example()
        await manager_example() 
        await stateful_processor_example()
        await error_handling_example()
        
    except Exception as e:
        print(f"Example failed (likely due to missing API key): {e}")
        print("\nTo run these examples:")
        print("1. Get your API key from https://tensorchat.io")
        print("2. Replace 'your-api-key-here' with your actual API key")
        print("3. Run: python examples.py")


if __name__ == "__main__":
    asyncio.run(main())