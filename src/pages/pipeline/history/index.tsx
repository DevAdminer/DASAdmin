import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Button } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';

const PipelineHistoryPage: React.FC = () => {
  const columns: ProColumns<any>[] = [
    { title: '执行编号', dataIndex: 'code', key: 'code', width: 160 },
    { title: '流水线', dataIndex: 'pipelineName', key: 'pipelineName', width: 180 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v) => <Tag color={v==='success'?'green':v==='failed'?'red':v==='running'?'blue':'default'}>{v}</Tag> },
    { title: '节点数', dataIndex: 'nodeCount', key: 'nodeCount', width: 80 },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 100 },
    { title: '开始时间', dataIndex: 'startAt', key: 'startAt', width: 160, valueType: 'dateTime' },
    { title: '操作', key: 'action', width: 120, render: () => <Space><a>详情</a><a>日志</a></Space> },
  ];
  return (
    <PageContainer header={{ title: 'Pipeline 执行历史' }}>
      <ProTable rowKey="code" columns={columns} search={{ labelWidth: 'auto' }}
        dataSource={[{code:'EXEC-001',pipelineName:'新闻数据处理',status:'success',nodeCount:5,duration:'2.3s',startAt:'2026-07-28 16:10:00'},
          {code:'EXEC-002',pipelineName:'API数据清洗',status:'success',nodeCount:3,duration:'1.1s',startAt:'2026-07-28 16:05:00'},
          {code:'EXEC-003',pipelineName:'新闻数据处理',status:'failed',nodeCount:5,duration:'0.8s',startAt:'2026-07-28 15:30:00'}]}
        pagination={false} />
    </PageContainer>
  );
};

export default PipelineHistoryPage;
