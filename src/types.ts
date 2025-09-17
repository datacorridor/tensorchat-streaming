export interface TensorConfig {
  messages: string;
  concise?: boolean;
  model?: string;
  search?: boolean;
}

export interface StreamRequest {
  context: string;
  model: string;
  tensors: TensorConfig[];
}

export interface StreamEventData {
  type: 'start' | 'progress' | 'search_progress' | 'search_complete' | 
        'tensor_chunk' | 'tensor_complete' | 'tensor_error' | 'complete' | 
        'error' | 'fatal_error';
  index?: number;
  chunk?: string;
  result?: any;
  error?: string;
  details?: string;
  totalTensors?: number;
  model?: string;
  searchApplied?: boolean;
  tensors?: any[];
  streamBuffers?: string[];
}

export interface StreamCallbacks {
  onStart?: (data: StreamEventData) => void;
  onProgress?: (data: StreamEventData) => void;
  onSearchProgress?: (data: StreamEventData) => void;
  onSearchComplete?: (data: StreamEventData) => void;
  onTensorChunk?: (data: StreamEventData) => void;
  onTensorComplete?: (data: StreamEventData) => void;
  onTensorError?: (data: StreamEventData) => void;
  onComplete?: (data: StreamEventData) => void;
  onError?: (error: Error) => void;
}

export interface TensorChatConfig {
  apiKey: string;
  baseUrl?: string;
  throttleMs?: number;
}