import { request } from "@umijs/max";
import type {
  SpiderItem,
  SpiderDetail,
  SpiderTestResult,
  CrawlResultItem,
  PageResult,
  SpiderTasksParams,
  SpiderCreateParams,
  ProTableResult,
} from "./data.d";

// 复用 manager 模块的 TaskItem 类型（避免循环依赖，直接 import）
import type { TaskItem } from "../task/manager/data";

/**
 * 爬虫列表（含使用统计）
 */
export async function spiderList(params: {
  current?: number;
  pageSize?: number;
}): Promise<ProTableResult<SpiderItem>> {
  const res = await request<{ data: PageResult<SpiderItem> }>(
    "/api/spider/list",
    {
      method: "POST",
      data: {
        page: params.current || 1,
        pageSize: params.pageSize || 10,
      },
    }
  );
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}

/** 爬虫详情（含完整统计+最近执行） */
export async function spiderDetail(code: string) {
  console.log("Fetching spider detail for code:", code);
  return request<{ data: SpiderDetail }>("/api/spider/detail", {
    method: "GET",
    params: { code },
  });
}

/** 创建爬虫 */
export async function spiderCreate(data: SpiderCreateParams) {
  return request<{ data: { id: number } }>("/api/spider/create", {
    method: "POST",
    data,
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
  limit: number = 5
) {
  return request<{ data: SpiderTestResult }>("/api/spider/test", {
    method: "POST",
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
  }
) {
  const res = await request<{ data: PageResult<TaskItem> }>(
    "/api/spider/tasks",
    {
      method: "POST",
      data: {
        code: params.code,
        page: params.current || 1,
        pageSize: params.pageSize || 10,
      },
    }
  );
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}

/** 启用/禁用爬虫 */
export async function spiderToggleStatus(code: string, status: number) {
  return request(`/api/spider/${code}/toggle-status`, { method: "POST", data: { status } });
}

/** 删除爬虫 */
export async function spiderDelete(id: number) {
  return request(`/api/spider/${id}`, { method: "DELETE" });
}

/** 爬虫模板列表 */
export async function spiderTemplateList(params: { current?: number; pageSize?: number }) {
  return request<{ data: PageResult<any> }>("/api/spider-template/list", { method: "POST", data: { page: params.current || 1, pageSize: params.pageSize || 100 } });
}
