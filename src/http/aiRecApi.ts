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

export interface CompareRequest {
  products: any[];
  criteriaCount?: number;
}

export interface LocalizedText {
  ru: string;
  en: string;
  hy: string;
}

export interface ComparisonCriterion {
  title: LocalizedText;
  winnerIndex: number;
  values: LocalizedText[];
  explanation: LocalizedText;
}

export interface ComparisonResult {
  criteria: ComparisonCriterion[];
  overallWinnerIndex: number;
  overallReason: LocalizedText;
  finalRecommendation: LocalizedText;
}

export interface CompareResponse {
  response: ComparisonResult | string;
  products: any[];
}

const chat = async (request: ChatRequest): Promise<ChatResponse> => {
  const { data } = await $host.post('/api/v1/aiRec/chat', request);
  return data;
};

const search = async (request: SearchRequest): Promise<SearchResponse> => {
  const { data } = await $host.post('/api/v1/aiRec/search', request);
  return data;
};

const checkHealth = async (): Promise<HealthResponse> => {
  const { data } = await $host.get('/api/v1/aiRec/health');
  return data;
};

const compare = async (request: CompareRequest): Promise<CompareResponse> => {
  const { data } = await $authHost.post('/api/v1/aiRec/compare', request);
  return data;
};

export { chat, search, checkHealth, compare };
