import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Tag, Space, Button, Typography, Tooltip, Progress } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, ApartmentOutlined, NodeIndexOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { pipelineList } from './service';
import type { PipelineItem } from './data.d';
import { history } from '@umijs/max';

const { Text } = Typography;

const PipelineListPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ProColumns<PipelineItem>[] = [
    {
      title: '流水线名称', dataIndex: 'name', key: 'name', width: 220, copyable: true,
      render: (_, r) => <a style={{ fontWeight: 500 }}>{r.name}</a>,
    },
    { title: '编码', dataIndex: 'code', key: 'code', width: 140, render: (_, r) => <Text code copyable>{r.code}</Text> },
    { title: '版本', dataIndex: 'version', key: 'version', width: 70, render: (_, r) => <Tag color="blue">v{r.version}</Tag> },
    {
      title: '节点数', dataIndex: 'nodeCount', key: 'nodeCount', width: 100,
      render: (_, r) => (
        <Space>
          <NodeIndexOutlined style={{ color: '#1677ff' }} />
          <Text>{r.nodeCount ?? 0} 个节点</Text>
        </Space>
      ),
    },
    {
      title: '关联任务', dataIndex: 'taskCount', key: 'taskCount', width: 90, align: 'center',
      render: (_, r) => <Text strong>{r.taskCount ?? 0}</Text>,
    },
    { title: '描述', dataIndex: 'description', key: 'description', width: 250, ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (_, r) => r.status === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">禁用</Tag>,
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160, valueType: 'dateTime', search: false },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime', search: false },
    {
      title: '操作', key: 'action', width: 180, fixed: 'right', search: false,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          <Button type="link" size="small">设计器</Button>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '流水线管理', ghost: false, breadcrumb: {} }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StatisticCard statistic={{ title: '流水线总数', value: 0, icon: <ApartmentOutlined style={{ color: '#1677ff' }} /> }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: '已启用', value: 0, icon: <Tag color="green" style={{ marginRight: 0 }}>✓</Tag> }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: '总节点数', value: 0 }} />
        </Col>
        <Col span={6}>
          <StatisticCard statistic={{ title: '关联任务', value: 0 }} />
        </Col>
      </Row>

      <ProTable<PipelineItem>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => pipelineList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }}
        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
        toolbar={{
          actions: [
            <Button key="create" type="primary" icon={<PlusOutlined />}>新建流水线</Button>,
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button>,
          ],
        }}
        tableAlertRender={({ selectedRowKeys }) => `已选择 ${selectedRowKeys.length} 项`}
        tableAlertOptionRender={() => <Space><a>批量启用</a><a>批量禁用</a><a style={{ color: '#ff4d4f' }}>批量删除</a></Space>}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </PageContainer>
  );
};

export default PipelineListPage;
