import {
  PageContainer,
  ProTable,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  Row,
  Col,
  Tag,
  Space,
  Button,
  Typography,
  Tooltip,
  Popconfirm,
  Modal,
  Form,
  Input,
  App,
} from "antd";
import type { ProColumns, ActionType } from "@ant-design/pro-components";
import {
  PlusOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import React, { useRef, useState } from "react";
import { pipelineList, createPipeline, deletePipeline } from "./service";
import type { PipelineItem } from "./data.d";
import { history } from "@umijs/max";

const { Text } = Typography;

const PipelineListPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { message } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    setCreating(true);
    try {
      await createPipeline(values);
      message.success(`流水线 "${values.name}" 创建成功`);
      setCreateOpen(false);
      createForm.resetFields();
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || "创建失败");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (r: PipelineItem) => {
    try {
      await deletePipeline(r.uid);
      message.success("已删除");
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || "删除失败");
    }
  };

  const columns: ProColumns<PipelineItem>[] = [
    {
      title: "流水线名称",
      dataIndex: "name",
      key: "name",
      width: 100,
      copyable: true,
      render: (_, r) => <a style={{ fontWeight: 500 }}>{r.name}</a>,
    },
    {
      title: "编码",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (_, r) => (
        <Text code copyable>
          {r.code}
        </Text>
      ),
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 70,
      render: (_, r) => <Tag color="blue">v{r.version}</Tag>,
    },
    {
      title: "节点数",
      dataIndex: "nodeCount",
      key: "nodeCount",
      width: 110,
      render: (_, r) => (
        <Space>
          <NodeIndexOutlined style={{ color: "#1677ff" }} />
          <Text>{r.nodeCount ?? 0} 个节点</Text>
        </Space>
      ),
    },
    {
      title: "关联任务",
      dataIndex: "taskCount",
      key: "taskCount",
      width: 90,
      align: "center",
      render: (_, r) => <Text strong>{r.taskCount ?? 0}</Text>,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (_, r) =>
        r.status === 1 ? (
          <Tag color="green">启用</Tag>
        ) : (
          <Tag color="default">禁用</Tag>
        ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      valueType: "dateTime",
      search: false,
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      search: false,
      render: (_, r) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => history.push(`/pipeline/designer?uid=${r.uid}`)}
          >
            设计器
          </Button>
          <Tooltip title="复制新流水线（编码自动加后缀）">
            <Button type="link" size="small">
              复制
            </Button>
          </Tooltip>
          <Popconfirm
            title={`确认删除流水线「${r.name}」？`}
            onConfirm={() => handleDelete(r)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{ title: "流水线管理", ghost: false, breadcrumb: {} }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StatisticCard
            statistic={{
              title: "流水线总数",
              value: 0,
              icon: <ApartmentOutlined style={{ color: "#1677ff" }} />,
            }}
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            statistic={{
              title: "已启用",
              value: 0,
              icon: (
                <Tag color="green" style={{ marginRight: 0 }}>
                  ✓
                </Tag>
              ),
            }}
          />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: "总节点数", value: 0 }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: "关联任务", value: 0 }} />
        </Col>
      </Row>

      <ProTable<PipelineItem>
        actionRef={actionRef}
        rowKey="uid"
        columns={columns}
        request={async (params) =>
          pipelineList({ current: params.current, pageSize: params.pageSize })
        }
        search={{ labelWidth: "auto" }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        toolbar={{
          actions: [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              新建流水线
            </Button>,
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => actionRef.current?.reload()}
            >
              刷新
            </Button>,
          ],
        }}
        tableAlertRender={({ selectedRowKeys }) =>
          `已选择 ${selectedRowKeys.length} 项`
        }
        tableAlertOptionRender={() => (
          <Space>
            <a>批量启用</a>
            <a>批量禁用</a>
            <a style={{ color: "#ff4d4f" }}>批量删除</a>
          </Space>
        )}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />

      <Modal
        title="新建流水线"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        okText="创建"
        cancelText="取消"
        confirmLoading={creating}
        width={480}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            label="流水线名称"
            name="name"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input placeholder="如：新闻采集清洗流水线" />
          </Form.Item>
          <Form.Item
            label="编码"
            name="code"
            rules={[{ required: true, message: "请输入编码" }]}
          >
            <Input
              placeholder="小写字母+下划线，唯一"
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="用途说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PipelineListPage;
