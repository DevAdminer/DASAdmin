import { request } from '@umijs/max';
import type { AIProviderItem, AIModelItem, AIPromptItem, PageResult, ProTableResult } from './data.d';

export async function providerList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<AIProviderItem>> {
  const res = await request<{ data: PageResult<AIProviderItem> }>('/api/ai/providers', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
export async function modelList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<AIModelItem>> {
  const res = await request<{ data: PageResult<AIModelItem> }>('/api/ai/models', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
export async function promptList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<AIPromptItem>> {
  const res = await request<{ data: PageResult<AIPromptItem> }>('/api/ai/prompts', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
