import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Tabs } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { logList } from './service';
import type { LogItem } from './data.d';

const LogTable: React.FC<{ logType: string; title: string }> = ({ logType, title }) => {
  const columns: ProColumns<LogItem>[] = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 170, valueType: 'dateTime' },
    { title: '级别', dataIndex: 'level', key: 'level', width: 80, render: (_, r) => <Tag color={r.level === 'error' ? 'red' : r.level === 'warn' ? 'orange' : r.level === 'info' ? 'blue' : 'default'}>{(r.level as string)?.toUpperCase()}</Tag> },
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: '实体ID', dataIndex: 'entityId', key: 'entityId', width: 100 },
  ];
  return (
    <ProTable<LogItem> rowKey="id" columns={columns}
      request={async (params) => logList(logType, { current: params.current, pageSize: params.pageSize })}
      search={{ labelWidth: 'auto' }}
    />
  );
};

const logTabs = [
  { tab: '任务日志', key: 'job', title: '任务日志' },
  { tab: '爬虫日志', key: 'spider', title: '爬虫日志' },
  { tab: '流水线日志', key: 'pipeline', title: '流水线日志' },
  { tab: 'AI 日志', key: 'ai', title: 'AI 日志' },
  { tab: 'API 日志', key: 'api', title: 'API 日志' },
  { tab: '审计日志', key: 'audit', title: '审计日志' },
  { tab: '错误日志', key: 'error', title: '错误日志' },
];

const LogCenterPage: React.FC = () => {
  const [tab, setTab] = useState('job');
  return (
    <PageContainer header={{ title: '日志中心', ghost: true }} tabList={logTabs.map(t => ({ tab: t.tab, key: t.key }))} onTabChange={(k) => setTab(k)}>
      <LogTable logType={tab} title={logTabs.find(t => t.key === tab)?.title || ''} />
    </PageContainer>
  );
};

export default LogCenterPage;
