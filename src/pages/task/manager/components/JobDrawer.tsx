import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  Drawer,
  Pagination,
  Table,
  Tag,
  Tabs,
  message,
} from "antd";
import React, { useRef, useState } from "react";
import { jobCancel, jobItems, jobList, jobLogs, jobRetry } from "../service";
import type { JobItem, JobLogItem, JobDataItem } from "../data";

interface JobDrawerProps {
  taskUid: string | null;
  taskName?: string;
  open: boolean;
  onClose: () => void;
}

const jobStatusMap: Record<string, { text: string; color: string }> = {
  success: { text: "成功", color: "green" },
  failed: { text: "失败", color: "red" },
  running: { text: "运行中", color: "blue" },
  pending: { text: "等待中", color: "orange" },
  cancelled: { text: "已取消", color: "default" },
};

/** Job 详情子组件：日志 + 采集数据 */
const JobDetailContent: React.FC<{ jobUid: string }> = ({ jobUid }) => {
  const [logPage, setLogPage] = useState(1);
  const [logLevel, setLogLevel] = useState<string | undefined>();
  const [itemPage, setItemPage] = useState(1);
  const [itemKeyword, setItemKeyword] = useState<string>("");

  const { data: logsRes, isLoading: logsLoading } = useQuery({
    queryKey: ["job-logs", jobUid, logPage, logLevel],
    queryFn: () =>
      jobLogs(jobUid, { page: logPage, pageSize: 50, level: logLevel }),
    enabled: !!jobUid,
  });

  const { data: itemsRes, isLoading: itemsLoading } = useQuery({
    queryKey: ["job-items", jobUid, itemPage, itemKeyword],
    queryFn: () =>
      jobItems(jobUid, { page: itemPage, pageSize: 20, keyword: itemKeyword }),
    enabled: !!jobUid,
  });

  const logColumns = [
    {
      title: "时间",
      dataIndex: "createdAt",
      width: 180,
    },
    {
      title: "级别",
      dataIndex: "level",
      width: 80,
      render: (level: string) => {
        const color =
          level === "ERROR"
            ? "red"
            : level === "WARN"
            ? "orange"
            : level === "INFO"
            ? "blue"
            : "default";
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: "消息",
      dataIndex: "message",
    },
  ];

  const itemColumns = [
    {
      title: "标题",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "作者",
      dataIndex: "author",
      width: 120,
    },
    {
      title: "来源",
      dataIndex: "source",
      width: 120,
    },
    {
      title: "发布时间",
      dataIndex: "publishTime",
      width: 180,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="logs"
      items={[
        {
          key: "logs",
          label: "执行日志",
          children: (
            <>
              <div style={{ marginBottom: 8 }}>
                {["DEBUG", "INFO", "WARN", "ERROR"].map((lv) => (
                  <Tag.CheckableTag
                    key={lv}
                    checked={logLevel === lv}
                    onChange={(checked) => {
                      setLogLevel(checked ? lv : undefined);
                      setLogPage(1);
                    }}
                  >
                    {lv}
                  </Tag.CheckableTag>
                ))}
              </div>
              <Table<JobLogItem>
                size="small"
                rowKey="uid"
                loading={logsLoading}
                columns={logColumns}
                dataSource={logsRes?.data.list || []}
                pagination={false}
                scroll={{ y: 400 }}
              />
              <Pagination
                size="small"
                current={logPage}
                total={logsRes?.data.total || 0}
                pageSize={50}
                onChange={setLogPage}
                style={{ marginTop: 8, textAlign: "right" }}
              />
            </>
          ),
        },
        {
          key: "items",
          label: `采集数据 (${itemsRes?.data.total ?? 0})`,
          children: (
            <>
              <Table<JobDataItem>
                size="small"
                rowKey="uid"
                loading={itemsLoading}
                columns={itemColumns}
                dataSource={itemsRes?.data.list || []}
                pagination={{
                  current: itemPage,
                  total: itemsRes?.data.total || 0,
                  pageSize: 20,
                  onChange: setItemPage,
                  showTotal: (t) => `共 ${t} 条`,
                  size: "small",
                }}
                scroll={{ y: 400 }}
              />
            </>
          ),
        },
      ]}
    />
  );
};

const JobDrawer: React.FC<JobDrawerProps> = ({
  taskUid,
  taskName,
  open,
  onClose,
}) => {
  const actionRef = useRef<ActionType | null>(null);
  const [detailJob, setDetailJob] = useState<JobItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleCancel = async (jobUid: string) => {
    try {
      await jobCancel(jobUid);
      messageApi.success("Job 已取消");
      actionRef.current?.reload();
    } catch (e: any) {
      messageApi.error(e?.message || "取消失败");
    }
  };

  const handleRetry = async (jobUid: string) => {
    try {
      await jobRetry(jobUid);
      messageApi.success("重试已触发");
      actionRef.current?.reload();
    } catch (e: any) {
      messageApi.error(e?.message || "重试失败");
    }
  };

  const columns: ProColumns<JobItem>[] = [
    {
      title: "Job 编号",
      dataIndex: "code",
      width: 220,
      copyable: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      valueType: "select",
      valueEnum: Object.fromEntries(
        Object.entries(jobStatusMap).map(([k, v]) => [k, { text: v.text }])
      ),
      render: (_, record) => {
        const s = jobStatusMap[record.status];
        return s ? <Tag color={s.color}>{s.text}</Tag> : record.status;
      },
    },
    {
      title: "触发类型",
      dataIndex: "triggerType",
      width: 100,
      valueEnum: {
        manual: { text: "手动" },
        schedule: { text: "定时" },
        test: { text: "测试" },
      },
    },
    {
      title: "触发人",
      dataIndex: "triggerBy",
      width: 120,
      copyable: true,
    },
    {
      title: "开始时间",
      dataIndex: "startedAt",
      width: 180,
      valueType: "dateTime",
    },
    {
      title: "耗时",
      dataIndex: "durationMs",
      width: 100,
      renderText: (val: number) => (val ? `${val} ms` : "-"),
    },
    {
      title: "数据量",
      dataIndex: "itemsCount",
      width: 80,
    },
    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      width: 180,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() => {
            setDetailJob(record);
            setDetailOpen(true);
          }}
        >
          查看
        </Button>,
        record.status === "pending" || record.status === "running" ? (
          <Button
            key="cancel"
            type="link"
            size="small"
            danger
            onClick={() => handleCancel(record.uid)}
          >
            取消
          </Button>
        ) : null,
        record.status === "failed" || record.status === "cancelled" ? (
          <Button
            key="retry"
            type="link"
            size="small"
            onClick={() => handleRetry(record.uid)}
          >
            重试
          </Button>
        ) : null,
      ],
    },
  ];

  return (
    <>
      {contextHolder}
      <Drawer
        title={`执行记录 - ${taskName || ""}`}
        size={1100}
        open={open}
        onClose={onClose}
        destroyOnHidden
      >
        <ProTable<JobItem>
          actionRef={actionRef}
          rowKey="uid"
          search={false}
          options={false}
          request={(params) =>
            jobList({ ...params, taskUid: taskUid || undefined })
          }
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Drawer>

      <Drawer
        title={`Job 详情 - ${detailJob?.code || ""}`}
        size={900}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailJob(null);
        }}
        destroyOnHidden
      >
        {detailJob && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="状态">
                {(() => {
                  const s = jobStatusMap[detailJob.status];
                  return s ? (
                    <Tag color={s.color}>{s.text}</Tag>
                  ) : (
                    detailJob.status
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="触发类型">
                {detailJob.triggerType}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {detailJob.startedAt || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {detailJob.finishedAt || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="耗时">
                {detailJob.durationMs ? `${detailJob.durationMs} ms` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="采集数据量">
                {detailJob.itemsCount ?? 0}
              </Descriptions.Item>
              {detailJob.errorMsg && (
                <Descriptions.Item label="错误信息" span={2}>
                  <span style={{ color: "#cf1322" }}>{detailJob.errorMsg}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
            <JobDetailContent jobUid={detailJob.uid} />
          </>
        )}
      </Drawer>
    </>
  );
};

export default JobDrawer;
