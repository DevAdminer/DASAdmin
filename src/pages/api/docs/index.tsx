import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Button } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';

interface DocItem { id: number; name: string; description: string; category: string; method: string; }
interface WebhookItem { id: number; name: string; url: string; events: string; status: string; }

const APIDocsPage: React.FC = () => {
  const cols: ProColumns<DocItem>[] = [
    { title: '接口名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v) => <Tag>{v}</Tag> },
    { title: '方法', dataIndex: 'method', key: 'method', width: 80, render: (v) => <Tag color={v==='GET'?'green':v==='POST'?'blue':v==='PUT'?'orange':'red'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 80, render: () => <a>详情</a> },
  ];
  return (
    <PageContainer header={{ title: 'API 文档' }}>
      <ProTable<DocItem> rowKey="id" columns={cols} search={{ labelWidth: 'auto' }}
        dataSource={[{id:1,name:'获取任务列表',description:'分页获取任务列表',category:'Task',method:'GET'},
          {id:2,name:'创建任务',description:'创建新的采集任务',category:'Task',method:'POST'},
          {id:3,name:'获取爬虫列表',description:'获取所有爬虫信息',category:'Spider',method:'GET'},
          {id:4,name:'测试爬虫',description:'测试爬虫运行',category:'Spider',method:'POST'}]} pagination={false} />
    </PageContainer>
  );
};

const WebhooksPage: React.FC = () => {
  const cols: ProColumns<WebhookItem>[] = [
    { title: '名称', dataIndex: 'name', key: 'name' }, { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true, width: 300 },
    { title: '事件', dataIndex: 'events', key: 'events', width: 200, render: (v) => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={v==='active'?'green':'red'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 120, render: () => <Space><a>测试</a><a>编辑</a></Space> },
  ];
  return (
    <PageContainer header={{ title: 'Webhook 管理' }}>
      <ProTable<WebhookItem> rowKey="id" columns={cols} search={false}
        dataSource={[{id:1,name:'任务完成通知',url:'https://example.com/webhook/task',events:'task.completed',status:'active'}]} pagination={false} />
    </PageContainer>
  );
};

const RateLimitPage: React.FC = () => (
  <PageContainer header={{ title: '限流管理' }}>
    <ProTable rowKey="id" search={false}
      columns={[{ title: '规则名称', dataIndex: 'name', key: 'name' }, { title: '限制', dataIndex: 'limit', key: 'limit', width: 200 },
        { title: '窗口', dataIndex: 'window', key: 'window', width: 100 }, { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v:any) => <Tag color={v?'green':'red'}>{v?'启用':'禁用'}</Tag> }]}
      dataSource={[{id:1,name:'API 调用限制',limit:'1000次/小时',window:'1h',status:true},{id:2,name:'IP 限制',limit:'100次/分钟',window:'1m',status:false}]} pagination={false} />
  </PageContainer>
);

export { APIDocsPage, WebhooksPage, RateLimitPage };
