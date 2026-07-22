import { DownOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useMutation } from '@tanstack/react-query';
import { Button, Dropdown, Modal, Space, Tag, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import JobDrawer from './components/JobDrawer';
import TaskDetail from './components/TaskDetail';
import UpdateForm from './components/UpdateForm';
import type { TaskItem } from './data.d';
import {
  taskDelete,
  taskList,
  taskToggleStatus,
  taskTrigger,
} from './service';

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '草稿', color: 'default' },
  1: { text: '启用', color: 'success' },
  2: { text: '暂停', color: 'warning' },
};

const runTypeMap: Record<number, string> = {
  0: '定时调度',
  1: '间隔执行',
  2: '手动触发',
};

const TaskManager: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 详情抽屉
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Job 抽屉
  const [jobTaskId, setJobTaskId] = useState<number | null>(null);
  const [jobTaskName, setJobTaskName] = useState<string>('');
  const [jobOpen, setJobOpen] = useState(false);

  const { mutateAsync: toggleRun, isPending: toggleLoading } = useMutation({
    mutationFn: (vars: { id: number; status: number }) =>
      taskToggleStatus(vars.id, vars.status),
    onSuccess: () => {
      messageApi.success('操作成功');
      actionRef.current?.reload();
    },
  });

  const { mutateAsync: triggerRun, isPending: triggerLoading } = useMutation({
    mutationFn: (id: number) => taskTrigger(id),
    onSuccess: (res) => {
      messageApi.success(`任务已触发，Job 编号：${res.data.jobNo}`);
      actionRef.current?.reload();
    },
  });

  const { mutateAsync: deleteRun } = useMutation({
    mutationFn: (id: number) => taskDelete(id),
    onSuccess: () => {
      messageApi.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const columns: ProColumns<TaskItem>[] = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      width: 200,
      copyable: true,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setDetailTaskId(record.id);
            setDetailOpen(true);
          }}
        >
          {record.taskName}
        </Button>
      ),
    },
    {
      title: '编码',
      dataIndex: 'taskCode',
      width: 160,
      copyable: true,
      search: false,
    },
    {
      title: '爬虫',
      dataIndex: 'spiderCode',
      width: 120,
      copyable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: {
        0: { text: '草稿' },
        1: { text: '启用' },
        2: { text: '暂停' },
      },
      render: (_, record) => {
        const s = statusMap[record.status];
        return s ? <Tag color={s.color}>{s.text}</Tag> : record.status;
      },
    },
    {
      title: '调度类型',
      dataIndex: 'runType',
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: { text: '定时调度' },
        1: { text: '间隔执行' },
        2: { text: '手动触发' },
      },
      render: (_, record) => runTypeMap[record.runType] || '-',
    },
    {
      title: '执行次数',
      dataIndex: 'jobCount',
      width: 80,
      search: false,
    },
    {
      title: '成功次数',
      dataIndex: 'successCount',
      width: 80,
      search: false,
      renderText: (val: number) => (
        <span style={{ color: val ? '#3f8600' : undefined }}>{val ?? 0}</span>
      ),
    },
    {
      title: '最后执行',
      dataIndex: 'lastRunTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const toggleBtn =
          record.status === 1 ? (
            <a
              key="pause"
              onClick={async () => {
                await toggleRun({ id: record.id, status: 2 });
              }}
            >
              暂停
            </a>
          ) : (
            <a
              key="enable"
              onClick={async () => {
                await toggleRun({ id: record.id, status: 1 });
              }}
            >
              启用
            </a>
          );

        const moreItems = [
          {
            key: 'trigger',
            label: '手动触发',
            onClick: async () => {
              await triggerRun(record.id);
            },
          },
          {
            key: 'jobs',
            label: '执行记录',
            onClick: () => {
              setJobTaskId(record.id);
              setJobTaskName(record.taskName);
              setJobOpen(true);
            },
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: '删除任务',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除任务「${record.taskName}」吗？此操作不可恢复。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: async () => {
                  await deleteRun(record.id);
                },
              });
            },
          },
        ];

        return (
          <Space>
            <UpdateForm
              key={`edit-${record.id}`}
              values={record}
              onOk={() => actionRef.current?.reload()}
            />
            {toggleBtn}
            <Dropdown menu={{ items: moreItems }}>
              <a onClick={(e) => e.preventDefault()}>
                更多 <DownOutlined />
              </a>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<TaskItem>
        headerTitle="采集任务管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 100 }}
        scroll={{ x: 1400 }}
        request={taskList}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        columns={columns}
        polling={30000}
      />

      {/* 任务详情 */}
      <TaskDetail
        taskId={detailTaskId}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailTaskId(null);
        }}
      />

      {/* Job 执行记录 */}
      <JobDrawer
        taskId={jobTaskId}
        taskName={jobTaskName}
        open={jobOpen}
        onClose={() => {
          setJobOpen(false);
          setJobTaskId(null);
        }}
      />
    </PageContainer>
  );
};

export default TaskManager;
