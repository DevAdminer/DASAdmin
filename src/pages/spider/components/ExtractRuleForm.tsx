import React from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Card, Switch, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export interface ExtractRuleItem {
  field: string;
  selector: string;
  selector_type: 'css' | 'xpath' | 'regex' | 'json';
  attribute?: string;
  transform?: string[];
  default_value?: string;
  required?: boolean;
  description?: string;
}

interface ExtractRuleFormProps {
  value?: ExtractRuleItem[];
  onChange?: (value: ExtractRuleItem[]) => void;
}

const ExtractRuleForm: React.FC<ExtractRuleFormProps> = ({ value = [], onChange }) => {
  const handleChange = (index: number, field: string, val: any) => {
    const newRules = [...(value || [])];
    newRules[index] = { ...newRules[index], [field]: val };
    onChange?.(newRules);
  };

  const addRule = () => {
    const newRule: ExtractRuleItem = {
      field: '',
      selector: '',
      selector_type: 'css',
      transform: [],
      required: false,
    };
    onChange?.([...(value || []), newRule]);
  };

  const removeRule = (index: number) => {
    const newRules = [...(value || [])];
    newRules.splice(index, 1);
    onChange?.(newRules);
  };

  return (
    <div>
      {(value || []).map((rule, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12 }}
          title={`规则 #${index + 1}`}
          extra={
            <Button
              type="link"
              danger
              size="small"
              icon={<MinusCircleOutlined />}
              onClick={() => removeRule(index)}
            />
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Form.Item label="字段名" style={{ marginBottom: 0 }}>
                <Input
                  size="small"
                  style={{ width: 140 }}
                  placeholder="如 title"
                  value={rule.field}
                  onChange={(e) => handleChange(index, 'field', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="选择器类型" style={{ marginBottom: 0 }}>
                <Select
                  size="small"
                  style={{ width: 100 }}
                  value={rule.selector_type}
                  onChange={(val) => handleChange(index, 'selector_type', val)}
                  options={[
                    { label: 'CSS', value: 'css' },
                    { label: 'XPath', value: 'xpath' },
                    { label: 'Regex', value: 'regex' },
                    { label: 'JSON', value: 'json' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="必填" style={{ marginBottom: 0 }}>
                <Switch
                  size="small"
                  checked={rule.required}
                  onChange={(val) => handleChange(index, 'required', val)}
                />
              </Form.Item>
            </Space>
            <Form.Item label="选择器" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="如 .title::text 或 //h1/text()"
                value={rule.selector}
                onChange={(e) => handleChange(index, 'selector', e.target.value)}
              />
            </Form.Item>
            <Space>
              <Form.Item label="属性" style={{ marginBottom: 0 }}>
                <Input
                  size="small"
                  style={{ width: 120 }}
                  placeholder="如 href/src"
                  value={rule.attribute}
                  onChange={(e) => handleChange(index, 'attribute', e.target.value)}
                />
              </Form.Item>
              <Form.Item label="默认值" style={{ marginBottom: 0 }}>
                <Input
                  size="small"
                  style={{ width: 120 }}
                  placeholder="可选"
                  value={rule.default_value}
                  onChange={(e) => handleChange(index, 'default_value', e.target.value)}
                />
              </Form.Item>
            </Space>
            <Form.Item label="说明" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="字段说明"
                value={rule.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
              />
            </Form.Item>
          </Space>
        </Card>
      ))}
      <Button type="dashed" onClick={addRule} style={{ width: '100%' }} icon={<PlusOutlined />}>
        添加提取规则
      </Button>
    </div>
  );
};

export default ExtractRuleForm;