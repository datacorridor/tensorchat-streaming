#!/usr/bin/env python3
"""
Multi-tensor requests test - shows complete results for multiple concurrent tensors
"""

import asyncio
import json
from datetime import datetime
from tensorchat_streaming import (
    TensorchatStreaming,
    TensorchatConfig,
    StreamRequest,
    TensorConfig,
    StreamCallbacks
)

# Use your API key
API_KEY = "my-api-key-here"

class MultiTensorResultCollector:
    """Collects complete results from multiple tensors."""
    
    def __init__(self, demo_name):
        self.demo_name = demo_name
        self.tensor_results = {}
        self.tensor_buffers = {}
        self.completed_tensors = set()
        self.start_time = None
        self.total_tensors = 0
        
        print(f"\n{'='*70}")
        print(f"🚀 MULTI-TENSOR DEMO: {demo_name}")
        print(f"{'='*70}")
    
    def on_start(self, data):
        self.start_time = datetime.now()
        self.total_tensors = data.total_tensors
        
        print(f"⏰ Started: {self.start_time.strftime('%H:%M:%S')}")
        print(f"🎯 Model: {data.model}")
        print(f"📊 Total Tensors: {data.total_tensors}")
        print(f"🔍 Search Applied: {data.search_applied}")
        print(f"{'='*70}")
        
        # Initialize buffers for all tensors
        for i in range(self.total_tensors):
            self.tensor_buffers[i] = ""
    
    def on_progress(self, data):
        print(f"⏳ Starting tensor {data.index + 1}...")
    
    def on_search_progress(self, data):
        print(f"🔍 Searching for tensor {data.index + 1}...")
    
    def on_search_complete(self, data):
        print(f"✅ Search complete for tensor {data.index + 1}")
    
    def on_tensor_chunk(self, data):
        # Accumulate chunks for each tensor
        if data.chunk:
            self.tensor_buffers[data.index] += data.chunk
            
        # Show progress indicator
        completed = len(self.completed_tensors)
        in_progress = len([i for i in self.tensor_buffers if i not in self.completed_tensors and self.tensor_buffers[i]])
        
        print(f"\r📝 Streaming... Completed: {completed}/{self.total_tensors}, In Progress: {in_progress}", end="", flush=True)
    
    def on_tensor_complete(self, data):
        # Store complete result
        tensor_idx = data.index
        complete_result = self.tensor_buffers[tensor_idx]
        
        self.tensor_results[tensor_idx] = {
            "content": complete_result,
            "length": len(complete_result),
            "metadata": data.result,
            "timestamp": datetime.now()
        }
        
        self.completed_tensors.add(tensor_idx)
        
        print(f"\n✅ TENSOR {tensor_idx + 1} COMPLETED - Length: {len(complete_result)} chars")
        print(f"Progress: {len(self.completed_tensors)}/{self.total_tensors}")
    
    def on_complete(self, data):
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        print(f"\n🎉 ALL {self.total_tensors} TENSORS COMPLETED!")
        print(f"⏰ Total Duration: {duration:.2f} seconds")
        print(f"📊 Average per tensor: {duration/self.total_tensors:.2f} seconds")
        
        # Display all complete results
        self.display_all_results()
    
    def on_error(self, error):
        print(f"\n❌ ERROR: {error}")
    
    def display_all_results(self):
        """Display all tensor results in a formatted way."""
        
        print(f"\n{'='*70}")
        print(f"📋 COMPLETE RESULTS FOR ALL TENSORS")
        print(f"{'='*70}")
        
        for tensor_idx in sorted(self.tensor_results.keys()):
            result = self.tensor_results[tensor_idx]
            
            print(f"\n🔹 TENSOR {tensor_idx + 1}")
            print(f"{'─'*50}")
            print(f"📏 Length: {result['length']} characters")
            print(f"⏰ Completed: {result['timestamp'].strftime('%H:%M:%S')}")
            print(f"📄 Content:")
            print(f"{'─'*30}")
            print(result['content'])
            print(f"{'─'*50}")
        
        # Summary statistics
        total_chars = sum(r['length'] for r in self.tensor_results.values())
        avg_chars = total_chars / len(self.tensor_results) if self.tensor_results else 0
        
        print(f"\n📊 SUMMARY STATISTICS:")
        print(f"Total Characters: {total_chars:,}")
        print(f"Average per Tensor: {avg_chars:.1f}")
        print(f"Total Tensors: {len(self.tensor_results)}")

async def test_data_analysis_tasks():
    """Test with multiple data analysis tasks."""
    
    config = TensorchatConfig(
        api_key=API_KEY,
        base_url="https://api.tensorchat.io"
    )
    
    collector = MultiTensorResultCollector("Data Analysis Tasks")
    
    callbacks = StreamCallbacks(
        on_start=collector.on_start,
        on_progress=collector.on_progress,
        on_search_progress=collector.on_search_progress,
        on_search_complete=collector.on_search_complete,
        on_tensor_chunk=collector.on_tensor_chunk,
        on_tensor_complete=collector.on_tensor_complete,
        on_complete=collector.on_complete,
        on_error=collector.on_error
    )
    
    request = StreamRequest(
        context="You are a data analyst expert. Provide detailed analysis and insights.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(
                messages="Analyze the benefits and drawbacks of using Python for data science.",
                concise=False
            ),
            TensorConfig(
                messages="Explain the difference between supervised and unsupervised machine learning with examples.",
                concise=False
            ),
            TensorConfig(
                messages="What are the key considerations when choosing a database for a large-scale application?",
                concise=False
            ),
            TensorConfig(
                messages="Describe the main steps in the data science workflow from problem definition to deployment.",
                concise=False
            ),
            TensorConfig(
                messages="Compare and contrast REST APIs vs GraphQL APIs for modern web applications.",
                concise=False
            )
        ]
    )
    
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)

async def test_code_generation_tasks():
    """Test with multiple code generation tasks."""
    
    config = TensorchatConfig(
        api_key=API_KEY,
        base_url="https://api.tensorchat.io"
    )
    
    collector = MultiTensorResultCollector("Code Generation Tasks")
    
    callbacks = StreamCallbacks(
        on_start=collector.on_start,
        on_progress=collector.on_progress,
        on_tensor_chunk=collector.on_tensor_chunk,
        on_tensor_complete=collector.on_tensor_complete,
        on_complete=collector.on_complete,
        on_error=collector.on_error
    )
    
    request = StreamRequest(
        context="You are a Python expert. Write clean, well-documented code with examples.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(
                messages="Write a Python class for a binary search tree with insert, search, and delete methods.",
                concise=False
            ),
            TensorConfig(
                messages="Create a Python decorator that measures function execution time and logs it.",
                concise=False
            ),
            TensorConfig(
                messages="Write a Python script that reads a CSV file and generates basic statistics (mean, median, mode).",
                concise=False
            ),
            TensorConfig(
                messages="Create a Python async web scraper using aiohttp that can scrape multiple URLs concurrently.",
                concise=False
            )
        ]
    )
    
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)

async def test_comparison_tasks():
    """Test with comparison and analysis tasks."""
    
    config = TensorchatConfig(
        api_key=API_KEY,
        base_url="https://api.tensorchat.io"
    )
    
    collector = MultiTensorResultCollector("Technology Comparisons")
    
    callbacks = StreamCallbacks(
        on_start=collector.on_start,
        on_progress=collector.on_progress,
        on_tensor_chunk=collector.on_tensor_chunk,
        on_tensor_complete=collector.on_tensor_complete,
        on_complete=collector.on_complete,
        on_error=collector.on_error
    )
    
    request = StreamRequest(
        context="You are a technology expert. Provide detailed comparisons with pros, cons, and use cases.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(
                messages="Compare React vs Vue.js vs Angular for frontend development in 2024.",
                concise=False
            ),
            TensorConfig(
                messages="Compare PostgreSQL vs MongoDB vs Redis for different application needs.",
                concise=False
            ),
            TensorConfig(
                messages="Compare Docker vs Kubernetes vs traditional VMs for application deployment.",
                concise=False
            )
        ]
    )
    
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)

async def test_large_scale_request():
    """Test with 8 tensors for maximum concurrency."""
    
    config = TensorchatConfig(
        api_key=API_KEY,
        base_url="https://api.tensorchat.io",
        throttle_ms=20  # Faster updates for large scale
    )
    
    collector = MultiTensorResultCollector("Large Scale - 8 Tensors")
    
    callbacks = StreamCallbacks(
        on_start=collector.on_start,
        on_progress=collector.on_progress,
        on_tensor_chunk=collector.on_tensor_chunk,
        on_tensor_complete=collector.on_tensor_complete,
        on_complete=collector.on_complete,
        on_error=collector.on_error
    )
    
    request = StreamRequest(
        context="You are an expert consultant. Provide comprehensive answers.",
        model="google/gemini-2.5-flash-lite",
        tensors=[
            TensorConfig(messages="Explain cloud computing and its main service models.", concise=False),
            TensorConfig(messages="What is DevOps and how does it improve software development?", concise=False),
            TensorConfig(messages="Describe microservices architecture and its benefits.", concise=False),
            TensorConfig(messages="What is artificial intelligence and machine learning?", concise=False),
            TensorConfig(messages="Explain blockchain technology and its applications.", concise=False),
            TensorConfig(messages="What is cybersecurity and why is it important?", concise=False),
            TensorConfig(messages="Describe the Internet of Things (IoT) and its impact.", concise=False),
            TensorConfig(messages="What are the principles of good software architecture?", concise=False)
        ]
    )
    
    async with TensorchatStreaming(config) as client:
        await client.stream_process(request, callbacks)

async def main():
    """Run all multi-tensor tests."""
    
    print("TensorChat Streaming - MULTI-TENSOR COMPLETE RESULTS")
    print("=" * 80)
    print("🎯 This demo shows complete results from multiple concurrent tensors")
    print("📊 Watch as tensors are processed simultaneously and see full outputs")
    
    tests = [
        ("Data Analysis (5 tensors)", test_data_analysis_tasks),
        ("Code Generation (4 tensors)", test_code_generation_tasks),
        ("Technology Comparisons (3 tensors)", test_comparison_tasks),
        ("Large Scale Test (8 tensors)", test_large_scale_request),
    ]
    
    for test_name, test_func in tests:
        try:
            print(f"\n⏭️  Next Test: {test_name}")
            print("🔄 This will process multiple tensors concurrently...")
            input("Press Enter to start (or Ctrl+C to exit)...")
            
            await test_func()
            
            print(f"\n✅ Test '{test_name}' completed!")
            input("Press Enter to continue to next test...")
            
        except KeyboardInterrupt:
            print(f"\n⏹️  Tests stopped by user")
            break
        except Exception as e:
            print(f"❌ Test '{test_name}' failed: {e}")
            continue
    
    print(f"\n🎉 All multi-tensor tests completed!")
    print("🔍 Key observations:")
    print("  • Multiple tensors process concurrently")
    print("  • Each tensor maintains its own streaming buffer")  
    print("  • Complete results are collected and displayed")
    print("  • Performance scales well with tensor count")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")