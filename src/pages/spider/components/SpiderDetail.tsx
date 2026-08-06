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
import type { ColumnsType } from "antd/es/table";
import type { ProColumns } from "@ant-design/pro-components";
import React from "react";
import { spiderDetail, spiderTasks } from "../service";
import type { SpiderDetail as SpiderDetailType } from "../data.d";
import type { SpiderTaskItem } from "../data.d";

const { Text } = Typography;

const jobStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: "待执行", color: "orange" },
  running: { text: "运行中", color: "blue" },
  success: { text: "成功", color: "green" },
  failed: { text: "失败", color: "red" },
  cancelled: { text: "已取消", color: "default" },
};

interface SpiderDetailProps {
  spiderCode: string | null; // 详情接口用 uid 定位
  open: boolean;
  onClose: () => void;
}

const SpiderDetail: React.FC<SpiderDetailProps> = ({
  spiderCode,
  open,
  onClose,
}) => {
  const { data: detailRes, isLoading } = useQuery({
    queryKey: ["spider-detail", spiderCode],
    queryFn: () => spiderDetail(spiderCode!),
    enabled: !!spiderCode && open,
  });

  const detail = detailRes?.data as SpiderDetailType | undefined;

  const recentJobColumns: ColumnsType<any> = [
    {
      title: "Job 编码",
      dataIndex: "code",
      key: "code",
      width: 200,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v: string) => {
        const s = jobStatusMap[v] || { text: v, color: "default" };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
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

  const taskColumns: ProColumns<SpiderTaskItem>[] = [
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      copyable: true,
    },
    {
      title: "任务编码",
      dataIndex: "code",
      key: "code",
      search: false,
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      search: false,
      width: 90,
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
      width: 90,
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
                        {detail.displayName || detail.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="编码">
                        <Text code>{detail.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="来源类型">
                        <Tag>{detail.sourceType}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="关联模板">
                        {detail.templateCode ? (
                          <Tag color="purple">{detail.templateCode}</Tag>
                        ) : (
                          "-"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="类型" span={2}>
                        {detail.isPlugin === 1 ? (
                          <Tag color="geekblue">插件注册</Tag>
                        ) : (
                          <Tag>DB 创建</Tag>
                        )}
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

                  {/* 字段映射 */}
                  <Card
                    title="字段映射"
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    {detail.fieldMapping?.length ? (
                      <Table
                        size="small"
                        pagination={false}
                        rowKey={(r, i) => `${r.source_field}-${i}`}
                        dataSource={detail.fieldMapping as any[]}
                        columns={[
                          {
                            title: "源字段",
                            dataIndex: "sourceField",
                            key: "sourceField",
                            render: (v: string) => <Text code>{v}</Text>,
                          },
                          {
                            title: "目标字段",
                            dataIndex: "targetField",
                            key: "targetField",
                            render: (v: string) => <Text code>{v}</Text>,
                          },
                          {
                            title: "类型",
                            dataIndex: "type",
                            key: "type",
                            width: 90,
                            render: (v: string) => <Tag>{v || "-"}</Tag>,
                          },
                          {
                            title: "提取规则",
                            dataIndex: "rule",
                            key: "rule",
                            render: (v: string) => v || "-",
                          },
                        ]}
                      />
                    ) : (
                      <Empty description="暂无字段映射" />
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
                    rowKey="uid"
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
                <ProTable<SpiderTaskItem>
                  rowKey="uid"
                  size="small"
                  search={false}
                  options={false}
                  request={
                    (async (params: any) =>
                      spiderTasks({
                        code: detail.code,
                        current: params.current,
                        pageSize: params.pageSize,
                      })) as any
                  }
                  columns={taskColumns}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
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
