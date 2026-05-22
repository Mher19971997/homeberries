import { $authHost, $host } from '@homeberris/http/index';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  suggestedCatalogs?: any[];
  youtubeVideoId?: string;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface SearchResponse {
  catalogs: any[];
}

export interface HealthResponse {
  connected: boolean;
  message: string;
}

const chat = async (request: ChatRequest): Promise<ChatResponse> => {
  const { data } = await $host.post('/api/v1/ai/chat', request);
  return data;
};

const search = async (request: SearchRequest): Promise<SearchResponse> => {
  const { data } = await $host.post('/api/v1/ai/search', request);
  return data;
};

const checkHealth = async (): Promise<HealthResponse> => {
  const { data } = await $host.get('/api/v1/ai/health');
  return data;
};

export { chat, search, checkHealth };
