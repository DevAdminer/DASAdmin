import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { articleList, documentList } from './service';
import type { ArticleItem, DocumentItem } from './data.d';

const ArticlesPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<ArticleItem>[] = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 300 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 150 },
    { title: '爬虫', dataIndex: 'spiderName', key: 'spiderName', width: 120 },
    { title: '标签', dataIndex: 'tags', key: 'tags', width: 180, render: (v) => (v as string[])?.map((t) => <Tag key={t}>{t}</Tag>) },
    { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 160, valueType: 'dateTime' },
    { title: '采集时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 80, render: () => <a>详情</a> },
  ];
  return (
    <PageContainer header={{ title: '文章管理', ghost: true }}>
      <ProTable<ArticleItem> actionRef={actionRef} rowKey="id" columns={columns}
        request={async (params) => articleList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};

const DocumentsPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const columns: ProColumns<DocumentItem>[] = [
    { title: '文档名称', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v) => <Tag color="blue">{v}</Tag> },
    { title: '大小', dataIndex: 'fileSize', key: 'fileSize', width: 100, render: (_, r) => r.fileSize ? `${(r.fileSize / 1024).toFixed(1)}KB` : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">正常</Tag> : <Tag>禁用</Tag> },
    { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 100, render: () => <Space><a>预览</a><a>下载</a></Space> },
  ];
  return (
    <PageContainer header={{ title: '文档管理', ghost: true }}>
      <ProTable<DocumentItem> actionRef={actionRef} rowKey="id" columns={columns}
        request={async (params) => documentList({ current: params.current, pageSize: params.pageSize })}
        search={{ labelWidth: 'auto' }} />
    </PageContainer>
  );
};

const DataCenterPage: React.FC = () => {
  const [tab, setTab] = useState('articles');
  return (
    <PageContainer header={{ title: '数据中心', ghost: true }} tabList={[
      { tab: '文章', key: 'articles' },
      { tab: '文档', key: 'documents' },
    ]} onTabChange={(k) => setTab(k)}>
      {tab === 'articles' && <ArticlesPage />}
      {tab === 'documents' && <DocumentsPage />}
    </PageContainer>
  );
};

export default DataCenterPage;
