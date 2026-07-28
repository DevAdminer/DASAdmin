import React from "react";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Button, Tag, Table, Space, Card, Typography } from "antd";
import { PlusOutlined, ExperimentOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AIPromptPage: React.FC = () => {
  const versionColumns = [
    { title: '版本', dataIndex: 'version', key: 'version', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    { title: '修改人', dataIndex: 'author', key: 'author' },
    { title: '说明', dataIndex: 'note', key: 'note' },
    { title: '操作', key: 'action', render: (_: any, r: any) => r.version === 'v3' ? <Tag color="green">当前使用</Tag> : <a>切换</a> },
  ];

  const abColumns = [
    { title: '测试名称', dataIndex: 'name', key: 'name' },
    { title: 'Prompt A', dataIndex: 'a', key: 'a' },
    { title: 'Prompt B', dataIndex: 'b', key: 'b' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v==='运行中'?'gold':'green'}>{v}</Tag> },
    { title: '样本量', dataIndex: 'samples', key: 'samples' },
    { title: 'A 胜率', dataIndex: 'aRate', key: 'aRate' },
    { title: '结论', dataIndex: 'result', key: 'result', render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: '操作', key: 'action', render: () => <a>详情</a> },
  ];

  return (
    <PageContainer header={{ title: '提示词管理', subTitle: '模板 / 变量 / 版本 / A/B 测试' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>新建 Prompt</Button>]}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><StatisticCard statistic={{ title:'总 Prompt', value:28 }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'启用中', value:24, valueStyle:{color:'#52c41a'} }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'A/B 测试中', value:3, valueStyle:{color:'#fa8c16'} }} /></Col>
        <Col span={6}><StatisticCard statistic={{ title:'平均使用', value:'5.2k', valueStyle:{color:'#722ed1'} }} /></Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={<Space><span>📝 新闻标签提取 Prompt</span><Tag color="blue">v3</Tag></Space>} style={{ height: '100%' }}>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 12, lineHeight: 1.8, minHeight: 200, overflow: 'auto' }}>
              <span style={{ color: '#6a9955' }}># System</span>{'\n'}
              你是一个新闻标签提取专家。根据新闻内容，{'\n'}
              提取 3-5 个最相关的标签。{'\n\n'}
              <span style={{ color: '#6a9955' }}># User</span>{'\n'}
              标题: {'{{title}}'}{'\n'}
              摘要: {'{{summary}}'}{'\n\n'}
              请输出 JSON 格式的标签列表。{'\n\n'}
              <span style={{ color: '#6a9955' }}># 变量</span>{'\n'}
              - {'{{title}}'}: 文章标题 (required){'\n'}
              - {'{{summary}}'}: 文章摘要 (required)
            </pre>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="版本历史">
            <Table rowKey="version" columns={versionColumns} dataSource={[
              { version:'v3', updatedAt:'2026-07-15', author:'admin', note:'优化输出格式为JSON' },
              { version:'v2', updatedAt:'2026-07-01', author:'admin', note:'增加摘要变量' },
              { version:'v1', updatedAt:'2026-06-15', author:'admin', note:'初始版本' },
            ]} size="small" pagination={false} />
          </Card>
        </Col>
      </Row>

      <Card title={<Space><ExperimentOutlined /> A/B 测试</Space>} extra={<Button size="small" type="primary" icon={<PlusOutlined />}>新建测试</Button>} style={{ marginTop: 16 }}>
        <Table rowKey="name" columns={abColumns} dataSource={[
          { name:'标签提取优化', a:'v2', b:'v3', status:'运行中', samples:'500', aRate:'67%', result:'B 更优' },
          { name:'情感分析对比', a:'v1', b:'v2', status:'已完成', samples:'1000', aRate:'58%', result:'B 更优' },
        ]} size="small" pagination={false} />
      </Card>
    </PageContainer>
  );
};

export default AIPromptPage;
