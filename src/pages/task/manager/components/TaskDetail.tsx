import { PageLoading } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Drawer,
  Row,
  Statistic,
  Tag,
} from "antd";
import React from "react";
import { jobStats, taskDetail } from "../service";
import type { TaskItem } from "../data";

interface TaskDetailProps {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
}

const statusMap: Record<number, { text: string; status: string }> = {
  0: { text: "草稿", status: "default" },
  1: { text: "启用", status: "success" },
  2: { text: "暂停", status: "warning" },
};

const runTypeMap: Record<number, string> = {
  0: "定时调度",
  1: "间隔执行",
  2: "手动触发",
};

const jobStatusColor: Record<string, string> = {
  success: "green",
  failed: "red",
  running: "blue",
  pending: "orange",
  cancelled: "default",
};

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, open, onClose }) => {
  const { data: detailRes, isLoading } = useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => taskDetail(taskId!),
    enabled: !!taskId && open,
  });

  const { data: statsRes } = useQuery({
    queryKey: ["job-stats", taskId],
    queryFn: () => jobStats(taskId || undefined),
    enabled: !!taskId && open,
  });

  const task = detailRes?.data as TaskItem | undefined;
  const stats = statsRes?.data;

  return (
    <Drawer
      title="任务详情"
      size={720}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {isLoading ? (
        <PageLoading />
      ) : task ? (
        <>
          {/* 基本信息 */}
          <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="任务名称">
                {task.taskName}
              </Descriptions.Item>
              <Descriptions.Item label="任务编码">
                <Tag>{task.taskCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="爬虫标识">
                {task.spiderCode}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={statusMap[task.status]?.status as any}
                  text={statusMap[task.status]?.text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="创建人">
                {task.creator || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {task.createdAt || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {task.description || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                {task.tags
                  ? task.tags.split(",").map((t) => (
                      <Tag key={t.trim()} color="blue">
                        {t.trim()}
                      </Tag>
                    ))
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 调度信息 */}
          <Card title="调度信息" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="调度类型">
                {runTypeMap[task.runType] || "-"}
              </Descriptions.Item>
              {task.runType === 0 && (
                <Descriptions.Item label="Cron 表达式">
                  <code>{task.cronExpr || "-"}</code>
                </Descriptions.Item>
              )}
              {task.runType === 1 && (
                <Descriptions.Item label="间隔秒数">
                  {task.intervalSeconds} 秒
                </Descriptions.Item>
              )}
              <Descriptions.Item label="最后执行时间">
                {task.lastRunTime || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="最后执行状态">
                {task.lastJobStatus ? (
                  <Tag color={jobStatusColor[task.lastJobStatus] || "default"}>
                    {task.lastJobStatus}
                  </Tag>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Job 统计 */}
          <Card title="执行统计" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="总执行次数" value={stats?.total ?? 0} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功"
                  value={stats?.success ?? 0}
                  styles={{ content: { color: "#3f8600" } }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="失败"
                  value={stats?.failed ?? 0}
                  styles={{ content: { color: "#cf1322" } }}
                />
              </Col>
              <Col span={6}>
                <Statistic title="采集数据量" value={stats?.totalItems ?? 0} />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={6}>
                <Statistic title="运行中" value={stats?.running ?? 0} />
              </Col>
              <Col span={6}>
                <Statistic title="等待中" value={stats?.pending ?? 0} />
              </Col>
              <Col span={6}>
                <Statistic title="已取消" value={stats?.cancelled ?? 0} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均耗时"
                  value={stats?.avgDurationMs ?? 0}
                  suffix="ms"
                />
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <div>任务不存在</div>
      )}
    </Drawer>
  );
};

export default TaskDetail;
