import { request } from '@umijs/max';
import type { LogItem, PageResult, ProTableResult } from './data.d';
export async function logList(type: string, params: { current?: number; pageSize?: number; level?: string }): Promise<ProTableResult<LogItem>> {
  const res = await request<{ data: PageResult<LogItem> }>(`/api/log/${type}`, { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20, level: params.level } });
  return { data: res.data.list, total: res.data.total, success: true };
}
