import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Tag, Space, Button, Popconfirm, App, Progress, Typography, Tabs, Card, Tooltip } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ReloadOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { proxyList, proxyCheck, proxyDelete, proxyStats, proxyBatchCheck } from './service';
import type { ProxyItem } from './data.d';

const { Text } = Typography;

const protocolColor: Record<string, string> = { http: 'blue', https: 'orange', socks5: 'cyan' };

// ===== 代理池 =====
const ProxyPoolTab: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType | null>(null);
  const { data: stats } = useQuery({ queryKey: ['proxy-stats'], queryFn: async () => { const r = await proxyStats(); return r.data; }, refetchInterval: 60000 });

  const columns: ProColumns<ProxyItem>[] = [
    { title: 'IP:Port', dataIndex: 'host', key: 'host', width: 200, render: (_, r) => <Text code>{r.host}:{r.port}</Text> },
    { title: '协议', dataIndex: 'protocol', key: 'protocol', width: 80, render: (_, r) => <Tag color={(protocolColor as any)[r.protocol] || 'default'}>{(r.protocol as string)?.toUpperCase()}</Tag> },
    { title: '地域', dataIndex: 'region', key: 'region', width: 100 },
    { title: '响应时间', dataIndex: 'responseTimeMs', key: 'responseTimeMs', width: 140,
      render: (_, r) => { const v = r.responseTimeMs; return (<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress percent={Math.min(((v ?? 0) / 1000) * 100, 100)} size="small" showInfo={false} strokeColor={(v ?? 0) < 500 ? '#52c41a' : (v ?? 0) < 1000 ? '#faad14' : '#ff4d4f'} style={{ width: 80 }} />
        <Text style={{ fontSize: 12 }}>{v}ms</Text></div>);
    }},
    { title: '成功率', dataIndex: 'successRate', key: 'successRate', width: 90, render: (_, r) => <Text style={{ color: (r.successRate ?? 0) >= 90 ? '#52c41a' : '#ff4d4f' }}>{r.successRate}%</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">健康</Tag> : <Tag color="red">异常</Tag> },
    { title: '使用次数', dataIndex: 'useCount', key: 'useCount', width: 80 },
    { title: '策略', dataIndex: 'rotationStrategy', key: 'rotationStrategy', width: 80, render: (v) => <Tag>{v}</Tag> },
    { title: '最后检测', dataIndex: 'lastCheckAt', key: 'lastCheckAt', width: 140, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 180, fixed: 'right', render: (_, r) => (
        <Space><Button type="link" size="small" onClick={async () => { await proxyCheck(r.id); message.success('检测完成'); actionRef.current?.reload(); }}>检测</Button>
        <Popconfirm title="确定删除？" onConfirm={async () => { await proxyDelete(r.id); message.success('已删除'); actionRef.current?.reload(); }}><Button type="link" size="small" danger>删除</Button></Popconfirm></Space>)},
  ];

  return (<>
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={4}><StatisticCard statistic={{ title: '代理总数', value: stats?.total ?? '-' }} /></Col>
      <Col span={4}><StatisticCard statistic={{ title: '健康', value: stats?.healthy ?? '-', valueStyle: { color: '#52c41a' } }} /></Col>
      <Col span={4}><StatisticCard statistic={{ title: '异常', value: stats?.unhealthy ?? '-', valueStyle: { color: '#ff4d4f' } }} /></Col>
      <Col span={4}><StatisticCard statistic={{ title: '可用率', value: stats?.availableRate != null ? `${stats.availableRate}%` : '-' }} /></Col>
      <Col span={4}><StatisticCard statistic={{ title: '平均响应', value: stats?.avgResponse != null ? `${stats.avgResponse}ms` : '-' }} /></Col>
    </Row>
    <ProTable<ProxyItem> actionRef={actionRef} rowKey="id" columns={columns} search={false}
      request={async (params) => proxyList({ current: params.current, pageSize: params.pageSize })}
      toolbar={{ actions: [ <Button type="primary" key="add" icon={<PlusOutlined />}>添加代理</Button>,
        <Button key="batchCheck" icon={<CheckOutlined />} onClick={async () => { await proxyBatchCheck(); message.success('批量检测已提交'); actionRef.current?.reload(); }}>一键检测</Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>刷新</Button> ] }} />
  </>);
};

// ===== Cookie 池 =====
const CookiePoolTab: React.FC = () => (
  <Card title="Cookie 池" bordered={false}>
    <ProTable rowKey="id" search={false}
      columns={[
        { title: 'Cookie名称', dataIndex: 'name', key: 'name', width: 200 },
        { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
        { title: '域名', dataIndex: 'domain', key: 'domain', width: 200 },
        { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">有效</Tag> : <Tag color="red">过期</Tag> },
        { title: '过期时间', dataIndex: 'expireAt', key: 'expireAt', width: 160, valueType: 'dateTime' },
        { title: '自动刷新', dataIndex: 'autoRefresh', key: 'autoRefresh', width: 80, render: (v) => v === 1 ? <Tag color="blue">是</Tag> : <Tag>否</Tag> },
        { title: '操作', key: 'action', width: 120, render: () => <Space><a>检测</a><a>编辑</a></Space> },
      ]}
      request={async () => ({ data: [], success: true, total: 0 })}
    />
  </Card>
);

// ===== 请求头池 =====
const HeadersPoolTab: React.FC = () => (
  <Card title="请求头池" bordered={false}>
    <ProTable rowKey="id" search={false}
      columns={[
        { title: 'Headers名称', dataIndex: 'name', key: 'name', width: 200 },
        { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
        { title: '绑定域名', dataIndex: 'domain', key: 'domain', width: 200 },
        { title: '轮换', dataIndex: 'rotate', key: 'rotate', width: 80, render: (v) => v ? <Tag color="green">启用</Tag> : <Tag>关闭</Tag> },
        { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag> },
        { title: '操作', key: 'action', width: 80, render: () => <a>编辑</a> },
      ]}
      request={async () => ({ data: [], success: true, total: 0 })}
    />
  </Card>
);

// ===== UA 池 =====
const UAPoolTab: React.FC = () => (
  <Card title="UserAgent 池" bordered={false}>
    <ProTable rowKey="id" search={false}
      columns={[
        { title: 'UserAgent', dataIndex: 'uaString', key: 'uaString', ellipsis: true, width: 400 },
        { title: '浏览器', dataIndex: 'browser', key: 'browser', width: 100, render: (v) => <Tag color="blue">{v}</Tag> },
        { title: '类别', dataIndex: 'category', key: 'category', width: 80, render: (v) => <Tag>{v}</Tag> },
        { title: '使用次数', dataIndex: 'useCount', key: 'useCount', width: 80 },
        { title: '操作', key: 'action', width: 80, render: () => <a>删除</a> },
      ]}
      request={async () => ({ data: [], success: true, total: 0 })}
    />
  </Card>
);

// ===== 凭证管理 =====
const CredentialTab: React.FC = () => (
  <Card title="凭证管理" bordered={false} extra={<Tooltip title="API Key/Token/密码等凭证加密存储"><Text type="secondary">🔒 加密存储</Text></Tooltip>}>
    <ProTable rowKey="id" search={false}
      columns={[
        { title: '凭证名称', dataIndex: 'name', key: 'name', width: 200 },
        { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
        { title: '类型', dataIndex: 'credentialType', key: 'credentialType', width: 100, render: (v) => <Tag color="purple">{v}</Tag> },
        { title: '关联域名', dataIndex: 'domain', key: 'domain', width: 200 },
        { title: '过期时间', dataIndex: 'expireAt', key: 'expireAt', width: 160, valueType: 'dateTime' },
        { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">有效</Tag> : <Tag color="red">过期</Tag> },
        { title: '操作', key: 'action', width: 80, render: () => <a>查看</a> },
      ]}
      request={async () => ({ data: [], success: true, total: 0 })}
    />
  </Card>
);

// ===== 主页面 =====
const ResourcePoolPage: React.FC = () => {
  const [tab, setTab] = useState('proxy');
  return (
    <PageContainer header={{ title: '资源池管理', ghost: true }} tabList={[
      { tab: '代理池', key: 'proxy' }, { tab: 'Cookie 池', key: 'cookie' },
      { tab: '请求头池', key: 'headers' }, { tab: 'UA 池', key: 'ua' },
      { tab: '凭证管理', key: 'credential' },
    ]} onTabChange={(k) => setTab(k)}>
      {tab === 'proxy' && <ProxyPoolTab />}
      {tab === 'cookie' && <CookiePoolTab />}
      {tab === 'headers' && <HeadersPoolTab />}
      {tab === 'ua' && <UAPoolTab />}
      {tab === 'credential' && <CredentialTab />}
    </PageContainer>
  );
};

export default ResourcePoolPage;
