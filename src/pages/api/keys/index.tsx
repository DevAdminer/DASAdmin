import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Button, App, Typography, Input, Modal, Form, Select, DatePicker } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { PlusOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

const { Text } = Typography;

interface APIKeyItem { id: number; name: string; keyPrefix: string; permissions: string; status: number; expiresAt: string; createdAt: string; }

const APIKeysPage: React.FC = () => {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const cols: ProColumns<APIKeyItem>[] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'keyPrefix', key: 'keyPrefix', width: 200, render: (_, r) => <Text code copyable>{r.keyPrefix}****</Text> },
    { title: '权限', dataIndex: 'permissions', key: 'permissions', width: 120, render: (v) => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v===1?<Tag color="green">有效</Tag>:<Tag color="red">失效</Tag> },
    { title: '过期时间', dataIndex: 'expiresAt', key: 'expiresAt', width: 160, valueType: 'dateTime' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 100, render: () => <Space><a>禁用</a><a>删除</a></Space> },
  ];
  return (
    <PageContainer header={{ title: 'API 密钥管理' }} extra={[<Button key="add" type="primary" icon={<PlusOutlined />} onClick={()=>setOpen(true)}>创建密钥</Button>]}>
      <ProTable<APIKeyItem> rowKey="id" columns={cols} search={false}
        dataSource={[{id:1,name:'生产环境',keyPrefix:'sk-prod-',permissions:'全部',status:1,expiresAt:'2027-07-28',createdAt:'2026-07-01'},
          {id:2,name:'测试环境',keyPrefix:'sk-test-',permissions:'只读',status:1,expiresAt:'2026-12-31',createdAt:'2026-07-15'}]} pagination={false} />
      <Modal title="创建 API 密钥" open={open} onCancel={() => { setOpen(false); setGeneratedKey(null); }} footer={generatedKey ? [<Button key="close" onClick={() => { setOpen(false); setGeneratedKey(null); }}>关闭</Button>] : undefined}
        onOk={generatedKey ? undefined : () => { setGeneratedKey('sk-live-' + Math.random().toString(36).slice(2, 34)); message.success('密钥已生成'); }}>
        {generatedKey ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <KeyOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <div style={{ margin: '16px 0', fontSize: 13, color: '#ff4d4f' }}>请立即复制密钥，关闭后将无法查看</div>
            <Input.TextArea value={generatedKey} rows={2} readOnly onClick={e => (e.target as HTMLInputElement).select()} style={{ fontFamily: 'monospace', textAlign: 'center' }} />
            <Button icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(generatedKey); message.success('已复制'); }} style={{ marginTop: 12 }}>复制密钥</Button>
          </div>
        ) : (
          <Form layout="vertical">
            <Form.Item label="名称" required><Input placeholder="生产环境密钥" /></Form.Item>
            <Form.Item label="权限范围"><Select defaultValue="all"><Select.Option value="all">全部权限</Select.Option><Select.Option value="read">只读</Select.Option></Select></Form.Item>
            <Form.Item label="过期时间"><DatePicker style={{ width: '100%' }} /></Form.Item>
          </Form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default APIKeysPage;
