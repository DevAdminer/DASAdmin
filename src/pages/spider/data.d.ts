/**
 * 爬虫管理模块类型定义
 * 字段与后端返回的驼峰命名保持一致
 */

/** 配置字段定义（动态表单渲染依据） */
export interface ConfigField {
  field: string;
  label: string;
  type: 'string' | 'number' | 'select' | 'json';
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: string[];
}

/** 爬虫列表项 */
export interface SpiderItem {
  code: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  sourceType: string;
  className: string;
  configFields: ConfigField[];
  // 统计字段（列表接口附加）
  taskCount: number;
  jobCount: number;
  successCount: number;
  failedCount: number;
  totalItems: number;
}

/** 爬虫统计信息 */
export interface SpiderStats {
  taskCount: number;
  jobCount: number;
  successCount: number;
  failedCount: number;
  runningCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalItems: number;
  avgDurationMs: number;
  lastRunTime?: string | null;
}

/** 最近执行的 Job */
export interface SpiderRecentJob {
  id: number;
  jobNo: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  itemsCount?: number;
  taskName?: string;
}

/** 爬虫详情 */
export interface SpiderDetail extends SpiderItem {
  stats: SpiderStats;
  recentJobs: SpiderRecentJob[];
}

/** 测试爬取结果项 */
export interface CrawlResultItem {
  title: string;
  content: string;
  url: string;
  author: string;
  source: string;
  publishTime?: string;
  tags: string[];
  images: string[];
  extra: Record<string, any>;
}

/** 测试爬取结果 */
export interface SpiderTestResult {
  code: string;
  displayName: string;
  itemsCount: number;
  durationMs: number;
  items: CrawlResultItem[];
  error: string | null;
}

/** 关联任务查询参数 */
export interface SpiderTasksParams {
  code: string;
  page?: number;
  pageSize?: number;
}

/** 分页结果（复用 manager 模块的定义格式） */
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
