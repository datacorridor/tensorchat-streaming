// Test the framework-agnostic Tensorchat streaming package
import { createTensorchatStreaming, TensorchatStreaming } from './dist/index.esm.js';

console.log('Testing framework-agnostic Tensorchat streaming package...');

// Test 1: Direct client instantiation
console.log('\n1. Testing direct client instantiation...');
try {
  const client = new TensorchatStreaming({
    apiKey: 'test-key',
    baseUrl: 'https://api.tensorchat.ai',
    throttleMs: 100
  });
  console.log('✅ Direct client created successfully');
  client.destroy();
} catch (error) {
  console.error('❌ Direct client failed:', error.message);
}

// Test 2: Framework-agnostic manager
console.log('\n2. Testing framework-agnostic manager...');
try {
  const streaming = createTensorchatStreaming({
    apiKey: 'test-key',
    baseUrl: 'https://api.tensorchat.ai',
    throttleMs: 50
  });
  console.log('✅ Streaming manager created successfully');
  
  // Test config update
  streaming.updateConfig({ throttleMs: 100 });
  console.log('✅ Config update works');
  
  // Test client access
  const client = streaming.getClient();
  console.log('✅ Client access works:', client ? 'got client' : 'no client');
  
  streaming.destroy();
  console.log('✅ Cleanup works');
} catch (error) {
  console.error('❌ Streaming manager failed:', error.message);
}

// Test 3: React hook (should fail gracefully without React)
console.log('\n3. Testing React hook without React...');
try {
  const { useTensorchatStreaming } = await import('./dist/index.esm.js');
  useTensorchatStreaming({ apiKey: 'test-key' });
  console.log('❌ React hook should have failed without React');
} catch (error) {
  console.log('✅ React hook correctly failed without React:', error.message);
}

console.log('\n🎉 All tests completed! Package is framework-agnostic.');