import { request } from '@umijs/max';
import type { KBItem, PageResult, ProTableResult } from './data.d';
export async function kbList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<KBItem>> {
  const res = await request<{ data: PageResult<KBItem> }>('/api/knowledge/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
