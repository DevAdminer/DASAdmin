import { PageContainer, StatisticCard, ProTable } from '@ant-design/pro-components';
import { Row, Col, Tag, Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

// ===== 类型 =====
interface WorkerItem { id: number; name: string; hostname: string; status: string; cpuUsage: number; memoryUsage: number; lastHeartbeatAt: string; }
interface AlertItem { id: number; module: string; level: string; title: string; message: string; status: string; triggeredAt: string; resolvedAt: string; }
interface MonitorStats { totalWorkers: number; onlineWorkers: number; busyWorkers: number; offlineWorkers: number; totalTasks: number; failedTasks: number; systemCpu: number; systemMemory: number; }

const MonitorPage: React.FC = () => {
  const [stats, setStats] = useState<MonitorStats>({ totalWorkers: 4, onlineWorkers: 3, busyWorkers: 1, offlineWorkers: 0, totalTasks: 236, failedTasks: 3, systemCpu: 45, systemMemory: 62 });

  const workerColumns: ProColumns<WorkerItem>[] = [
    { title: 'Worker 名称', dataIndex: 'name', key: 'name' },
    { title: '主机', dataIndex: 'hostname', key: 'hostname', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={v === 'online' ? 'green' : 'red'}>{v === 'online' ? '在线' : '离线'}</Tag> },
    { title: 'CPU', dataIndex: 'cpuUsage', key: 'cpuUsage', width: 80, render: (v) => `${v}%` },
    { title: '内存', dataIndex: 'memoryUsage', key: 'memoryUsage', width: 80, render: (v) => `${v}%` },
    { title: '最后心跳', dataIndex: 'lastHeartbeatAt', key: 'lastHeartbeatAt', width: 160, valueType: 'dateTime' },
  ];

  const alertColumns: ProColumns<AlertItem>[] = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    { title: '级别', dataIndex: 'level', key: 'level', width: 80, render: (v) => <Tag color={v === 'critical' ? 'red' : v === 'warn' ? 'orange' : 'blue'}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color={v === 'active' ? 'red' : 'green'}>{v === 'active' ? '活跃' : '已解决'}</Tag> },
    { title: '触发时间', dataIndex: 'triggeredAt', key: 'triggeredAt', width: 160, valueType: 'dateTime' },
  ];

  return (
    <PageContainer header={{ title: '系统监控', ghost: true }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title: 'Workers', value: `${stats.onlineWorkers}/${stats.totalWorkers}`, suffix: '在线' }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '今日任务', value: stats.totalTasks }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '失败任务', value: stats.failedTasks, valueStyle: { color: stats.failedTasks > 0 ? '#ff4d4f' : '#52c41a' } }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title: '系统 CPU', value: `${stats.systemCpu}%` }} /></Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <ProTable<WorkerItem> rowKey="id" columns={workerColumns} headerTitle="Worker 状态"
            search={false} options={false} pagination={false}
            request={async () => ({ data: [], success: true, total: 0 })} />
        </Col>
        <Col span={12}>
          <ProTable<AlertItem> rowKey="id" columns={alertColumns} headerTitle="告警列表"
            search={false} options={false} pagination={false}
            request={async () => ({ data: [], success: true, total: 0 })} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default MonitorPage;
