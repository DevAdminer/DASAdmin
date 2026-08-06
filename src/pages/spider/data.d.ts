/**
 * 爬虫管理模块类型定义
 * 字段与后端返回的驼峰命名保持一致（V3 DB 对齐）
 */

/** 配置字段定义（测试爬取动态表单渲染依据，来自插件注册元信息） */
export interface ConfigField {
  field: string;
  label: string;
  type: "string" | "number" | "select" | "json";
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: string[];
}

/** 爬虫列表项（后端 /api/spider/list 返回） */
export interface SpiderItem {
  uid: string;
  code: string;
  name: string;
  displayName?: string;
  description?: string;
  sourceType: string;      // html/rss/json_api/playwright
  templateCode?: string;   // 关联模板编码
  isPlugin: number;        // 0=DB创建 1=插件注册
  tags: string[];
  status: number;          // 1启用 0禁用
  // 统计字段
  taskCount: number;
  jobCount: number;
  successCount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
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
  uid: string;
  code: string;
  status: string;
  taskName?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  itemsCount?: number;
  createdAt?: string;
}

/** 爬虫详情（/api/spider/detail） */
export interface SpiderDetail extends SpiderItem {
  config?: Record<string, any> | null;
  fieldMapping?: Array<Record<string, any>>;
  stats: SpiderStats;
  recentJobs: SpiderRecentJob[];
}

/** 创建爬虫参数 */
export interface SpiderCreateParams {
  name: string;
  code: string;
  description?: string;
  templateUid?: string;
  sourceType?: string;
  config?: Record<string, any>;
  fieldMapping?: Array<Record<string, any>>;
  tags?: string[];
  status?: number;
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

/** 关联任务项 */
export interface SpiderTaskItem {
  uid: string;
  code: string;
  name: string;
  spiderCode: string;
  runType: number;
  status: number;
  jobCount: number;
  successCount: number;
  createdAt: string;
  updatedAt: string;
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
  status: "ok" | "error";
  data: T;
}

/** ProTable request 返回格式 */
export interface ProTableResult<T> {
  data: T[];
  total: number;
  success: boolean;
}
