import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';

interface QueueItem { name: string; length: number; consumers: number; rate: number; status: string; }

const MonitorQueuePage: React.FC = () => {
  const cols: ProColumns<QueueItem>[] = [
    { title: '队列名称', dataIndex: 'name', key: 'name' },
    { title: '长度', dataIndex: 'length', key: 'length', width: 100 },
    { title: '消费者', dataIndex: 'consumers', key: 'consumers', width: 80 },
    { title: '处理速率', dataIndex: 'rate', key: 'rate', width: 100, render: (_, r) => `${r.rate}/s` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (_, r) => <Tag color={r.status==='normal'?'green':'red'}>{r.status}</Tag> },
  ];
  return (
    <PageContainer header={{ title: 'Queue 队列监控' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title: '总队列数', value: 5 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '待处理', value: 23, valueStyle: { color: '#faad14' } }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '处理中', value: 3 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '积压', value: 0, valueStyle: { color: '#52c41a' } }} /></Col>
      </Row>
      <ProTable<QueueItem> rowKey="name" columns={cols} search={false}
        dataSource={[{name:'celery.default',length:12,consumers:4,rate:3.2,status:'normal'},
          {name:'celery.spider',length:5,consumers:2,rate:1.8,status:'normal'},
          {name:'celery.pipeline',length:3,consumers:2,rate:2.1,status:'normal'},
          {name:'celery.ai',length:2,consumers:3,rate:1.5,status:'normal'}]} pagination={false} />
    </PageContainer>
  );
};

export default MonitorQueuePage;
