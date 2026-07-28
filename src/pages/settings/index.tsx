import { PageContainer } from '@ant-design/pro-components';
import { Card, Form, Input, Button, message, Switch, Space, Tabs, Table, Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React, { useState } from 'react';

// ===== 系统配置 =====
const SystemConfig: React.FC = () => (
  <Card title="系统配置" bordered={false}>
    <Form layout="vertical" onFinish={(v) => message.success('配置已保存')}>
      <Form.Item label="系统名称" name="siteName" initialValue="DataScope AI"><Input /></Form.Item>
      <Form.Item label="API 基础地址" name="apiBaseUrl" initialValue="http://localhost:8000"><Input /></Form.Item>
      <Form.Item label="最大并发任务数" name="maxConcurrentJobs" initialValue={10}><Input type="number" /></Form.Item>
      <Form.Item label="日志保留天数" name="logRetentionDays" initialValue={90}><Input type="number" /></Form.Item>
      <Form.Item><Button type="primary" htmlType="submit">保存配置</Button></Form.Item>
    </Form>
  </Card>
);

// ===== 用户管理 =====
interface UserItem { id: number; name: string; email: string; department: string; status: number; role: string; createdAt: string; }
const UsersPage: React.FC = () => {
  const columns: ProColumns<UserItem>[] = [
    { title: '用户名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v) => <Tag>{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', valueType: 'dateTime' },
    { title: '操作', key: 'action', render: () => <Space><a>编辑</a><a>重置密码</a></Space> },
  ];
  return <Table<UserItem> rowKey="id" columns={columns as any} dataSource={[{ id: 1, name: 'Admin', email: 'admin@example.com', department: '技术部', status: 1, role: '管理员', createdAt: '2026-07-01' }]} pagination={false} />;
};

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState('users');
  return (
    <PageContainer header={{ title: '系统设置', ghost: true }} tabList={[
      { tab: '用户管理', key: 'users' },
      { tab: '角色权限', key: 'roles' },
      { tab: '系统配置', key: 'system' },
      { tab: '通知设置', key: 'notifications' },
    ]} onTabChange={(k) => setTab(k)}>
      {tab === 'users' && <UsersPage />}
      {tab === 'roles' && <Card bordered={false}><div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>角色权限管理 — 开发中</div></Card>}
      {tab === 'system' && <SystemConfig />}
      {tab === 'notifications' && <Card bordered={false}><div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>通知设置 — 开发中</div></Card>}
    </PageContainer>
  );
};

export default SettingsPage;
