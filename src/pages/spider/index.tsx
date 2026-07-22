import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Button, Space, Tag, Tooltip, Typography, message } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import SpiderDetail from './components/SpiderDetail';
import SpiderTest from './components/SpiderTest';
import { spiderList } from './service';
import type { SpiderItem } from './data.d';

const { Text } = Typography;

/** 来源类型颜色映射 */
const sourceTypeColor: Record<string, string> = {
  mock: 'default',
  rss: 'orange',
  api: 'blue',
  web: 'green',
};

const SpiderList: React.FC = () => {
  const [detailCode, setDetailCode] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [testState, setTestState] = useState<{
    open: boolean;
    code: string | null;
    configFields: any[];
    displayName?: string;
  }>({ open: false, code: null, configFields: [], displayName: '' });

  // 使用 react-query 获取数据（不依赖 ProTable 的 request，手动控制）
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['spider-list'],
    queryFn: async () => {
      const res = await spiderList();
      return res;
    },
  });

  const spiders = data || [];

  const handleTest = (record: SpiderItem) => {
    setTestState({
      open: true,
      code: record.code,
      configFields: record.configFields || [],
      displayName: record.displayName,
    });
  };

  const handleDetail = (code: string) => {
    setDetailCode(code);
    setDetailOpen(true);
  };

  const columns: ProColumns<SpiderItem>[] = [
    {
      title: '爬虫名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
      render: (_, r) => (
        <a
          onClick={() => handleDetail(r.code)}
          style={{ fontWeight: 500 }}
        >
          {r.displayName}
        </a>
      ),
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (_, r) => <Text code>{r.code}</Text>,
    },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 100,
      render: (_, r) => (
        <Tag color={sourceTypeColor[r.sourceType] || 'default'}>{r.sourceType}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
      render: (_, r) => (
        <Tooltip title={r.description}>
          <span>{r.description || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (_, r) =>
        r.tags?.length ? (
          r.tags.map((t) => (
            <Tag key={t} color="geekblue">
              {t}
            </Tag>
          ))
        ) : (
          '-'
        ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (_, r) => <Tag color="blue">{r.version}</Tag>,
    },
    {
      title: '关联任务',
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 90,
      align: 'center',
      render: (_, r) => r.taskCount || 0,
    },
    {
      title: '执行次数',
      dataIndex: 'jobCount',
      key: 'jobCount',
      width: 90,
      align: 'center',
      render: (_, r) => r.jobCount || 0,
    },
    {
      title: '采集数据量',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
      align: 'center',
      render: (_, r) => r.totalItems || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      search: false,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleDetail(r.code)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleTest(r)}
          >
            测试
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '爬虫管理',
        breadcrumb: {},
      }}
    >
      <ProTable<SpiderItem>
        rowKey="code"
        columns={columns}
        loading={isLoading}
        dataSource={spiders}
        search={false}
        options={{
          reload: () => refetch(),
          density: false,
          fullScreen: false,
          setting: false,
        }}
        pagination={false}
        scroll={{ x: 1300 }}
      />

      {/* 详情抽屉 */}
      <SpiderDetail
        spiderCode={detailCode}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailCode(null);
        }}
      />

      {/* 测试弹窗 */}
      <SpiderTest
        open={testState.open}
        onClose={() =>
          setTestState({ open: false, code: null, configFields: [], displayName: '' })
        }
        spiderCode={testState.code}
        configFields={testState.configFields}
        displayName={testState.displayName}
      />
    </PageContainer>
  );
};

export default SpiderList;
