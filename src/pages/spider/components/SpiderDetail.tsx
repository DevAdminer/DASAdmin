import { PageLoading, ProTable } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Row,
  Statistic,
  Table,
  Tag,
  Tabs,
  Typography,
} from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import React from "react";
import { spiderDetail, spiderTasks } from "../service";
import type {
  SpiderDetail as SpiderDetailType,
  SpiderRecentJob,
} from "../data.d";
import type { TaskItem } from "../../task/manager/data";

const { Text } = Typography;

const jobStatusColor: Record<string, string> = {
  success: "green",
  failed: "red",
  running: "blue",
  pending: "orange",
  cancelled: "default",
};

interface SpiderDetailProps {
  spiderCode: string | null;
  open: boolean;
  onClose: () => void;
}

const SpiderDetail: React.FC<SpiderDetailProps> = ({
  spiderCode,
  open,
  onClose,
}) => {
  console.log(
    "SpiderDetail component rendered with spiderCode:",
    spiderCode,
    "and open:",
    open
  );
  const { data: detailRes, isLoading } = useQuery({
    queryKey: ["spider-detail", spiderCode],
    queryFn: () => spiderDetail(spiderCode!),
    enabled: !!spiderCode && open,
  });

  const detail = detailRes?.data as SpiderDetailType | undefined;

  const recentJobColumns = [
    {
      title: "Job 编号",
      dataIndex: "jobNo",
      key: "jobNo",
      width: 200,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v: string) => (
        <Tag color={jobStatusColor[v] || "default"}>{v}</Tag>
      ),
    },
    {
      title: "任务名称",
      dataIndex: "taskName",
      key: "taskName",
    },
    {
      title: "开始时间",
      dataIndex: "startedAt",
      key: "startedAt",
      width: 180,
    },
    {
      title: "耗时",
      dataIndex: "durationMs",
      key: "durationMs",
      width: 100,
      render: (v: number) => (v != null ? `${v} ms` : "-"),
    },
    {
      title: "数据量",
      dataIndex: "itemsCount",
      key: "itemsCount",
      width: 80,
      render: (v: number) => v ?? 0,
    },
  ];

  const taskColumns: ProColumns<TaskItem>[] = [
    {
      title: "任务名称",
      dataIndex: "taskName",
      key: "taskName",
      copyable: true,
    },
    {
      title: "任务编码",
      dataIndex: "taskCode",
      key: "taskCode",
      search: false,
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      search: false,
      width: 80,
      valueType: "select",
      valueEnum: {
        0: { text: "草稿" },
        1: { text: "启用" },
        2: { text: "暂停" },
      },
      render: (_, r) => {
        const map: Record<number, { text: string; status: string }> = {
          0: { text: "草稿", status: "default" },
          1: { text: "启用", status: "success" },
          2: { text: "暂停", status: "warning" },
        };
        return (
          <Badge
            status={map[r.status]?.status as any}
            text={map[r.status]?.text}
          />
        );
      },
    },
    {
      title: "执行次数",
      dataIndex: "jobCount",
      key: "jobCount",
      search: false,
      width: 80,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      search: false,
      width: 180,
    },
  ];

  return (
    <Drawer
      title="爬虫详情"
      size={900}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {isLoading ? (
        <PageLoading />
      ) : detail ? (
        <Tabs
          items={[
            {
              key: "info",
              label: "基本信息",
              children: (
                <>
                  <Card
                    title="爬虫信息"
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="名称">
                        {detail.displayName}
                      </Descriptions.Item>
                      <Descriptions.Item label="编码">
                        <Text code>{detail.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="版本">
                        <Tag color="blue">{detail.version}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="来源类型">
                        <Tag>{detail.sourceType}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="类名">
                        <Text code>{detail.className}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="作者">
                        {detail.author || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="描述" span={2}>
                        {detail.description || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="标签" span={2}>
                        {detail.tags?.length
                          ? detail.tags.map((t) => (
                              <Tag key={t} color="geekblue">
                                {t}
                              </Tag>
                            ))
                          : "-"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* 配置字段 */}
                  <Card
                    title="配置字段"
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    {detail.configFields?.length ? (
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="field"
                        dataSource={detail.configFields}
                        columns={[
                          {
                            title: "字段",
                            dataIndex: "field",
                            key: "field",
                            width: 120,
                            render: (v: string) => <Text code>{v}</Text>,
                          },
                          {
                            title: "标签",
                            dataIndex: "label",
                            key: "label",
                            width: 120,
                          },
                          {
                            title: "类型",
                            dataIndex: "type",
                            key: "type",
                            width: 80,
                            render: (v: string) => <Tag>{v}</Tag>,
                          },
                          {
                            title: "必填",
                            dataIndex: "required",
                            key: "required",
                            width: 60,
                            render: (v: boolean) =>
                              v ? <Tag color="red">是</Tag> : <Tag>否</Tag>,
                          },
                          {
                            title: "默认值",
                            dataIndex: "default",
                            key: "default",
                            width: 100,
                            render: (v: any) =>
                              v != null ? <Text code>{String(v)}</Text> : "-",
                          },
                          {
                            title: "说明",
                            dataIndex: "placeholder",
                            key: "placeholder",
                            render: (v: string) => v || "-",
                          },
                        ]}
                      />
                    ) : (
                      <Empty description="此爬虫无需配置参数" />
                    )}
                  </Card>
                </>
              ),
            },
            {
              key: "stats",
              label: "使用统计",
              children: detail.stats ? (
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="关联任务数"
                        value={detail.stats.taskCount}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="总执行次数"
                        value={detail.stats.jobCount}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="成功次数"
                        value={detail.stats.successCount}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="失败次数"
                        value={detail.stats.failedCount}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="采集数据总量"
                        value={detail.stats.totalItems}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="运行中"
                        value={detail.stats.runningCount}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="平均耗时"
                        value={detail.stats.avgDurationMs}
                        suffix="ms"
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="最后执行"
                        value={detail.stats.lastRunTime || "从未"}
                      />
                    </Card>
                  </Col>
                </Row>
              ) : (
                <Empty description="暂无统计数据" />
              ),
            },
            {
              key: "recent",
              label: "最近执行",
              children: (
                <Card size="small">
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    dataSource={detail.recentJobs || []}
                    columns={recentJobColumns}
                  />
                </Card>
              ),
            },
            {
              key: "tasks",
              label: "关联任务",
              children: (
                <ProTable<TaskItem>
                  rowKey="id"
                  size="small"
                  search={false}
                  options={false}
                  request={async (params) => {
                    return spiderTasks({
                      code: spiderCode!,
                      current: params.current,
                      pageSize: params.pageSize,
                    });
                  }}
                  columns={taskColumns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                  }}
                />
              ),
            },
          ]}
        />
      ) : (
        <Empty description="爬虫不存在" />
      )}
    </Drawer>
  );
};

export default SpiderDetail;
