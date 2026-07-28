import { request } from '@umijs/max';
import type { PipelineItem, PageResult, ProTableResult } from './data.d';

export async function pipelineList(params: { current?: number; pageSize?: number }): Promise<ProTableResult<PipelineItem>> {
  const res = await request<{ data: PageResult<PipelineItem> }>('/api/pipeline/list', { method: 'POST', data: { page: params.current || 1, pageSize: params.pageSize || 20 } });
  return { data: res.data.list, total: res.data.total, success: true };
}
