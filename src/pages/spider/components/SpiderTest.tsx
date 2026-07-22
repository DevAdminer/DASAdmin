import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { spiderTest } from '../service';
import type { ConfigField, CrawlResultItem, SpiderTestResult } from '../data.d';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SpiderTestProps {
  open: boolean;
  onClose: () => void;
  spiderCode: string | null;
  configFields: ConfigField[];
  displayName?: string;
}

/** 根据 configFields 动态渲染表单项 */
function ConfigForm({
  fields,
  values,
  onChange,
}: {
  fields: ConfigField[];
  values: Record<string, any>;
  onChange: (key: string, val: any) => void;
}) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {fields.map((f) => {
        const label = (
          <span>
            {f.label}
            {f.required && <span style={{ color: '#ff4d4f' }}> *</span>}
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {f.field}
            </Text>
          </span>
        );

        if (f.type === 'number') {
          return (
            <div key={f.field}>
              <div style={{ marginBottom: 4 }}>{label}</div>
              <InputNumber
                style={{ width: '100%' }}
                placeholder={f.placeholder}
                value={values[f.field] ?? f.default}
                onChange={(v) => onChange(f.field, v)}
              />
            </div>
          );
        }

        if (f.type === 'select') {
          return (
            <div key={f.field}>
              <div style={{ marginBottom: 4 }}>{label}</div>
              <Select
                style={{ width: '100%' }}
                placeholder={f.placeholder}
                value={values[f.field] ?? f.default}
                onChange={(v) => onChange(f.field, v)}
                options={(f.options || []).map((o) => ({ label: o, value: o }))}
              />
            </div>
          );
        }

        if (f.type === 'json') {
          return (
            <div key={f.field}>
              <div style={{ marginBottom: 4 }}>{label}</div>
              <TextArea
                rows={3}
                placeholder={f.placeholder || 'JSON 格式'}
                value={values[f.field] ?? (f.default ? JSON.stringify(f.default, null, 2) : '')}
                onChange={(e) => onChange(f.field, e.target.value)}
              />
            </div>
          );
        }

        // default: string
        return (
          <div key={f.field}>
            <div style={{ marginBottom: 4 }}>{label}</div>
            <Input
              placeholder={f.placeholder}
              value={values[f.field] ?? f.default ?? ''}
              onChange={(e) => onChange(f.field, e.target.value)}
            />
          </div>
        );
      })}
    </Space>
  );
}

const SpiderTest: React.FC<SpiderTestProps> = ({
  open,
  onClose,
  spiderCode,
  configFields,
  displayName,
}) => {
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [limit, setLimit] = useState(5);

  // 打开时重置配置
  useEffect(() => {
    if (open) {
      const defaults: Record<string, any> = {};
      configFields.forEach((f) => {
        if (f.default !== undefined) defaults[f.field] = f.default;
      });
      setConfigValues(defaults);
    }
  }, [open, spiderCode]);

  const mutation = useMutation({
    mutationFn: () => {
      // 处理 JSON 类型字段
      const processed: Record<string, any> = {};
      configFields.forEach((f) => {
        const raw = configValues[f.field];
        if (raw === undefined || raw === '') return;
        if (f.type === 'json' && typeof raw === 'string') {
          try {
            processed[f.field] = JSON.parse(raw);
          } catch {
            processed[f.field] = raw; // 保留原始字符串
          }
        } else {
          processed[f.field] = raw;
        }
      });
      return spiderTest(spiderCode!, processed, limit);
    },
  });

  const result = mutation.data?.data as SpiderTestResult | undefined;

  const handleConfigChange = (key: string, val: any) => {
    setConfigValues((prev) => ({ ...prev, [key]: val }));
  };

  const crawlColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) =>
        tags?.length ? (
          tags.map((t) => (
            <Tag key={t} color="geekblue">
              {t}
            </Tag>
          ))
        ) : (
          '-'
        ),
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            查看
          </a>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Modal
      title={`测试爬取 - ${displayName || spiderCode}`}
      open={open}
      onCancel={() => {
        mutation.reset();
        onClose();
      }}
      width={900}
      footer={[
        <Button
          key="close"
          onClick={() => {
            mutation.reset();
            onClose();
          }}
        >
          关闭
        </Button>,
        <Button
          key="test"
          type="primary"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          执行测试
        </Button>,
      ]}
    >
      {/* 配置表单 */}
      {configFields.length > 0 ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text strong>爬虫配置参数</Text>
          </div>
          <ConfigForm
            fields={configFields}
            values={configValues}
            onChange={handleConfigChange}
          />
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <Space>
              <Text>返回数据条数上限：</Text>
              <InputNumber
                min={1}
                max={20}
                value={limit}
                onChange={(v) => setLimit(v || 5)}
              />
            </Space>
          </div>
        </>
      ) : (
        <Alert
          type="info"
          message="此爬虫无需配置参数"
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 执行结果 */}
      {mutation.isPending && <Spin tip="正在执行测试爬取..." />}

      {result && (
        <div style={{ marginTop: 16 }}>
          {result.error ? (
            <Alert
              type="error"
              message="测试失败"
              description={result.error}
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              type="success"
              message={`测试成功：采集到 ${result.itemsCount} 条数据，耗时 ${result.durationMs} ms`}
              style={{ marginBottom: 16 }}
            />
          )}

          {result.items?.length > 0 ? (
            <Table
              size="small"
              rowKey={(r, i) => `${r.url}-${i}`}
              pagination={{ pageSize: 5 }}
              dataSource={result.items}
              columns={crawlColumns}
              expandable={{
                expandedRowRender: (record: CrawlResultItem) => (
                  <div>
                    <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                      <Text strong>内容：</Text>
                      {record.content}
                    </Paragraph>
                    {record.extra &&
                      Object.keys(record.extra).length > 0 && (
                        <Paragraph style={{ marginBottom: 0 }}>
                          <Text strong>扩展信息：</Text>
                          <code>{JSON.stringify(record.extra)}</code>
                        </Paragraph>
                      )}
                  </div>
                ),
              }}
            />
          ) : (
            !result.error && <Empty description="未采集到数据" />
          )}
        </div>
      )}
    </Modal>
  );
};

export default SpiderTest;
