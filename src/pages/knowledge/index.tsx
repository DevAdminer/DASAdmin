import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';
import { kbList } from './service';
import type { KBItem } from './data.d';

const KnowledgeListPage: React.FC = () => {
  const columns: ProColumns<KBItem>[] = [
    { title: '知识库名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code', width: 140, copyable: true },
    { title: '文档数', dataIndex: 'documentCount', key: 'documentCount', width: 80 },
    { title: '向量数', dataIndex: 'vectorCount', key: 'vectorCount', width: 80 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 140, render: () => <Space><a>详情</a><a>RAG配置</a><a>测试</a></Space> },
  ];
  return (
    <PageContainer header={{ title: '知识库管理', ghost: true }}>
      <ProTable<KBItem> rowKey="id" columns={columns}
        request={async (params) => kbList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};
export default KnowledgeListPage;
