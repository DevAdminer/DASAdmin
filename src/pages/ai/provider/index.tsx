import React, { useState } from "react";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Button, Tag, Table, Space, Modal, Form, Input, Select, App, Typography, Popconfirm } from "antd";
import { PlusOutlined, ApiOutlined, DollarOutlined, ThunderboltOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text, Title } = Typography;

interface ProviderData {
  id: number; name: string; status: string; apiKey: string; modelCount: number;
  monthlyTokens: string; monthlyCost: string; avgLatency: string;
}

const AIProviderPage: React.FC = () => {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const dataSource: ProviderData[] = [
    { id:1, name:'OpenAI', status:'正常', apiKey:'sk-***...x9f3', modelCount:5, monthlyTokens:'856K', monthlyCost:'$182', avgLatency:'650ms' },
    { id:2, name:'Anthropic Claude', status:'正常', apiKey:'sk-ant-***', modelCount:3, monthlyTokens:'215K', monthlyCost:'$68', avgLatency:'1.2s' },
    { id:3, name:'通义千问 (DashScope)', status:'正常', apiKey:'sk-***', modelCount:4, monthlyTokens:'89K', monthlyCost:'¥120', avgLatency:'450ms' },
    { id:4, name:'本地 Ollama', status:'正常', apiKey:'http://localhost:11434', modelCount:6, monthlyTokens:'40K', monthlyCost:'$0', avgLatency:'180ms' },
  ];

  const columns: ColumnsType<ProviderData> = [
    { title: '供应商', dataIndex: 'name', key: 'name', render: (v) => <Text strong>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: () => <Tag color="green">正常</Tag> },
    { title: 'API Key', dataIndex: 'apiKey', key: 'apiKey', width: 200, render: (v) => <Text code>{v}</Text> },
    { title: '模型数', dataIndex: 'modelCount', key: 'modelCount', width: 80, align: 'center' },
    { title: '本月 Token', dataIndex: 'monthlyTokens', key: 'monthlyTokens', width: 100 },
    { title: '本月费用', dataIndex: 'monthlyCost', key: 'monthlyCost', width: 100 },
    { title: '平均延迟', dataIndex: 'avgLatency', key: 'avgLatency', width: 80 },
    { title: '操作', key: 'action', width: 120, render: () => <Space><a>编辑</a><Popconfirm title="确定测试连接？"><a>测试</a></Popconfirm></Space> },
  ];

  return (
    <PageContainer header={{ title: 'AI 供应商管理', subTitle: 'OpenAI / Claude / 通义千问 / 本地模型 / API Key 管理' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>添加供应商</Button>]}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title:'已配置供应商', value:4, icon: <ApiOutlined style={{color:'#1677ff'}} /> }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'本月 Token', value:'1.2M', icon: <ThunderboltOutlined style={{color:'#722ed1'}} /> }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'本月费用', value:'$285', icon: <DollarOutlined style={{color:'#fa8c16'}} /> }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'平均延迟', value:'820ms', icon: <CheckCircleOutlined style={{color:'#52c41a'}} /> }} /></Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={dataSource} pagination={false} />

      <Modal title="添加 AI 供应商" open={open} onCancel={() => setOpen(false)} onOk={() => { form.validateFields().then(() => { message.success('添加成功'); setOpen(false); }); }}>
        <Form form={form} layout="vertical">
          <Form.Item label="供应商名称" name="name" rules={[{required:true}]}><Input placeholder="如 OpenAI" /></Form.Item>
          <Form.Item label="类型" name="type" rules={[{required:true}]}><Select><Select.Option value="openai">OpenAI</Select.Option><Select.Option value="anthropic">Anthropic</Select.Option><Select.Option value="qwen">通义千问</Select.Option><Select.Option value="ollama">Ollama(本地)</Select.Option></Select></Form.Item>
          <Form.Item label="API Key" name="apiKey" rules={[{required:true}]}><Input.Password placeholder="sk-..." /></Form.Item>
          <Form.Item label="API Base URL" name="baseUrl"><Input placeholder="https://api.openai.com/v1" /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AIProviderPage;
