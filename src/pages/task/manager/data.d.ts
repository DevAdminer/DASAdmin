/**
 * 任务管理模块类型定义
 * 字段均与后端返回的驼峰命名保持一致
 */

/** 任务状态: 0草稿 1启用 2暂停 */
type TaskStatus = 0 | 1 | 2;

/** 调度类型: 0定时 1间隔 2手动 */
type RunType = 0 | 1 | 2;

/** 任务列表项 / 详情 */
export interface TaskItem {
  id: number;
  taskName: string;
  taskCode: string;
  description?: string;
  spiderCode: string;
  spiderConfig?: Record<string, any> | null;
  pipelineConfig?: Record<string, any> | null;
  status: TaskStatus;
  runType: RunType;
  cronExpr?: string;
  intervalSeconds?: number;
  tags?: string;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  // 列表/详情附加字段
  jobCount?: number;
  successCount?: number;
  failedCount?: number;
  lastRunTime?: string;
  lastJobStatus?: string;
}

/** 任务列表查询参数 */
export interface TaskListParams {
  page?: number;
  pageSize?: number;
  taskName?: string;
  spiderCode?: string;
  status?: TaskStatus;
  runType?: RunType;
  creator?: string;
  startTime?: string;
  endTime?: string;
  orderBy?: string;
  order?: string;
}

/** 创建任务参数 */
export interface TaskCreateParams {
  taskName: string;
  taskCode: string;
  description?: string;
  spiderCode: string;
  spiderConfig?: Record<string, any>;
  pipelineConfig?: Record<string, any>;
  status?: TaskStatus;
  runType?: RunType;
  cronExpr?: string;
  intervalSeconds?: number;
  tags?: string;
}

/** 更新任务参数 */
export interface TaskUpdateParams {
  id: number;
  taskName?: string;
  description?: string;
  spiderCode?: string;
  spiderConfig?: Record<string, any>;
  pipelineConfig?: Record<string, any>;
  runType?: RunType;
  cronExpr?: string;
  intervalSeconds?: number;
  tags?: string;
}

/** Job 状态 */
type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

/** Job 列表项 / 详情 */
export interface JobItem {
  id: number;
  jobNo: string;
  taskId: number;
  triggerType: string;
  status: JobStatus;
  triggerBy?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  itemsCount?: number;
  errorMsg?: string;
  createdAt?: string;
  // 关联查询字段
  taskName?: string;
  spiderCode?: string;
}

/** Job 列表查询参数 */
export interface JobListParams {
  page?: number;
  pageSize?: number;
  taskId?: number;
  status?: JobStatus;
  triggerType?: string;
  triggerBy?: string;
  startTime?: string;
  endTime?: string;
}

/** Job 日志项 */
export interface JobLogItem {
  id: number;
  jobId: number;
  taskId: number;
  level: string;
  message: string;
  context?: Record<string, any> | null;
  createdAt: string;
}

/** Job 采集数据项 */
export interface JobDataItem {
  id: number;
  jobId: number;
  taskId: number;
  title?: string;
  content?: string;
  url?: string;
  author?: string;
  source?: string;
  publishTime?: string;
  tags?: string[];
  images?: string[] | null;
  extra?: Record<string, any> | null;
  createdAt: string;
}

/** Job 统计 */
export interface JobStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
  cancelled: number;
  totalItems: number;
  avgDurationMs?: number;
}

/** 下拉选项 */
export interface TaskOptions {
  spiders: SpiderOption[];
  usedSpiders: string[];
  runTypes: { value: number; label: string }[];
  statuses: { value: number; label: string; color: string }[];
}

export interface SpiderOption {
  code: string;
  name: string;
  class: string;
}

/** 分页结果 */
export interface PageResult<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

/** 后端统一响应 */
export interface ApiResponse<T = any> {
  msg: string;
  status: 'ok' | 'error';
  data: T;
}

/** ProTable request 返回格式 */
export interface ProTableResult<T> {
  data: T[];
  total: number;
  success: boolean;
}
