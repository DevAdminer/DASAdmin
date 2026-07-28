export interface AIProviderItem { id: number; code: string; name: string; providerType: string; status: number; createdAt: string; }
export interface AIModelItem { id: number; code: string; name: string; providerName: string; modelType: string; contextWindow: number; pricePer1k: number; status: number; }
export interface AIPromptItem { id: number; code: string; name: string; category: string; version: number; status: number; createdAt: string; }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ProTableResult<T> { data: T[]; total: number; success: boolean; }
