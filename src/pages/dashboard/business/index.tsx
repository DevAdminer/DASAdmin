import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Spin, Timeline, Typography, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  BugOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import React from 'react';
import { dashboardOverview } from './service';
import type { DashboardOverview } from './data.d';

const { Text } = Typography;

const DashboardOverviewPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await dashboardOverview();
      return res.data;
    },
    refetchInterval: 30000,
  });

  const statStyle = { fontSize: 28, fontWeight: 700 };

  return (
    <PageContainer
      header={{
        title: '仪表盘总览',
        ghost: true,
      }}
    >
      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '任务总数',
                value: data?.totalTasks ?? '-',
                icon: <ApartmentOutlined style={{ color: '#1677ff' }} />,
              }}
              chart={null}
              chartPlacement="left"
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '今日执行',
                value: data?.todayJobs ?? '-',
                icon: <ThunderboltOutlined style={{ color: '#52c41a' }} />,
                trend: data?.jobGrowth ? 'up' : undefined,
                suffix: data?.jobGrowth ? `↑ ${data.jobGrowth}%` : undefined,
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '活跃爬虫',
                value: data?.activeSpiders ?? '-',
                icon: <BugOutlined style={{ color: '#13c2c2' }} />,
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '采集数据量',
                value: data?.totalItems?.toLocaleString() ?? '-',
                icon: <BarChartOutlined style={{ color: '#722ed1' }} />,
              }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '执行成功率',
                value: data?.successRate != null ? `${data.successRate}%` : '-',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '失败任务',
                value: data?.failedJobs ?? '-',
                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                trend: (data?.failedJobs ?? 0) > 0 ? 'down' : undefined,
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '运行中 Job',
                value: data?.runningJobs ?? '-',
                icon: <SyncOutlined spin style={{ color: '#faad14' }} />,
              }}
            />
          </Col>
          <Col span={6}>
            <StatisticCard
              statistic={{
                title: '等待中 Job',
                value: data?.pendingJobs ?? '-',
                icon: <ClockCircleOutlined style={{ color: '#8c8c8c' }} />,
              }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={16}>
            <Card title="最近执行记录" bordered>
              <Timeline
                items={(data?.recentJobs ?? []).map((job: any) => ({
                  color: job.status === 'success' ? 'green' : job.status === 'failed' ? 'red' : 'blue',
                  children: (
                    <div>
                      <Text strong>{job.taskName}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {job.time}
                      </Text>
                      <Tag
                        color={job.status === 'success' ? 'green' : job.status === 'failed' ? 'red' : 'blue'}
                        style={{ marginLeft: 8 }}
                      >
                        {job.status === 'success' ? '成功' : job.status === 'failed' ? '失败' : '运行中'}
                      </Tag>
                      {job.itemsCount != null && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          采集 {job.itemsCount} 条 · {job.duration}
                        </Text>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="数据来源分布" bordered>
              {(data?.sourceDistribution ?? []).map((item: any) => (
                <div key={item.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{item.name}</Text>
                    <Text type="secondary">{item.value}</Text>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: '#f0f0f0',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percent}%`,
                        height: '100%',
                        background: item.color || '#1677ff',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  );
};

export default DashboardOverviewPage;
