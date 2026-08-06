import { request } from '@umijs/max';
import type {
  PipelineItem, PipelineDetail, PipelineNodeType, PageResult, ProTableResult, ActionResponse,
} from './data.d';

/** 流水线列表（ProTable request 适配） */
export async function pipelineList(params: {
  current?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<ProTableResult<PipelineItem>> {
  const res = await request<{ data: PageResult<PipelineItem> }>('/api/pipeline/list', {
    method: 'POST',
    data: { page: params.current || 1, pageSize: params.pageSize || 20, keyword: params.keyword },
  });
  return { data: res.data.list, total: res.data.total, success: true };
}

/** 流水线详情（含节点+连接） */
export async function pipelineDetail(uid: string) {
  return request<{ data: PipelineDetail }>('/api/pipeline/detail', {
    method: 'GET',
    params: { uid },
  });
}

/** 创建流水线 */
export async function createPipeline(data: { code: string; name: string; description?: string }) {
  return request<ActionResponse>('/api/pipeline/create', { method: 'POST', data });
}

/** 更新流水线 */
export async function updatePipeline(data: { uid: string; name?: string; description?: string; status?: number }) {
  return request<ActionResponse>('/api/pipeline/update', { method: 'POST', data });
}

/** 删除流水线 */
export async function deletePipeline(uid: string) {
  return request<ActionResponse>('/api/pipeline/delete', { method: 'POST', data: { uid } });
}

/** 保存画布（节点+连接全量替换） */
export async function savePipelineGraph(
  uid: string,
  nodes: any[],
  connections: any[]
) {
  return request<{ msg: string; status: string; data: { nodeCount: number; connectionCount: number } }>(
    '/api/pipeline/saveGraph',
    { method: 'POST', data: { uid, nodes, connections } }
  );
}

/** 节点类型列表 */
export async function pipelineNodeTypes() {
  return request<{ data: PipelineNodeType[] }>('/api/pipeline/nodeTypes', {
    method: 'GET',
  });
}
