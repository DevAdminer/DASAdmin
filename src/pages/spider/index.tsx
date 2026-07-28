import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Tag, Tooltip, Typography, Popconfirm, App, Row, Col, Select, Input } from "antd";
import type { ProColumns, ActionType } from "@ant-design/pro-components";
import { ReloadOutlined, PlusOutlined, BugOutlined, CheckCircleOutlined, PauseCircleOutlined, ThunderboltOutlined, ExportOutlined, SettingOutlined, BarsOutlined } from "@ant-design/icons";
import React, { useRef, useState } from "react";
import SpiderDetail from "./components/SpiderDetail";
import SpiderTest from "./components/SpiderTest";
import CreateForm from "./components/CreateForm";
import { spiderList, spiderToggleStatus, spiderDelete } from "./service";
import type { SpiderItem } from "./data.d";
import { history } from "@umijs/max";

const { Text } = Typography;

const sourceTypeColor: Record<string, string> = { html: "blue", rss: "orange", json_api: "purple", playwright: "cyan", mock: "default", api: "blue", web: "green" };
const sourceTypeLabel: Record<string, string> = { html: "HTML", rss: "RSS", json_api: "JSON API", playwright: "Playwright", mock: "Mock", api: "API", web: "Web" };

const SpiderList: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType | null>(null);
  const [detailCode, setDetailCode] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [testState, setTestState] = useState<{ open: boolean; code: string | null; configFields: any[]; displayName?: string }>({ open: false, code: null, configFields: [], displayName: "" });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSource, setFilterSource] = useState<string>("");

  const { data: stats } = useQuery({
    queryKey: ["spider-stats"],
    queryFn: async () => {
      try {
        const res = await spiderList({ current: 1, pageSize: 1 });
        return { total: res.total, enabled: 0, disabled: 0, today: 0 };
      } catch { return { total: 0, enabled: 0, disabled: 0, today: 0 }; }
    },
    refetchInterval: 60000,
  });

  const handleToggle = async (record: SpiderItem) => {
    try {
      await spiderToggleStatus(record.code, record.status === 1 ? 0 : 1);
      message.success(record.status === 1 ? "已禁用" : "已启用");
      actionRef.current?.reload();
    } catch { message.error("操作失败"); }
  };

  const handleDelete = async (record: SpiderItem) => {
    try {
      await spiderDelete(record.id);
      message.success("已删除");
      actionRef.current?.reload();
    } catch { message.error("删除失败"); }
  };

  const columns: ProColumns<SpiderItem>[] = [
    {
      title: "爬虫名称", dataIndex: "name", key: "name", width: 170,
      render: (_, r) => <a onClick={() => { setDetailCode(r.code); setDetailOpen(true); }} style={{ fontWeight: 500 }}>{r.name}</a>,
    },
    { title: "编码", dataIndex: "code", key: "code", width: 130, render: (_, r) => <Text code copyable>{r.code}</Text> },
    {
      title: "来源类型", dataIndex: "sourceType", key: "sourceType", width: 100,
      render: (_, r) => <Tag color={sourceTypeColor[r.sourceType] || "default"}>{sourceTypeLabel[r.sourceType] || r.sourceType}</Tag>,
    },
    {
      title: "状态", dataIndex: "status", key: "status", width: 80,
      render: (_, r) => r.status === 1 ? <Tag color="green">已启用</Tag> : <Tag color="default">已禁用</Tag>,
    },
    {
      title: "描述", dataIndex: "description", key: "description", width: 220, ellipsis: true,
      render: (_, r) => <Tooltip title={r.description}><span>{r.description || "-"}</span></Tooltip>,
    },
    {
      title: "版本", dataIndex: "version", key: "version", width: 70,
      render: (_, r) => <Tag color="blue">{r.version}</Tag>,
    },
    {
      title: "来源", dataIndex: "isPlugin", key: "isPlugin", width: 70,
      render: (_, r) => r.isPlugin === 1 ? <Tag color="purple">插件</Tag> : <Tag color="gray">自定义</Tag>,
    },
    { title: "关联任务", dataIndex: "taskCount", key: "taskCount", width: 80, align: "center", render: (_, r) => r.taskCount || 0 },
    { title: "执行次数", dataIndex: "jobCount", key: "jobCount", width: 80, align: "center", render: (_, r) => r.jobCount || 0 },
    { title: "采集数据", dataIndex: "totalItems", key: "totalItems", width: 90, align: "center", render: (_, r) => r.totalItems?.toLocaleString() || 0 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 150, valueType: "dateTime", search: false },
    {
      title: "操作", key: "action", width: 220, fixed: "right", search: false,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setDetailCode(r.code); setDetailOpen(true); }}>详情</Button>
          <Button type="link" size="small" onClick={() => setTestState({ open: true, code: r.code, configFields: r.configFields || [], displayName: r.displayName })}>测试</Button>
          <Button type="link" size="small" onClick={() => handleToggle(r)}>{r.status === 1 ? "禁用" : "启用"}</Button>
          {r.isPlugin !== 1 && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r)}>
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: "爬虫管理", ghost: false, breadcrumb: {} }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StatisticCard statistic={{ title: "爬虫总数", value: stats?.total ?? "-", icon: <BugOutlined style={{ color: "#1677ff" }} /> }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: "已启用", value: stats?.enabled ?? "-", icon: <CheckCircleOutlined style={{ color: "#52c41a" }} /> }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: "已禁用", value: stats?.disabled ?? "-", icon: <PauseCircleOutlined style={{ color: "#faad14" }} /> }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: "今日执行", value: stats?.today ?? "-", icon: <ThunderboltOutlined style={{ color: "#13c2c2" }} /> }} />
        </Col>
      </Row>

      <ProTable<SpiderItem>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={spiderList}
        search={false}
        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
        toolbar={{
          title: (
            <Space wrap>
              <Input.Search placeholder="搜索爬虫名称/编码" allowClear style={{ width: 220 }} onSearch={() => actionRef.current?.reload()} />
              <Select placeholder="来源类型" allowClear style={{ width: 120 }} value={filterType || undefined} onChange={(v) => { setFilterType(v || ""); actionRef.current?.reload(); }}>
                <Select.Option value="html">HTML</Select.Option>
                <Select.Option value="rss">RSS</Select.Option>
                <Select.Option value="json_api">JSON API</Select.Option>
                <Select.Option value="playwright">Playwright</Select.Option>
              </Select>
              <Select placeholder="状态" allowClear style={{ width: 100 }} value={filterStatus || undefined} onChange={(v) => { setFilterStatus(v || ""); actionRef.current?.reload(); }}>
                <Select.Option value="1">已启用</Select.Option>
                <Select.Option value="0">已禁用</Select.Option>
              </Select>
              <Select placeholder="来源" allowClear style={{ width: 100 }} value={filterSource || undefined} onChange={(v) => { setFilterSource(v || ""); actionRef.current?.reload(); }}>
                <Select.Option value="1">内置插件</Select.Option>
                <Select.Option value="0">自定义</Select.Option>
              </Select>
            </Space>
          ),
          actions: [
            <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => history.push("/spider/template")}>新建爬虫</Button>,
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
            <Button key="export" icon={<ExportOutlined />} disabled>导出</Button>,
            <Button key="setting" icon={<SettingOutlined />} disabled>列设置</Button>,
          ],
        }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 1500 }}
        tableAlertRender={({ selectedRowKeys }) => `已选择 ${selectedRowKeys.length} 项`}
        tableAlertOptionRender={() => (
          <Space>
            <a>批量启用</a>
            <a>批量禁用</a>
            <a style={{ color: "#ff4d4f" }}>批量删除</a>
          </Space>
        )}
      />

      <SpiderDetail spiderCode={detailCode} open={detailOpen} onClose={() => { setDetailOpen(false); setDetailCode(null); }} />
      <SpiderTest open={testState.open} onClose={() => setTestState({ open: false, code: null, configFields: [], displayName: "" })} spiderCode={testState.code} configFields={testState.configFields} displayName={testState.displayName} />
    </PageContainer>
  );
};

export default SpiderList;
