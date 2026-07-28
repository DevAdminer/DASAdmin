import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Tabs, Space } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { providerList, modelList, promptList } from './service';
import type { AIProviderItem, AIModelItem, AIPromptItem } from './data.d';

const AIProviderPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<AIProviderItem>[] = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code', width: 120, copyable: true },
    { title: '类型', dataIndex: 'providerType', key: 'providerType', width: 100, render: (v) => <Tag color="purple">{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 120, render: () => <Space><a>详情</a><a>测试</a></Space> },
  ];
  return (
    <PageContainer header={{ title: 'AI 供应商管理', ghost: true }}>
      <ProTable<AIProviderItem> actionRef={actionRef} rowKey="id" columns={columns}
        request={async (params) => providerList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};

const AIModelPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<AIModelItem>[] = [
    { title: '模型名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code', width: 140, copyable: true },
    { title: '供应商', dataIndex: 'providerName', key: 'providerName', width: 120 },
    { title: '类型', dataIndex: 'modelType', key: 'modelType', width: 100, render: (v) => <Tag color="cyan">{v}</Tag> },
    { title: '上下文窗口', dataIndex: 'contextWindow', key: 'contextWindow', width: 100 },
    { title: '价格/1K tokens', dataIndex: 'pricePer1k', key: 'pricePer1k', width: 120, render: (v) => v != null ? `$${v}` : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag> },
    { title: '操作', key: 'action', width: 80, render: () => <a>配置</a> },
  ];
  return (
    <PageContainer header={{ title: '模型管理', ghost: true }}>
      <ProTable<AIModelItem> actionRef={actionRef} rowKey="id" columns={columns}
        request={async (params) => modelList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};

const AIPromptPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<AIPromptItem>[] = [
    { title: '提示词名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code', width: 120, copyable: true },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v) => <Tag color="blue">{v}</Tag> },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80, render: (v) => <Tag>v{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 100, render: () => <Space><a>编辑</a><a>预览</a></Space> },
  ];
  return (
    <PageContainer header={{ title: '提示词管理', ghost: true }}>
      <ProTable<AIPromptItem> actionRef={actionRef} rowKey="id" columns={columns}
        request={async (params) => promptList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};

const AICenterPage: React.FC = () => {
  const [tab, setTab] = useState('provider');
  return (
    <PageContainer header={{ title: 'AI 中心', ghost: true }} tabList={[
      { tab: '供应商管理', key: 'provider' },
      { tab: '模型管理', key: 'model' },
      { tab: '提示词管理', key: 'prompt' },
    ]} onTabChange={(k) => setTab(k)}>
      {tab === 'provider' && <AIProviderPage />}
      {tab === 'model' && <AIModelPage />}
      {tab === 'prompt' && <AIPromptPage />}
    </PageContainer>
  );
};

export default AICenterPage;
