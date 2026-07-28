import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Typography, Card } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';

const { Text } = Typography;

const NODES = [
  { code: 'spider_input', name: 'Spider Input', category: 'input', description: '从 Job 获取原始采集数据' },
  { code: 'cleaner', name: 'Cleaner 清洗', category: 'processor', description: '清洗HTML标签、移除广告、格式化文本' },
  { code: 'dedup', name: 'Deduplicate 去重', category: 'processor', description: '按 URL 或内容哈希去重' },
  { code: 'transformer', name: 'Transformer 转换', category: 'processor', description: '字段映射、类型转换、数据整形' },
  { code: 'filter', name: 'Filter 过滤', category: 'processor', description: '按条件过滤数据' },
  { code: 'sort', name: 'Sort 排序', category: 'processor', description: '按字段排序' },
  { code: 'ai_summary', name: 'AI Summary', category: 'ai', description: '调用 AI 生成摘要' },
  { code: 'ai_embedding', name: 'AI Embedding', category: 'ai', description: '生成文本向量' },
  { code: 'ai_classify', name: 'AI Classification', category: 'ai', description: 'AI 分类标签' },
  { code: 'ai_extract', name: 'AI Extraction', category: 'ai', description: 'AI 实体/关系抽取' },
  { code: 'storage', name: 'Storage 存储', category: 'output', description: '存入 MySQL/PostgreSQL' },
  { code: 'webhook', name: 'Webhook 通知', category: 'output', description: 'HTTP 回调通知' },
  { code: 'export_csv', name: 'Export CSV', category: 'output', description: '导出 CSV 文件' },
];

const catColors: Record<string,string> = { input: 'cyan', processor: 'gold', ai: 'purple', output: 'green' };

const PipelineNodesPage: React.FC = () => {
  const columns: ProColumns<any>[] = [
    { title: '节点名称', dataIndex: 'name', key: 'name', width: 200, render: (_, r) => <Text strong>{r.name}</Text> },
    { title: '编码', dataIndex: 'code', key: 'code', width: 140, render: (_, r) => <Text code>{r.code}</Text> },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (_, r) => <Tag color={(catColors as any)[r.category] || 'default'}>{r.category}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  ];
  return (
    <PageContainer header={{ title: '节点库' }}>
      <ProTable rowKey="code" columns={columns} search={false} dataSource={NODES} pagination={false} />
    </PageContainer>
  );
};

export default PipelineNodesPage;
