import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Tag, Space, Badge, Progress } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';

interface WorkerItem { id: number; name: string; hostname: string; status: string; cpu: number; memory: number; currentJob: string; heartbeat: string; }
interface QueueItem { name: string; length: number; consumers: number; rate: number; status: string; }

const MonitorWorkerPage: React.FC = () => {
  const workerColumns: ProColumns<WorkerItem>[] = [
    { title: 'Worker', dataIndex: 'name', key: 'name', width: 150 },
    { title: '主机', dataIndex: 'hostname', key: 'hostname', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Badge status={v==='online'?'success':'error'} text={v==='online'?'在线':'离线'} /> },
    { title: 'CPU', dataIndex: 'cpu', key: 'cpu', width: 120, render: (_, r) => <Progress percent={r.cpu as number} size="small" status={r.cpu>80?'exception':undefined} /> },
    { title: '内存', dataIndex: 'memory', key: 'memory', width: 120, render: (_, r) => <Progress percent={r.memory as number} size="small" status={r.memory>80?'exception':undefined} /> },
    { title: '当前任务', dataIndex: 'currentJob', key: 'currentJob', width: 200, ellipsis: true },
    { title: '心跳', dataIndex: 'heartbeat', key: 'heartbeat', width: 140, valueType: 'dateTime' },
  ];
  return (
    <PageContainer header={{ title: 'Workers 监控' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title: 'Worker 总数', value: 4 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '在线', value: 3, valueStyle: { color: '#52c41a' } }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '忙绿', value: 1, valueStyle: { color: '#faad14' } }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '离线', value: 0 }} /></Col>
      </Row>
      <ProTable<WorkerItem> rowKey="id" columns={workerColumns} search={false}
        dataSource={[{id:1,name:'worker-01',hostname:'node1',status:'online',cpu:45,memory:62,currentJob:'新浪财经采集',heartbeat:'2026-07-28 16:15:00'},
          {id:2,name:'worker-02',hostname:'node1',status:'online',cpu:32,memory:48,currentJob:'API数据采集',heartbeat:'2026-07-28 16:15:01'},
          {id:3,name:'worker-03',hostname:'node2',status:'online',cpu:78,memory:85,currentJob:'网页快照',heartbeat:'2026-07-28 16:14:58'},
          {id:4,name:'worker-04',hostname:'node2',status:'online',cpu:18,memory:35,currentJob:'-',heartbeat:'2026-07-28 16:15:02'}]}
        pagination={false} />
    </PageContainer>
  );
};

const MonitorQueuePage: React.FC = () => {
  const queueColumns: ProColumns<QueueItem>[] = [
    { title: '队列名称', dataIndex: 'name', key: 'name' },
    { title: '长度', dataIndex: 'length', key: 'length', width: 100 },
    { title: '消费者', dataIndex: 'consumers', key: 'consumers', width: 80 },
    { title: '处理速率', dataIndex: 'rate', key: 'rate', width: 100, render: (v) => `${v}/s` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={v==='normal'?'green':'red'}>{v}</Tag> },
  ];
  return (
    <PageContainer header={{ title: 'Queue 队列监控' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title: '总队列数', value: 5 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '待处理', value: 23, valueStyle: { color: '#faad14' } }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '处理中', value: 3 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '积压', value: 0, valueStyle: { color: '#52c41a' } }} /></Col>
      </Row>
      <ProTable<QueueItem> rowKey="name" columns={queueColumns} search={false}
        dataSource={[{name:'celery.default',length:12,consumers:4,rate:3.2,status:'normal'},
          {name:'celery.spider',length:5,consumers:2,rate:1.8,status:'normal'},
          {name:'celery.pipeline',length:3,consumers:2,rate:2.1,status:'normal'},
          {name:'celery.ai',length:2,consumers:3,rate:1.5,status:'normal'},
          {name:'celery.high',length:1,consumers:1,rate:0.8,status:'normal'}]}
        pagination={false} />
    </PageContainer>
  );
};

export default MonitorWorkerPage;
export { MonitorQueuePage };
