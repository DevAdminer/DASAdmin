/**
 * 爬虫管理模块类型定义
 * 字段与后端返回的驼峰命名保持一致
 */

/** 配置字段定义（动态表单渲染依据） */
export interface ConfigField {
  field: string;
  label: string;
  type: "string" | "number" | "select" | "json";
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: string[];
}

/** 爬虫列表项 */
export interface SpiderItem {
  id: number;
  name: string;
  code: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  tags: string;
  sourceType: string;
  className: string;
  configFields: ConfigField[];
  status: number;       // 1=启用 0=禁用
  isPlugin: number;     // 0=DB创建 1=插件注册
  // 统计字段（列表接口附加）
  taskCount: number;
  jobCount: number;
  successCount: number;
  failedCount: number;
  totalItems: number;
  updatedAt: string;
  createdAt: string;
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

/** 创建爬虫参数 */
export interface SpiderCreateParams {
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
  status: "ok" | "error";
  data: T;
}

export enum SpiderType {
  REQUESTS = "requests",
  PLAYWRIGHT = "playwright",
  SCRAPY = "scrapy",
  API = "api",
  CUSTOM = "custom",
}

/** 提取规则 */
export interface ExtractRule {
  field: string;
  selector: string;
  selector_type: "css" | "xpath" | "regex" | "json";
  attribute?: string;
  transform?: string[];
  default_value?: string;
  required?: boolean;
  description?: string;
}

/** 分页规则 */
export interface PaginationRule {
  type: "url" | "click" | "scroll" | "button";
  selector?: string;
  next_page_selector?: string;
  max_pages?: number;
  page_param?: string;
  page_size?: number;
}
/** ProTable request 返回格式 */
export interface ProTableResult<T> {
  data: T[];
  total: number;
  success: boolean;
}
