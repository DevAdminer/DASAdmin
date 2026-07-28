import React from "react";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Button, Tag, Table, Card, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AIExtractionPage: React.FC = () => {
  const cols = [
    { title:'任务ID', dataIndex:'id', key:'id', render:(v:string)=><code>{v}</code> },
    { title:'类型', dataIndex:'type', key:'type', render:(v:string)=><Tag color={v==='NER'?'purple':v==='OCR'?'cyan':'blue'}>{v}</Tag> },
    { title:'名称', dataIndex:'name', key:'name' },
    { title:'模型', dataIndex:'model', key:'model' },
    { title:'状态', dataIndex:'status', key:'status', render:(v:string)=><Tag color={v==='成功'?'green':v==='运行中'?'gold':'default'}>{v}</Tag> },
    { title:'处理量', dataIndex:'count', key:'count' },
    { title:'准确率', dataIndex:'accuracy', key:'accuracy' },
    { title:'操作', key:'action', render:()=><a>详情</a> },
  ];
  return (
    <PageContainer header={{ title:'信息抽取', subTitle:'NER / OCR / 关系抽取 / 自定义 Schema' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>新建抽取任务</Button>]}>
      <Row gutter={16} style={{marginBottom:16}}>
        <Col span={6}><StatisticCard statistic={{title:'总抽取', value:'128,532'}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'NER 实体', value:'89,234', valueStyle:{color:'#722ed1'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'OCR', value:'5,678', valueStyle:{color:'#fa8c16'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'关系抽取', value:'33,620', valueStyle:{color:'#13c2c2'}}} /></Col>
      </Row>
      <Table rowKey="id" columns={cols} dataSource={[
        {id:'EXT-001',type:'NER',name:'公司名实体抽取',model:'gpt-4o-mini',status:'成功',count:'45.6K',accuracy:'96.2%'},
        {id:'EXT-002',type:'NER',name:'人名实体抽取',model:'gpt-4o-mini',status:'成功',count:'23.1K',accuracy:'94.8%'},
        {id:'EXT-003',type:'OCR',name:'图片文字识别',model:'claude-3-haiku',status:'成功',count:'5.6K',accuracy:'98.5%'},
        {id:'EXT-004',type:'关系抽取',name:'公司-人物关系',model:'gpt-4o',status:'运行中',count:'12.3K',accuracy:'-'},
        {id:'EXT-005',type:'自定义',name:'产品参数提取',model:'qwen-max',status:'成功',count:'8.9K',accuracy:'92.1%'},
      ]} pagination={false} size="middle" />

      <Card title="抽取结果示例 · NER" style={{ marginTop: 16 }}>
        <div style={{ padding:12, background:'#fafafa', borderRadius:8, marginBottom:16 }}>
          <Text strong>原文：</Text>OpenAI 发布 GPT-5 模型，CEO Sam Altman 表示这是最具突破性的版本。
        </div>
        <Table rowKey="entity" dataSource={[
          {entity:'OpenAI',type:'ORG(组织)',pos:'0-6',confidence:'99.2%'},
          {entity:'GPT-5',type:'PRODUCT(产品)',pos:'10-15',confidence:'98.5%'},
          {entity:'Sam Altman',type:'PERSON(人物)',pos:'22-33',confidence:'97.8%'},
          {entity:'CEO',type:'TITLE(职位)',pos:'18-21',confidence:'95.3%'},
        ]} columns={[
          {title:'实体',dataIndex:'entity',key:'entity',render:(v:string)=><Tag>{v}</Tag>},
          {title:'类型',dataIndex:'type',key:'type'},
          {title:'位置',dataIndex:'pos',key:'pos'},
          {title:'置信度',dataIndex:'confidence',key:'confidence'},
        ]} size="small" pagination={false} />
      </Card>
    </PageContainer>
  );
};
export default AIExtractionPage;
