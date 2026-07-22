import { request } from '@umijs/max';
import type {
  SpiderItem,
  SpiderDetail,
  SpiderTestResult,
  CrawlResultItem,
  PageResult,
  SpiderTasksParams,
} from './data.d';

// 复用 manager 模块的 TaskItem 类型（避免循环依赖，直接 import）
import type { TaskItem } from '../manager/data.d';

/**
 * 爬虫列表（含使用统计）
 */
export async function spiderList(): Promise<SpiderItem[]> {
  const res = await request<{ data: SpiderItem[] }>('/api/spider/list', {
    method: 'GET',
  });
  return res.data;
}

/** 爬虫详情（含完整统计+最近执行） */
export async function spiderDetail(code: string) {
  return request<{ data: SpiderDetail }>('/api/spider/detail', {
    method: 'GET',
    params: { code },
  });
}

/**
 * 测试爬取
 * @param code 爬虫标识
 * @param config 测试配置
 * @param limit 返回数据条数上限
 */
export async function spiderTest(
  code: string,
  config: Record<string, any> | null,
  limit: number = 5,
) {
  return request<{ data: SpiderTestResult }>('/api/spider/test', {
    method: 'POST',
    data: { code, config, limit },
  });
}

/**
 * 使用该爬虫的任务列表（ProTable request 适配）
 */
export async function spiderTasks(
  params: SpiderTasksParams & {
    current?: number;
    pageSize?: number;
  },
) {
  const res = await request<{ data: PageResult<TaskItem> }>('/api/spider/tasks', {
    method: 'POST',
    data: {
      code: params.code,
      page: params.current || 1,
      pageSize: params.pageSize || 10,
    },
  });
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}
