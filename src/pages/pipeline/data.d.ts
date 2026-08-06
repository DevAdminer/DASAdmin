/** 流水线列表项 */
export interface PipelineItem {
  uid: string;
  code: string;
  name: string;
  description?: string;
  status: number;
  version: number;
  nodeCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 流水线详情（含节点+连接） */
export interface PipelineDetail extends PipelineItem {
  nodes: PipelineNode[];
  connections: PipelineConnection[];
}

/** 画布节点 */
export interface PipelineNode {
  uid?: string;
  nodeTypeCode: string;
  name: string;
  config?: Record<string, any>;
  x: number;
  y: number;
}

/** 画布连接 */
export interface PipelineConnection {
  source: string;  // 源节点 uid
  target: string;  // 目标节点 uid
}

/** 节点类型 */
export interface PipelineNodeType {
  uid: string;
  code: string;
  name: string;
  category: string; // input/processor/ai/output
  icon?: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  configSchema?: Record<string, any>;
  isBuiltin: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProTableResult<T> {
  data: T[];
  total: number;
  success: boolean;
}

/** 创建/操作类统一响应 */
export interface ActionResponse {
  msg: string;
  status: string;
}
