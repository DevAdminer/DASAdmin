import { request } from "@umijs/max";
import type {
  TaskItem,
  TaskListParams,
  TaskCreateParams,
  TaskUpdateParams,
  JobItem,
  JobListParams,
  JobLogItem,
  JobDataItem,
  JobStats,
  TaskOptions,
  PageResult,
  ProTableResult,
} from "./data";

/**
 * 任务列表（ProTable request 适配）
 * ProTable 传入 { current, pageSize, ...searchParams }
 * 后端 POST /api/task/list body 用驼峰字段
 */
export async function taskList(params: {
  current?: number;
  pageSize?: number;
  taskName?: string;
  spiderCode?: string;
  status?: number;
  runType?: number;
  creator?: string;
}): Promise<ProTableResult<TaskItem>> {
  const res = await request<{ data: PageResult<TaskItem> }>("/api/task/list", {
    method: "POST",
    data: {
      page: params.current || 1,
      pageSize: params.pageSize || 10,
      taskName: params.taskName,
      spiderCode: params.spiderCode,
      status: params.status,
      runType: params.runType,
      creator: params.creator,
    },
  });
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}

/** 任务详情 */
export async function taskDetail(id: number) {
  return request<{ data: TaskItem }>("/api/task/detail", {
    method: "GET",
    params: { id },
  });
}

/** 创建任务 */
export async function taskCreate(data: TaskCreateParams) {
  return request<{ data: { id: number } }>("/api/task/create", {
    method: "POST",
    data,
  });
}

/** 更新任务 */
export async function taskUpdate(data: TaskUpdateParams) {
  return request<{ data: { id: number } }>("/api/task/update", {
    method: "POST",
    data,
  });
}

/** 删除任务 */
export async function taskDelete(id: number) {
  return request<{ data: { id: number } }>("/api/task/delete", {
    method: "POST",
    data: { id },
  });
}

/** 启用/暂停任务 */
export async function taskToggleStatus(id: number, status: number) {
  return request<{ data: any }>("/api/task/toggle-status", {
    method: "POST",
    data: { id, status },
  });
}

/** 手动触发任务 */
export async function taskTrigger(id: number, triggerType = "manual") {
  return request<{ data: { jobId: number; jobNo: string } }>(
    "/api/task/trigger",
    {
      method: "POST",
      data: { id, triggerType },
    }
  );
}

/** 获取下拉选项 */
export async function taskOptions() {
  return request<{ data: TaskOptions }>("/api/task/options", {
    method: "GET",
  });
}

// ==================== Job 相关 ====================

/** Job 列表（ProTable request 适配） */
export async function jobList(params: {
  current?: number;
  pageSize?: number;
  taskId?: number;
  status?: string;
  triggerType?: string;
  triggerBy?: string;
}): Promise<ProTableResult<JobItem>> {
  const res = await request<{ data: PageResult<JobItem> }>("/api/job/list", {
    method: "POST",
    data: {
      page: params.current || 1,
      pageSize: params.pageSize || 10,
      taskId: params.taskId,
      status: params.status,
      triggerType: params.triggerType,
      triggerBy: params.triggerBy,
    },
  });
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}

/** Job 详情 */
export async function jobDetail(id: number) {
  return request<{ data: JobItem }>("/api/job/detail", {
    method: "GET",
    params: { id },
  });
}

/** 取消 Job */
export async function jobCancel(id: number) {
  return request<{ data: any }>("/api/job/cancel", {
    method: "POST",
    data: { id },
  });
}

/** 重试 Job */
export async function jobRetry(id: number) {
  return request<{ data: any }>("/api/job/retry", {
    method: "POST",
    data: { id },
  });
}

/** Job 统计 */
export async function jobStats(taskId?: number) {
  return request<{ data: JobStats }>("/api/job/stats", {
    method: "GET",
    params: { taskId },
  });
}

/** Job 日志（分页） */
export async function jobLogs(
  jobId: number,
  params: { page?: number; pageSize?: number; level?: string }
) {
  return request<{ data: PageResult<JobLogItem> }>("/api/job/logs", {
    method: "GET",
    params: {
      jobId,
      page: params.page || 1,
      pageSize: params.pageSize || 50,
      level: params.level,
    },
  });
}

/** Job 采集数据项（分页） */
export async function jobItems(
  jobId: number,
  params: { page?: number; pageSize?: number; keyword?: string }
) {
  return request<{ data: PageResult<JobDataItem> }>("/api/job/items", {
    method: "GET",
    params: {
      jobId,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword,
    },
  });
}
