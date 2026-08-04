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
  name?: string;
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
      name: params.name,
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
export async function taskDetail(uid: string) {
  return request<{ data: TaskItem }>("/api/task/detail", {
    method: "GET",
    params: { uid },
  });
}

/** 创建任务 */
export async function taskCreate(data: TaskCreateParams) {
  return request<{ data: { uid: string } }>("/api/task/create", {
    method: "POST",
    data,
  });
}

/** 更新任务 */
export async function taskUpdate(data: TaskUpdateParams) {
  return request<{ data: { uid: string } }>("/api/task/update", {
    method: "POST",
    data,
  });
}

/** 删除任务 */
export async function taskDelete(uid: string) {
  return request<{ data: { uid: string } }>("/api/task/delete", {
    method: "POST",
    data: { uid },
  });
}

/** 启用/暂停任务 */
export async function taskToggleStatus(uid: string, status: number) {
  return request<{ data: any }>("/api/task/toggle", {
    method: "POST",
    data: { uid, status },
  });
}

/** 手动触发任务 */
export async function taskTrigger(uid: string, triggerType = "manual") {
  return request<{ data: { jobId: number; jobCode: string } }>(
    "/api/task/trigger",
    {
      method: "POST",
      data: { uid, triggerType },
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
  taskUid?: string;
  status?: string;
  triggerType?: string;
}): Promise<ProTableResult<JobItem>> {
  const res = await request<{ data: PageResult<JobItem> }>("/api/job/list", {
    method: "POST",
    data: {
      page: params.current || 1,
      pageSize: params.pageSize || 10,
      taskUid: params.taskUid,
      status: params.status,
      triggerType: params.triggerType,
    },
  });
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}

/** Job 详情 */
export async function jobDetail(uid: string) {
  return request<{ data: JobItem }>("/api/job/detail", {
    method: "GET",
    params: { uid },
  });
}

/** 取消 Job */
export async function jobCancel(uid: string) {
  return request<{ data: any }>("/api/job/cancel", {
    method: "POST",
    data: { uid },
  });
}

/** 重试 Job */
export async function jobRetry(uid: string) {
  return request<{ data: any }>("/api/job/retry", {
    method: "POST",
    data: { uid },
  });
}

/** Job 统计 */
export async function jobStats(taskUid?: string) {
  return request<{ data: JobStats }>("/api/job/stats", {
    method: "GET",
    params: { taskUid },
  });
}

/** Job 日志（分页） */
export async function jobLogs(
  jobUid: string,
  params: { page?: number; pageSize?: number; level?: string }
) {
  return request<{ data: PageResult<JobLogItem> }>("/api/job/logs", {
    method: "GET",
    params: {
      uid: jobUid,
      page: params.page || 1,
      pageSize: params.pageSize || 50,
      level: params.level,
    },
  });
}

/** Job 采集数据项（分页） */
export async function jobItems(
  jobUid: string,
  params: { page?: number; pageSize?: number; keyword?: string }
) {
  return request<{ data: PageResult<JobDataItem> }>("/api/job/items", {
    method: "GET",
    params: {
      uid: jobUid,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword,
    },
  });
}
