import { useRef, useCallback, useEffect } from 'react';
import { TensorChatStreaming } from './TensorChatStreaming';
import { StreamRequest, StreamCallbacks, TensorChatConfig } from './types';

/**
 * React hook for TensorChat streaming
 */
export function useTensorChatStreaming(config: TensorChatConfig) {
  const clientRef = useRef<TensorChatStreaming | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = new TensorChatStreaming(config);
    
    return () => {
      clientRef.current?.destroy();
    };
  }, [config.apiKey, config.baseUrl, config.throttleMs]);

  const streamProcess = useCallback(
    (request: StreamRequest, callbacks: StreamCallbacks = {}) => {
      if (!clientRef.current) {
        throw new Error('TensorChat client not initialized');
      }
      return clientRef.current.streamProcess(request, callbacks);
    },
    []
  );

  const processSingle = useCallback(
    (request: StreamRequest) => {
      if (!clientRef.current) {
        throw new Error('TensorChat client not initialized');
      }
      return clientRef.current.processSingle(request);
    },
    []
  );

  return {
    streamProcess,
    processSingle,
    client: clientRef.current,
  };
}