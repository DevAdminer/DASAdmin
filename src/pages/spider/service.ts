import { request } from "@umijs/max";
import type {
  SpiderItem,
  SpiderDetail,
  SpiderTestResult,
  CrawlResultItem,
  PageResult,
  SpiderTasksParams,
  SpiderCreateParams,
  SpiderTaskItem,
  ProTableResult,
} from "./data.d";

/** 创建/操作类统一响应（后端 ok_msg 格式） */
export interface ActionResponse {
  msg: string;
  status: string;
}

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
export async function spiderDetail(uid: string) {
  return request<{ data: SpiderDetail }>("/api/spider/detail", {
    method: "GET",
    params: { uid },
  });
}

/** 创建爬虫 */
export async function spiderCreate(data: SpiderCreateParams) {
  return request<ActionResponse>("/api/spider/create", {
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
): Promise<ProTableResult<SpiderTaskItem>> {
  const res = await request<{ data: PageResult<SpiderTaskItem> }>(
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
export async function spiderToggleStatus(uid: string, status: number) {
  return request<ActionResponse>("/api/spider/toggleStatus", {
    method: "POST",
    data: { uid, status },
  });
}

/** 删除爬虫 */
export async function spiderDelete(uid: string) {
  return request<ActionResponse>("/api/spider/delete", {
    method: "POST",
    data: { uid },
  });
}

/** 爬虫管理顶部统计 */
export interface SpiderStats {
  total: number;
  enabled: number;
  disabled: number;
  today: number;
}
export async function spiderStats(): Promise<{ data: SpiderStats }> {
  return request("/api/spider/stats", { method: "GET" });
}


/** 爬虫模板列表 */
export async function spiderTemplateList(params: {
  current?: number;
  pageSize?: number;
}) {
  return request<{ data: PageResult<any> }>("/api/spider/templates", {
    method: "POST",
    data: { page: params.current || 1, pageSize: params.pageSize || 100, scope: "all" },
  });
}
