import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface ModelData {
  id: number; name: string; provider: string; type: string; context: string;
  inputPrice: string; outputPrice: string; rateLimit: string; status: string;
}

const tokenData = [
  { label: 'gpt-4o-mini', value: 560, color: '#1677ff' },
  { label: 'claude-3-haiku', value: 215, color: '#722ed1' },
  { label: 'qwen-max', value: 89, color: '#fa8c16' },
  { label: 'gpt-4o', value: 120, color: '#13c2c2' },
  { label: 'embedding', value: 40, color: '#52c41a' },
];
const maxToken = Math.max(...tokenData.map(t => t.value));

const AIModelPage: React.FC = () => {
  const dataSource: ModelData[] = [
    { id:1, name:'gpt-4o', provider:'OpenAI', type:'多模态', context:'128K', inputPrice:'$5/M', outputPrice:'$15/M', rateLimit:'60/min', status:'启用' },
    { id:2, name:'gpt-4o-mini', provider:'OpenAI', type:'文本', context:'128K', inputPrice:'$0.15/M', outputPrice:'$0.6/M', rateLimit:'500/min', status:'启用' },
    { id:3, name:'gpt-3.5-turbo', provider:'OpenAI', type:'文本', context:'16K', inputPrice:'$0.5/M', outputPrice:'$1.5/M', rateLimit:'3500/min', status:'禁用' },
    { id:4, name:'claude-3.5-sonnet', provider:'Anthropic', type:'文本', context:'200K', inputPrice:'$3/M', outputPrice:'$15/M', rateLimit:'50/min', status:'启用' },
    { id:5, name:'claude-3-haiku', provider:'Anthropic', type:'文本', context:'200K', inputPrice:'$0.25/M', outputPrice:'$1.25/M', rateLimit:'200/min', status:'启用' },
    { id:6, name:'qwen-max', provider:'通义千问', type:'文本', context:'32K', inputPrice:'¥0.04/K', outputPrice:'¥0.12/K', rateLimit:'300/min', status:'启用' },
    { id:7, name:'llama3.1:70b', provider:'Ollama(本地)', type:'文本', context:'128K', inputPrice:'$0', outputPrice:'$0', rateLimit:'-', status:'启用' },
    { id:8, name:'text-embedding-3', provider:'OpenAI', type:'Embedding', context:'8K', inputPrice:'-', outputPrice:'$0.1/M', rateLimit:'3000/min', status:'启用' },
  ];

  const columns: ColumnsType<ModelData> = [
    { title: '模型', dataIndex: 'name', key: 'name', render: (v) => <Text strong>{v}</Text> },
    { title: '供应商', dataIndex: 'provider', key: 'provider', width: 120 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v) => <Tag color={v==='Embedding'?'purple':'blue'}>{v}</Tag> },
    { title: '上下文', dataIndex: 'context', key: 'context', width: 70 },
    { title: '输入价格', dataIndex: 'inputPrice', key: 'inputPrice', width: 90 },
    { title: '输出价格', dataIndex: 'outputPrice', key: 'outputPrice', width: 90 },
    { title: '限流', dataIndex: 'rateLimit', key: 'rateLimit', width: 90 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (v) => <Tag color={v==='启用'?'green':'default'}>{v}</Tag> },
    { title: '操作', key: 'action', width: 60, render: () => <a>配置</a> },
  ];

  return (
    <PageContainer header={{ title: '模型管理', subTitle: '模型列表 / 参数配置 / 限流 / 成本统计' }}>
      <Table rowKey="id" columns={columns} dataSource={dataSource} pagination={false} size="middle" />
      <Card title="本月 Token 消耗" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, padding: '20px 0' }}>
          {tokenData.map(t => (
            <div key={t.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(t.value / maxToken) * 160}px`,
                background: `linear-gradient(to top, ${t.color}, ${t.color}88)`,
                borderRadius: '4px 4px 0 0',
                minHeight: 4,
                transition: 'height 0.3s',
              }} />
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8, whiteSpace: 'nowrap' }}>{t.label}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.color }}>{t.value}K</div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
};

export default AIModelPage;
