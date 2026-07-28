import { request } from '@umijs/max';
import type { ArticleItem, DocumentItem, PageResult, ProTableResult } from './data.d';
export async function articleList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<ArticleItem>> {
  const res = await request<{ data: PageResult<ArticleItem> }>('/api/data/articles', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
export async function documentList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<DocumentItem>> {
  const res = await request<{ data: PageResult<DocumentItem> }>('/api/data/documents', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
