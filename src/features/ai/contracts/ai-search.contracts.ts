export interface AiSearchRequest {
  query: string;
  topK?: number;
}

export interface AiSearchResponse {
  answer: string;
  results: SearchResultDto[];
}

export interface SearchResultDto {
  specialistId: string;
  score: number;
  snippet: string;
}

export interface SearchHistoryItem {
  id: string;
  rawQuery: string;
  createdAtUtc: string;
  wasHelpful?: boolean;
  clickedSpecialistId?: string;
}

export interface SearchFeedbackRequest {
  wasHelpful: boolean;
  clickedSpecialistId?: string;
}

export interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
}

export interface ChatResponse {
  reply: string;
  specialists: SpecialistCardDto[];
}

export interface SpecialistCardDto {
  id: string;
  name: string;
  title?: string;
  profileImageUrl?: string;
  hourlyRate: number;
  rating: number;
  isOnline: boolean;
}
