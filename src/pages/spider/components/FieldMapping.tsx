import React, { useState } from 'react';
import { Table, Button, Select, Input, Switch, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

export interface FieldMappingItem {
  key: string;
  source_field: string;
  target_field: string;
  field_type: string;
  transformer: string;
  default_value: string;
  required: boolean;
  description: string;
}

interface FieldMappingProps {
  value?: FieldMappingItem[];
  onChange?: (value: FieldMappingItem[]) => void;
  readonly?: boolean;
}

const FIELD_TYPES = ['string', 'text', 'number', 'datetime', 'boolean', 'array', 'object'];
const TRANSFORMERS = ['strip()', 'url_join()', 'clean_html()', 'parse_date()', 'lower()', 'upper()', 'replace()', 'json_loads()'];

const FieldMapping: React.FC<FieldMappingProps> = ({ value = [], onChange, readonly = false }) => {
  const [data, setData] = useState<FieldMappingItem[]>(value.length > 0 ? value : []);

  const updateData = (newData: FieldMappingItem[]) => {
    setData(newData);
    onChange?.(newData);
  };

  const addRow = () => {
    const newItem: FieldMappingItem = {
      key: Date.now().toString(),
      source_field: '',
      target_field: '',
      field_type: 'string',
      transformer: '',
      default_value: '',
      required: false,
      description: '',
    };
    updateData([...data, newItem]);
  };

  const deleteRow = (key: string) => {
    updateData(data.filter((item) => item.key !== key));
  };

  const updateField = (key: string, field: keyof FieldMappingItem, val: any) => {
    updateData(data.map((item) => (item.key === key ? { ...item, [field]: val } : item)));
  };

  const columns = [
    {
      title: '源字段',
      dataIndex: 'source_field',
      key: 'source_field',
      width: 140,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.source_field}</span>
        ) : (
          <Input
            size="small"
            placeholder="如 title"
            value={record.source_field}
            onChange={(e) => updateField(record.key, 'source_field', e.target.value)}
          />
        ),
    },
    {
      title: '映射目标',
      dataIndex: 'target_field',
      key: 'target_field',
      width: 160,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.target_field}</span>
        ) : (
          <Input
            size="small"
            placeholder="如 article.title"
            value={record.target_field}
            onChange={(e) => updateField(record.key, 'target_field', e.target.value)}
          />
        ),
    },
    {
      title: '类型',
      dataIndex: 'field_type',
      key: 'field_type',
      width: 100,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.field_type}</span>
        ) : (
          <Select
            size="small"
            style={{ width: '100%' }}
            value={record.field_type}
            onChange={(val) => updateField(record.key, 'field_type', val)}
            options={FIELD_TYPES.map((t) => ({ label: t, value: t }))}
          />
        ),
    },
    {
      title: '处理',
      dataIndex: 'transformer',
      key: 'transformer',
      width: 140,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.transformer}</span>
        ) : (
          <Select
            size="small"
            style={{ width: '100%' }}
            value={record.transformer || undefined}
            placeholder="选择处理函数"
            allowClear
            onChange={(val) => updateField(record.key, 'transformer', val || '')}
            options={TRANSFORMERS.map((t) => ({ label: t, value: t }))}
          />
        ),
    },
    {
      title: '默认值',
      dataIndex: 'default_value',
      key: 'default_value',
      width: 120,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.default_value}</span>
        ) : (
          <Input
            size="small"
            placeholder="可选"
            value={record.default_value}
            onChange={(e) => updateField(record.key, 'default_value', e.target.value)}
          />
        ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 60,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.required ? '是' : '否'}</span>
        ) : (
          <Switch
            size="small"
            checked={record.required}
            onChange={(val) => updateField(record.key, 'required', val)}
          />
        ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      width: 140,
      render: (_: any, record: FieldMappingItem) =>
        readonly ? (
          <span>{record.description}</span>
        ) : (
          <Input
            size="small"
            placeholder="说明"
            value={record.description}
            onChange={(e) => updateField(record.key, 'description', e.target.value)}
          />
        ),
    },
    ...(!readonly
      ? [
          {
            title: '操作',
            key: 'action',
            width: 50,
            render: (_: any, record: FieldMappingItem) => (
              <Popconfirm title="确认删除?" onConfirm={() => deleteRow(record.key)}>
                <Button type="link" danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
      />
      {!readonly && (
        <Button
          type="dashed"
          onClick={addRow}
          style={{ width: '100%', marginTop: 8 }}
          icon={<PlusOutlined />}
        >
          添加映射
        </Button>
      )}
    </div>
  );
};

export default FieldMapping;